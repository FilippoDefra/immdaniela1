import React, { useState } from "react";
import { Download, X, Lock } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api, AGENCY, formatErr } from "../lib/api";

/**
 * Modal "gate" che raccoglie nome+email+telefono prima di scaricare il PDF
 * del risultato di un calcolatore. Il lead viene salvato in /api/contact.
 *
 * Props:
 *  - toolName: stringa (es. "Valutatore Inversione PRO")
 *  - resultSummary: stringa breve (es. "Offerta massima € 109.123")
 *  - rows: array di [label, value] per la tabella PDF
 *  - extra: object con dati input dell'utente (per il backend)
 */
export function PdfDownloadButton({ toolName, resultSummary, rows, extra }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)} data-testid="pdf-save-btn" style={{ marginTop: 16 }}>
        <Download size={16} style={{ marginRight: 6 }} /> Salva PDF
      </button>
      {open && <PdfModal toolName={toolName} resultSummary={resultSummary} rows={rows} extra={extra} onClose={() => setOpen(false)} />}
    </>
  );
}

function PdfModal({ toolName, resultSummary, rows, extra, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", gdpr: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!form.gdpr) { setError("Accetta il trattamento dati per scaricare il report."); return; }
    setLoading(true); setError("");
    try {
      // 1) Salva il lead nel backend
      await api.post("/contact", {
        kind: "tool-pdf-download",
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: `Download PDF del calcolatore: ${toolName}. Risultato: ${resultSummary}`,
        extra: { tool: toolName, result: resultSummary, ...(extra || {}) },
      });
      // 2) Genera il PDF
      generatePdf({ toolName, resultSummary, rows, name: form.name });
      onClose();
    } catch (err) {
      setError(formatErr(err));
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }} data-testid="pdf-modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Lock size={20} color="var(--accent)" />
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Chiudi"><X size={16} /></button>
        </div>
        <h3 style={{ fontSize: 28, fontFamily: "var(--font-serif)", margin: "0 0 8px" }}>Scarica il report PDF</h3>
        <p style={{ color: "var(--fg-2)", fontSize: 14, marginBottom: 24 }}>
          Il report contiene i dati che hai calcolato + il riepilogo brandizzato. Lasciaci 30 secondi i tuoi contatti — non spam, solo aggiornamenti utili sul mercato della Riviera.
        </p>
        <form onSubmit={submit} className="form" style={{ background: "transparent", border: 0, padding: 0 }}>
          <div className="cf-field"><label>Nome e cognome</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required data-testid="pdf-name" /></div>
          <div className="cf-row">
            <div className="cf-field"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required data-testid="pdf-email" /></div>
            <div className="cf-field"><label>Telefono</label><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} data-testid="pdf-phone" /></div>
          </div>
          <label className="cf-check"><input type="checkbox" checked={form.gdpr} onChange={e => setForm({ ...form, gdpr: e.target.checked })} required /> Acconsento al trattamento dati (GDPR Privacy Policy).</label>
          {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
          <button type="submit" className="btn btn-primary cf-submit" disabled={loading} data-testid="pdf-confirm">
            {loading ? "Generazione..." : <><Download size={14} style={{ marginRight: 6 }} /> Scarica il PDF</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function generatePdf({ toolName, resultSummary, rows, name }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // === HEADER: blocco oro/nero ===
  doc.setFillColor(28, 28, 28);
  doc.rect(0, 0, pageW, 38, "F");
  // Linea oro
  doc.setFillColor(184, 134, 11);
  doc.rect(0, 38, pageW, 1.2, "F");

  // Titolo brand
  doc.setFont("times", "italic");
  doc.setTextColor(184, 134, 11);
  doc.setFontSize(11);
  doc.text("DATABASE IMMOBILIARE DANIELA", 14, 16);
  doc.setFont("times", "normal");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(toolName, 14, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 200);
  doc.text(`Report personalizzato per ${name || "—"}  ·  ${new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}`, 14, 33);

  // === RESULT PRINCIPALE ===
  doc.setTextColor(28, 28, 28);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RISULTATO", 14, 52);
  doc.setFont("times", "normal");
  doc.setFontSize(28);
  doc.setTextColor(184, 134, 11);
  doc.text(resultSummary, 14, 64);

  // Linea oro divider
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(0.4);
  doc.line(14, 70, 60, 70);

  // === TABELLA DETTAGLIO ===
  if (rows && rows.length > 0) {
    autoTable(doc, {
      startY: 80,
      head: [["Voce", "Importo / Valore"]],
      body: rows,
      theme: "plain",
      headStyles: {
        fillColor: [28, 28, 28], textColor: [184, 134, 11],
        fontSize: 9, fontStyle: "bold", halign: "left",
      },
      bodyStyles: {
        fontSize: 10, textColor: [60, 60, 60], cellPadding: 3,
      },
      alternateRowStyles: { fillColor: [250, 250, 247] },
      columnStyles: { 1: { halign: "right", fontStyle: "bold", textColor: [28, 28, 28] } },
      margin: { left: 14, right: 14 },
    });
  }

  // === FOOTER ===
  const footerY = pageH - 28;
  doc.setFillColor(250, 250, 247);
  doc.rect(0, footerY, pageW, 28, "F");
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(0.6);
  doc.line(0, footerY, pageW, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(184, 134, 11);
  doc.text("CONTATTACI PER UNA VALUTAZIONE PRECISA", 14, footerY + 7);

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(28, 28, 28);
  doc.text(AGENCY.legalName, 14, footerY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${AGENCY.address}  ·  Tel: ${AGENCY.phone}  ·  WhatsApp: ${AGENCY.mobile}`, 14, footerY + 19);
  doc.text(`Email: ${AGENCY.email}  ·  P.IVA ${AGENCY.piva}`, 14, footerY + 24);

  // Disclaimer
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.setFont("helvetica", "italic");
  doc.text("Stima orientativa basata su parametri standard. Per valutazioni precise contatta l'agenzia per un sopralluogo.", 14, footerY - 4);

  // Salva
  const safeName = toolName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`${safeName}-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
