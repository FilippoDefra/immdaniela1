import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatErr, AGENCY } from "../lib/api";

function ContactBase({ kind, eyebrow, title, lead, defaultMessage, fields = [], extraInfo }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: defaultMessage || "", ...Object.fromEntries(fields.map(f => [f.key, ""])) });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const extra = Object.fromEntries(fields.map(f => [f.key, form[f.key]]));
    try {
      await api.post("/contact", {
        kind, name: form.name, email: form.email, phone: form.phone, message: form.message, extra
      });
      setSent(true);
    } catch (err) { setError(formatErr(err)); }
  };

  return (
    <section className="container" style={{ padding: "64px 32px 96px" }} data-testid={`form-${kind}`}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 64 }} className="contact-grid">
        <div>
          <span className="t-eyebrow">{eyebrow}</span>
          <hr className="rule-gold" />
          <h1 style={{ fontSize: 48 }}>{title}</h1>
          <p className="t-lead">{lead}</p>

          {extraInfo}

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--divider)" }}>
            <p className="t-meta">Preferisci una chiamata?</p>
            <a href={`tel:${AGENCY.phoneDial}`} className="btn btn-ghost" style={{ marginTop: 8 }}>{AGENCY.phone}</a>
          </div>
        </div>

        <form className="form" onSubmit={submit}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <span className="t-eyebrow" style={{ color: "var(--success)" }}>Inviato</span>
              <h3 style={{ fontSize: 28, marginTop: 8, fontFamily: "var(--font-serif)" }}>Grazie {form.name}.</h3>
              <p style={{ color: "var(--fg-2)" }}>Ti rispondiamo entro la giornata lavorativa.</p>
              <button type="button" className="btn btn-ghost" onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: defaultMessage || "" }); }}>Nuova richiesta</button>
            </div>
          ) : (
            <>
              <div className="cf-field"><label>Nome e cognome</label><input value={form.name} onChange={upd("name")} required data-testid="form-name" /></div>
              <div className="cf-row">
                <div className="cf-field"><label>Email</label><input type="email" value={form.email} onChange={upd("email")} required data-testid="form-email" /></div>
                <div className="cf-field"><label>Telefono</label><input type="tel" value={form.phone} onChange={upd("phone")} data-testid="form-phone" /></div>
              </div>
              {fields.map(f => (
                <div key={f.key} className="cf-field">
                  <label>{f.label}</label>
                  {f.type === "select" ? (
                    <select value={form[f.key]} onChange={upd(f.key)} data-testid={`form-${f.key}`}>
                      <option value="">--</option>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type || "text"} value={form[f.key]} onChange={upd(f.key)} placeholder={f.placeholder} data-testid={`form-${f.key}`} />
                  )}
                </div>
              ))}
              <div className="cf-field"><label>Messaggio</label><textarea value={form.message} onChange={upd("message")} data-testid="form-message" /></div>
              <label className="cf-check"><input type="checkbox" required /> Acconsento al trattamento dei dati (GDPR Privacy Policy).</label>
              {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
              <button type="submit" className="btn btn-primary cf-submit" data-testid="form-submit">Invia richiesta</button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

export function ContactPage() {
  return (
    <ContactBase
      kind="contact"
      eyebrow="Parliamone"
      title="Scrivici, oppure passa in agenzia."
      lead="Rispondiamo entro la giornata lavorativa."
      defaultMessage=""
      extraInfo={
        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--divider)" }}>
            <div style={{ minWidth: 140, fontSize: 11, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--fg-3)" }}>Sede</div>
            <div>{AGENCY.address}</div>
          </div>
          <div style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--divider)" }}>
            <div style={{ minWidth: 140, fontSize: 11, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--fg-3)" }}>Telefono</div>
            <div><a href={`tel:${AGENCY.phoneDial}`} style={{ color: "var(--accent)" }}>{AGENCY.phone}</a></div>
          </div>
          <div style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--divider)" }}>
            <div style={{ minWidth: 140, fontSize: 11, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--fg-3)" }}>Mobile / WhatsApp</div>
            <div><a href={`https://wa.me/${AGENCY.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>{AGENCY.mobile}</a></div>
          </div>
          <div style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--divider)" }}>
            <div style={{ minWidth: 140, fontSize: 11, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--fg-3)" }}>Email</div>
            <div>{AGENCY.email}</div>
          </div>
          <div style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--divider)" }}>
            <div style={{ minWidth: 140, fontSize: 11, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--fg-3)" }}>P.IVA</div>
            <div>{AGENCY.piva}</div>
          </div>
        </div>
      }
    />
  );
}

export function AcquisizioniPage() {
  return (
    <ContactBase
      kind="valuation"
      eyebrow="Valuta il tuo immobile"
      title="Richiedi una valutazione gratuita."
      lead="Strategia di prezzo, analisi di mercato e clienti già pronti. Senza impegno."
      defaultMessage="Vorrei una valutazione gratuita del mio immobile."
      fields={[
        { key: "address", label: "Indirizzo immobile", placeholder: "Via, civico, città" },
        { key: "property_type", label: "Tipologia", type: "select", options: ["Appartamento", "Villa", "Casa indipendente", "Locale commerciale", "Terreno", "Altro"] },
        { key: "sqm", label: "Superficie (mq)", placeholder: "es. 80" },
      ]}
    />
  );
}

export function SegnalaPage() {
  return (
    <ContactBase
      kind="report"
      eyebrow="Segnala un immobile"
      title="Conosci un immobile? Segnalalo."
      lead="Abbiamo clienti reali in attesa. La tua segnalazione vale."
      defaultMessage="Vorrei segnalare un immobile."
      fields={[
        { key: "zone", label: "Zona", placeholder: "es. Loano centro" },
        { key: "property_type", label: "Tipologia", type: "select", options: ["Appartamento", "Villa", "Casa indipendente", "Palazzina", "Locale commerciale", "Terreno"] },
      ]}
    />
  );
}
