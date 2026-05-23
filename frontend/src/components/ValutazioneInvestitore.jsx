import React, { useState, useMemo } from "react";
import { User, Home as HomeIcon, FileText, Settings, AlertCircle, CheckCircle2, Banknote, Calculator } from "lucide-react";
import { PdfDownloadButton } from "./PdfDownloadButton";

function formatEuro(n) {
  const v = Math.round(n);
  return (v < 0 ? "-€ " : "€ ") + Math.abs(v).toLocaleString("it-IT").replace(/,/g, ".");
}
function formatEuroSign(n) {
  const v = Math.round(n);
  return (v >= 0 ? "+€ " : "-€ ") + Math.abs(v).toLocaleString("it-IT").replace(/,/g, ".");
}

export default function ValutazioneInvestitore() {
  const [info, setInfo] = useState({ cliente: "", indirizzo: "", proprietà: "", data: new Date().toISOString().slice(0, 10) });
  const [tech, setTech] = useState({
    prezzoRich: "", sqm: "", renditaCat: "", coeffCat: "115.5",
    prezzoVendita: "", primaCasa: false, daImpresa: false,
  });
  const [costiAcq, setCostiAcq] = useState({
    notaioAcq: 2500, periziaImmobile: 350, visure: 80,
    speseMutuoIstruttoria: 600, speseMutuoPerizia: 280, speseMutuoBollo: 50,
    accollomutuo: 0, importoMutuo: 0, tassoAnnuo: 4.2, mesiImmobilizzo: 12,
  });
  const [costiRistr, setCostiRistr] = useState({
    ristrutturazione: "", speseTecniche: 2500, oneriComunali: 800,
    apeEnea: 350, accatastamento: 650, dlSicurezza: 1200,
  });
  const [costiVen, setCostiVen] = useState({
    commissioneAg: 4, ivaCommissione: 22, certificazioni: 280,
    homeStaging: 0, fotoVirtual: 0,
  });
  const [profitto, setProfitto] = useState({
    profittoMin: 30000, imuMensile: 80, condominio: 30,
    spesaUtenzeMese: 50,
  });

  const [open, setOpen] = useState({ acq: false, ristr: false, ven: false, prof: false });
  const tg = (k) => setOpen({ ...open, [k]: !open[k] });

  const result = useMemo(() => {
    const prezzoRich = parseFloat(tech.prezzoRich) || 0;
    const renditaCat = parseFloat(tech.renditaCat) || 0;
    const coeffCat = parseFloat(tech.coeffCat) || 115.5;
    const prezzoVendita = parseFloat(tech.prezzoVendita) || 0;

    const valoreCat = renditaCat * coeffCat;

    // Imposte d'acquisto
    const aliqRegistro = tech.primaCasa ? 0.02 : 0.09;
    const imposteAcquisto = tech.daImpresa
      ? (prezzoRich * (tech.primaCasa ? 0.04 : 0.10)) + 600 // IVA + ipo+cat 200x3 fissi
      : (valoreCat * aliqRegistro) + 100; // registro + ipo 50 + cat 50

    const notaioAcq = parseFloat(costiAcq.notaioAcq) || 0;
    const periziaImm = parseFloat(costiAcq.periziaImmobile) || 0;
    const visure = parseFloat(costiAcq.visure) || 0;
    const speseMutuoTotali = (parseFloat(costiAcq.speseMutuoIstruttoria) || 0) + (parseFloat(costiAcq.speseMutuoPerizia) || 0) + (parseFloat(costiAcq.speseMutuoBollo) || 0);

    // Costi finanziari mutuo
    const importoMutuo = parseFloat(costiAcq.importoMutuo) || 0;
    const mesi = parseFloat(costiAcq.mesiImmobilizzo) || 12;
    const tassoAnnuo = parseFloat(costiAcq.tassoAnnuo) || 0;
    const interessiMutuo = importoMutuo * (tassoAnnuo / 100) * (mesi / 12);
    const impSostMutuo = importoMutuo * (tech.primaCasa ? 0.0025 : 0.02);

    const totAcquisto = notaioAcq + periziaImm + visure + speseMutuoTotali + imposteAcquisto + interessiMutuo + impSostMutuo;

    // Ristrutturazione
    const ristrutturazione = parseFloat(costiRistr.ristrutturazione) || 0;
    const speseTec = parseFloat(costiRistr.speseTecniche) || 0;
    const oneri = parseFloat(costiRistr.oneriComunali) || 0;
    const apeEnea = parseFloat(costiRistr.apeEnea) || 0;
    const accat = parseFloat(costiRistr.accatastamento) || 0;
    const dl = parseFloat(costiRistr.dlSicurezza) || 0;
    const totRistr = ristrutturazione + speseTec + oneri + apeEnea + accat + dl;

    // Costi vendita
    const commCommissione = (parseFloat(costiVen.commissioneAg) || 0) / 100;
    const ivaComm = (parseFloat(costiVen.ivaCommissione) || 0) / 100;
    const commissioneAg = prezzoVendita * commCommissione * (1 + ivaComm);
    const certificazioni = parseFloat(costiVen.certificazioni) || 0;
    const homeStaging = parseFloat(costiVen.homeStaging) || 0;
    const fotoVirt = parseFloat(costiVen.fotoVirtual) || 0;
    const totVen = commissioneAg + certificazioni + homeStaging + fotoVirt;

    // Costi tenuta (durante immobilizzo)
    const imu = (parseFloat(profitto.imuMensile) || 0) * mesi;
    const cond = (parseFloat(profitto.condominio) || 0) * mesi;
    const utenze = (parseFloat(profitto.spesaUtenzeMese) || 0) * mesi;
    const totTenuta = imu + cond + utenze;

    const profittoMin = parseFloat(profitto.profittoMin) || 0;

    // PrezzoMax = prezzoVendita - totAcquisto - totRistr - totVen - totTenuta - profittoMin
    const prezzoMax = prezzoVendita - totAcquisto - totRistr - totVen - totTenuta - profittoMin;
    const differenza = prezzoMax - prezzoRich;
    const isOk = differenza >= 0;
    const percDiff = prezzoRich > 0 ? Math.abs(differenza / prezzoRich * 100) : 0;
    const totSpese = totAcquisto + totRistr + totVen + totTenuta;
    const roi = prezzoMax > 0 ? (profittoMin / (prezzoMax + totAcquisto + totRistr)) * 100 : 0;

    return {
      valoreCat, imposteAcquisto, notaioAcq, periziaImm, visure, speseMutuoTotali, interessiMutuo, impSostMutuo, totAcquisto,
      ristrutturazione, speseTec, oneri, apeEnea, accat, dl, totRistr,
      commissioneAg, certificazioni, homeStaging, fotoVirt, totVen,
      imu, cond, utenze, totTenuta,
      profittoMin, totSpese, roi,
      prezzoMax, prezzoVendita, prezzoRich, differenza, isOk, percDiff,
    };
  }, [tech, costiAcq, costiRistr, costiVen, profitto]);

  const pdfRows = useMemo(() => {
    const r = result;
    return [
      ["Cliente", info.cliente || "—"],
      ["Proprietà", info.indirizzo || "—"],
      ["Data analisi", info.data],
      [" ", " "],
      ["▸ Prezzo richiesto venditore", formatEuro(r.prezzoRich)],
      ["▸ Prezzo vendita previsto", formatEuro(r.prezzoVendita)],
      ["▸ Valore catastale calcolato", formatEuro(r.valoreCat)],
      [" ", " "],
      ["= Costi di acquisto", formatEuro(r.totAcquisto)],
      ["  Imposte (registro/IVA + ipo/cat)", formatEuro(r.imposteAcquisto)],
      ["  Notaio + perizia + visure", formatEuro(r.notaioAcq + r.periziaImm + r.visure)],
      ["  Costi mutuo + interessi", formatEuro(r.speseMutuoTotali + r.interessiMutuo + r.impSostMutuo)],
      [" ", " "],
      ["= Costi di ristrutturazione", formatEuro(r.totRistr)],
      ["  Lavori", formatEuro(r.ristrutturazione)],
      ["  Spese tecniche + oneri + APE", formatEuro(r.speseTec + r.oneri + r.apeEnea + r.accat + r.dl)],
      [" ", " "],
      ["= Costi di vendita", formatEuro(r.totVen)],
      ["  Commissione agenzia", formatEuro(r.commissioneAg)],
      [" ", " "],
      ["= Costi di tenuta", formatEuro(r.totTenuta)],
      [" ", " "],
      ["= Profitto minimo investitore", formatEuro(r.profittoMin)],
      [" ", " "],
      ["PREZZO MASSIMO INVESTITORE", formatEuro(r.prezzoMax)],
      ["Differenza con richiesta venditore", formatEuroSign(r.differenza)],
      ["ROI stimato", `${r.roi.toFixed(2)}%`],
    ];
  }, [info, result]);

  return (
    <div data-testid="invest-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="invest-grid">
      {/* === COLONNA SINISTRA: INPUT === */}
      <div>
        <h3 style={{ fontSize: 24, fontFamily: "var(--font-serif)", marginBottom: 4 }}>Dati della Proprietà</h3>
        <p className="t-meta" style={{ marginBottom: 24 }}>Compila tutte le sezioni per un'analisi completa</p>

        {/* Cliente */}
        <div className="invest-section">
          <div className="invest-section-head"><User size={16} /> <span>Informazioni Cliente e Proprietà</span></div>
          <div className="cf-row">
            <div className="cf-field"><label>Nome cliente</label><input value={info.cliente} onChange={e => setInfo({ ...info, cliente: e.target.value })} placeholder="Mario Rossi" data-testid="invest-cliente" /></div>
            <div className="cf-field"><label>Data analisi</label><input type="date" value={info.data} onChange={e => setInfo({ ...info, data: e.target.value })} /></div>
          </div>
          <div className="cf-field"><label>Indirizzo immobile</label><input value={info.indirizzo} onChange={e => setInfo({ ...info, indirizzo: e.target.value })} placeholder="Via, civico, città" /></div>
        </div>

        {/* Tecnici */}
        <div className="invest-section">
          <div className="invest-section-head"><FileText size={16} /> <span>Dati Tecnici Immobile</span></div>
          <div className="cf-row">
            <div className="cf-field"><label>Prezzo richiesto venditore (€)</label><input type="number" value={tech.prezzoRich} onChange={e => setTech({ ...tech, prezzoRich: e.target.value })} placeholder="200000" data-testid="invest-prezzoRich" /></div>
            <div className="cf-field"><label>Superficie (mq)</label><input type="number" value={tech.sqm} onChange={e => setTech({ ...tech, sqm: e.target.value })} placeholder="80" /></div>
          </div>
          <div className="cf-row">
            <div className="cf-field"><label>Rendita catastale (€)</label><input type="number" step="0.01" value={tech.renditaCat} onChange={e => setTech({ ...tech, renditaCat: e.target.value })} placeholder="630.50" /></div>
            <div className="cf-field"><label>Coefficiente catastale</label>
              <select value={tech.coeffCat} onChange={e => setTech({ ...tech, coeffCat: e.target.value })}>
                <option value="115.5">115,5 (prima casa)</option>
                <option value="126">126 (seconda casa A/1-A/9)</option>
                <option value="63">63 (cat. C/1 - negozi)</option>
                <option value="42">42 (cat. A/10 - uffici)</option>
                <option value="60">60 (cat. B/D)</option>
              </select>
            </div>
          </div>
          <div className="cf-field"><label>Prezzo vendita previsto post-ristrutturazione (€)</label><input type="number" value={tech.prezzoVendita} onChange={e => setTech({ ...tech, prezzoVendita: e.target.value })} placeholder="350000" data-testid="invest-prezzoVendita" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label className="cf-check" style={{ marginBottom: 0 }}><input type="checkbox" checked={tech.primaCasa} onChange={e => setTech({ ...tech, primaCasa: e.target.checked })} /> Acquisto come prima casa</label>
            <label className="cf-check" style={{ marginBottom: 0 }}><input type="checkbox" checked={tech.daImpresa} onChange={e => setTech({ ...tech, daImpresa: e.target.checked })} /> Acquisto da impresa (con IVA)</label>
          </div>
        </div>

        {/* Costi acquisto avanzati */}
        <div className="invest-section">
          <button type="button" className="invest-section-head invest-toggle" onClick={() => tg("acq")}>
            <Banknote size={16} /> <span>Costi di Acquisto (Notaio, Mutuo, Imposte)</span>
            <span style={{ marginLeft: "auto", color: "var(--accent)" }}>{open.acq ? "−" : "+"}</span>
          </button>
          {open.acq && (
            <div style={{ paddingTop: 12 }}>
              <div className="cf-row">
                <div className="cf-field"><label>Onorario notaio acquisto (€)</label><input type="number" value={costiAcq.notaioAcq} onChange={e => setCostiAcq({ ...costiAcq, notaioAcq: e.target.value })} /></div>
                <div className="cf-field"><label>Perizia immobile (€)</label><input type="number" value={costiAcq.periziaImmobile} onChange={e => setCostiAcq({ ...costiAcq, periziaImmobile: e.target.value })} /></div>
              </div>
              <div className="cf-field"><label>Visure ipotecarie e catastali (€)</label><input type="number" value={costiAcq.visure} onChange={e => setCostiAcq({ ...costiAcq, visure: e.target.value })} /></div>

              <div style={{ marginTop: 12, padding: 14, background: "var(--bg-sunken)", borderRadius: 6 }}>
                <div className="t-eyebrow" style={{ marginBottom: 10 }}>Mutuo (opzionale)</div>
                <div className="cf-row">
                  <div className="cf-field"><label>Importo mutuo (€)</label><input type="number" value={costiAcq.importoMutuo} onChange={e => setCostiAcq({ ...costiAcq, importoMutuo: e.target.value })} /></div>
                  <div className="cf-field"><label>Tasso annuo (%)</label><input type="number" step="0.01" value={costiAcq.tassoAnnuo} onChange={e => setCostiAcq({ ...costiAcq, tassoAnnuo: e.target.value })} /></div>
                </div>
                <div className="cf-row">
                  <div className="cf-field"><label>Mesi di immobilizzo</label><input type="number" value={costiAcq.mesiImmobilizzo} onChange={e => setCostiAcq({ ...costiAcq, mesiImmobilizzo: e.target.value })} /></div>
                  <div className="cf-field"><label>Spese istruttoria (€)</label><input type="number" value={costiAcq.speseMutuoIstruttoria} onChange={e => setCostiAcq({ ...costiAcq, speseMutuoIstruttoria: e.target.value })} /></div>
                </div>
                <div className="cf-row">
                  <div className="cf-field"><label>Perizia banca (€)</label><input type="number" value={costiAcq.speseMutuoPerizia} onChange={e => setCostiAcq({ ...costiAcq, speseMutuoPerizia: e.target.value })} /></div>
                  <div className="cf-field"><label>Imposte di bollo mutuo (€)</label><input type="number" value={costiAcq.speseMutuoBollo} onChange={e => setCostiAcq({ ...costiAcq, speseMutuoBollo: e.target.value })} /></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Costi ristrutturazione */}
        <div className="invest-section">
          <button type="button" className="invest-section-head invest-toggle" onClick={() => tg("ristr")}>
            <HomeIcon size={16} /> <span>Costi di Ristrutturazione e Pratiche</span>
            <span style={{ marginLeft: "auto", color: "var(--accent)" }}>{open.ristr ? "−" : "+"}</span>
          </button>
          {open.ristr && (
            <div style={{ paddingTop: 12 }}>
              <div className="cf-field"><label>Costi ristrutturazione (€) <span style={{ fontSize: 10, color: "var(--fg-3)" }}>— usa il Capitolato per stima precisa</span></label><input type="number" value={costiRistr.ristrutturazione} onChange={e => setCostiRistr({ ...costiRistr, ristrutturazione: e.target.value })} placeholder="80000" /></div>
              <div className="cf-row">
                <div className="cf-field"><label>Spese tecniche (CILA/SCIA + DL) (€)</label><input type="number" value={costiRistr.speseTecniche} onChange={e => setCostiRistr({ ...costiRistr, speseTecniche: e.target.value })} /></div>
                <div className="cf-field"><label>Oneri comunali (€)</label><input type="number" value={costiRistr.oneriComunali} onChange={e => setCostiRistr({ ...costiRistr, oneriComunali: e.target.value })} /></div>
              </div>
              <div className="cf-row">
                <div className="cf-field"><label>APE + ENEA (€)</label><input type="number" value={costiRistr.apeEnea} onChange={e => setCostiRistr({ ...costiRistr, apeEnea: e.target.value })} /></div>
                <div className="cf-field"><label>Accatastamento DOCFA (€)</label><input type="number" value={costiRistr.accatastamento} onChange={e => setCostiRistr({ ...costiRistr, accatastamento: e.target.value })} /></div>
              </div>
              <div className="cf-field"><label>Direttore lavori e sicurezza (€)</label><input type="number" value={costiRistr.dlSicurezza} onChange={e => setCostiRistr({ ...costiRistr, dlSicurezza: e.target.value })} /></div>
            </div>
          )}
        </div>

        {/* Costi vendita */}
        <div className="invest-section">
          <button type="button" className="invest-section-head invest-toggle" onClick={() => tg("ven")}>
            <Calculator size={16} /> <span>Costi di Vendita (Commissioni, Marketing)</span>
            <span style={{ marginLeft: "auto", color: "var(--accent)" }}>{open.ven ? "−" : "+"}</span>
          </button>
          {open.ven && (
            <div style={{ paddingTop: 12 }}>
              <div className="cf-row">
                <div className="cf-field"><label>Commissione agenzia (%)</label><input type="number" step="0.1" value={costiVen.commissioneAg} onChange={e => setCostiVen({ ...costiVen, commissioneAg: e.target.value })} /></div>
                <div className="cf-field"><label>IVA su commissione (%)</label><input type="number" step="0.1" value={costiVen.ivaCommissione} onChange={e => setCostiVen({ ...costiVen, ivaCommissione: e.target.value })} /></div>
              </div>
              <div className="cf-row">
                <div className="cf-field"><label>Certificazioni (CDU, urb.) (€)</label><input type="number" value={costiVen.certificazioni} onChange={e => setCostiVen({ ...costiVen, certificazioni: e.target.value })} /></div>
                <div className="cf-field"><label>Home staging (€)</label><input type="number" value={costiVen.homeStaging} onChange={e => setCostiVen({ ...costiVen, homeStaging: e.target.value })} /></div>
              </div>
              <div className="cf-field"><label>Foto/Video professionali + virtual tour (€)</label><input type="number" value={costiVen.fotoVirtual} onChange={e => setCostiVen({ ...costiVen, fotoVirtual: e.target.value })} /></div>
            </div>
          )}
        </div>

        {/* Profitto e tenuta */}
        <div className="invest-section">
          <button type="button" className="invest-section-head invest-toggle" onClick={() => tg("prof")}>
            <Settings size={16} /> <span>Profitto e Costi di Tenuta</span>
            <span style={{ marginLeft: "auto", color: "var(--accent)" }}>{open.prof ? "−" : "+"}</span>
          </button>
          {open.prof && (
            <div style={{ paddingTop: 12 }}>
              <div className="cf-field"><label>Profitto minimo investitore (€)</label><input type="number" value={profitto.profittoMin} onChange={e => setProfitto({ ...profitto, profittoMin: e.target.value })} /></div>
              <div className="cf-row">
                <div className="cf-field"><label>IMU mensile (€)</label><input type="number" value={profitto.imuMensile} onChange={e => setProfitto({ ...profitto, imuMensile: e.target.value })} /></div>
                <div className="cf-field"><label>Spese condominiali mese (€)</label><input type="number" value={profitto.condominio} onChange={e => setProfitto({ ...profitto, condominio: e.target.value })} /></div>
              </div>
              <div className="cf-field"><label>Utenze base/mese durante immobilizzo (€)</label><input type="number" value={profitto.spesaUtenzeMese} onChange={e => setProfitto({ ...profitto, spesaUtenzeMese: e.target.value })} /></div>
            </div>
          )}
        </div>
      </div>

      {/* === COLONNA DESTRA: RISULTATI === */}
      <div>
        <h3 style={{ fontSize: 24, fontFamily: "var(--font-serif)", marginBottom: 4 }}>Analisi dell'Investimento</h3>
        <p className="t-meta" style={{ marginBottom: 24 }}>Calcolo automatico in tempo reale</p>

        {/* Cliente recap */}
        <div style={{ padding: 20, background: "var(--accent-soft)", border: "1px solid var(--border-gold)", borderRadius: 8, marginBottom: 16 }}>
          <div className="t-eyebrow" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gold-700)", marginBottom: 12 }}><User size={14} /> Dettagli Valutazione</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><div style={{ fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Cliente</div><strong>{info.cliente || "—"}</strong></div>
            <div><div style={{ fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Proprietà</div><strong>{info.indirizzo || "—"}</strong></div>
          </div>
        </div>

        {/* Box risultato */}
        <div className={`invest-result-main ${result.isOk ? "ok" : "ko"}`} data-testid="invest-result">
          <div className="t-eyebrow" style={{ display: "flex", alignItems: "center", gap: 6, color: result.isOk ? "var(--success)" : "var(--danger)" }}>
            {result.isOk ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            Prezzo Massimo Investitore
          </div>
          <div className="invest-result-num">{formatEuro(result.prezzoMax)}</div>
          {result.prezzoRich > 0 && (
            <div style={{ fontSize: 13, color: result.isOk ? "var(--success)" : "var(--danger)", marginTop: 8 }}>
              {result.isOk
                ? `Acquistabile con margine: ${formatEuro(result.differenza)} disponibili (${result.percDiff.toFixed(1)}%)`
                : `Prezzo richiesto troppo alto di ${formatEuro(Math.abs(result.differenza))} (${result.percDiff.toFixed(1)}%)`
              }
            </div>
          )}
          {result.profittoMin > 0 && result.prezzoMax > 0 && (
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 6 }}>ROI stimato: <strong>{result.roi.toFixed(2)}%</strong> sul capitale impiegato</div>
          )}
        </div>

        {/* Tabella dettagli */}
        <table className="invest-table">
          <thead><tr><th>Voce di costo</th><th style={{ textAlign: "right" }}>Importo</th></tr></thead>
          <tbody>
            <tr style={{ background: "var(--bg-sunken)", fontWeight: 600 }}><td colSpan="2">Prezzo finale di vendita</td></tr>
            <tr><td>+ Prezzo vendita previsto</td><td style={{ color: "var(--success)" }}>+{formatEuro(result.prezzoVendita)}</td></tr>

            <tr style={{ background: "var(--bg-sunken)", fontWeight: 600 }}><td colSpan="2">Costi di acquisto totali</td></tr>
            <tr><td>− Imposte (registro/IVA + ipo + cat)</td><td style={{ color: "var(--danger)" }}>−{formatEuro(result.imposteAcquisto)}</td></tr>
            <tr><td>− Notaio acquisto</td><td style={{ color: "var(--danger)" }}>−{formatEuro(result.notaioAcq)}</td></tr>
            <tr><td>− Perizia immobile + visure</td><td style={{ color: "var(--danger)" }}>−{formatEuro(result.periziaImm + result.visure)}</td></tr>
            {result.speseMutuoTotali + result.interessiMutuo + result.impSostMutuo > 0 && <tr><td>− Spese mutuo + interessi + sostitutiva</td><td style={{ color: "var(--danger)" }}>−{formatEuro(result.speseMutuoTotali + result.interessiMutuo + result.impSostMutuo)}</td></tr>}

            <tr style={{ background: "var(--bg-sunken)", fontWeight: 600 }}><td colSpan="2">Costi ristrutturazione</td></tr>
            <tr><td>− Lavori di ristrutturazione</td><td style={{ color: "var(--danger)" }}>−{formatEuro(result.ristrutturazione)}</td></tr>
            <tr><td>− Spese tecniche (CILA/SCIA + DL)</td><td style={{ color: "var(--danger)" }}>−{formatEuro(result.speseTec + result.dl)}</td></tr>
            <tr><td>− Oneri + APE + Accatastamento</td><td style={{ color: "var(--danger)" }}>−{formatEuro(result.oneri + result.apeEnea + result.accat)}</td></tr>

            <tr style={{ background: "var(--bg-sunken)", fontWeight: 600 }}><td colSpan="2">Costi di vendita</td></tr>
            <tr><td>− Commissione agenzia + IVA</td><td style={{ color: "var(--danger)" }}>−{formatEuro(result.commissioneAg)}</td></tr>
            <tr><td>− Certificazioni + marketing</td><td style={{ color: "var(--danger)" }}>−{formatEuro(result.certificazioni + result.homeStaging + result.fotoVirt)}</td></tr>

            <tr style={{ background: "var(--bg-sunken)", fontWeight: 600 }}><td colSpan="2">Costi di tenuta (immobilizzo)</td></tr>
            <tr><td>− IMU + condominio + utenze</td><td style={{ color: "var(--danger)" }}>−{formatEuro(result.totTenuta)}</td></tr>

            <tr style={{ background: "var(--bg-sunken)", fontWeight: 600 }}><td colSpan="2">Profitto investitore</td></tr>
            <tr><td>− Profitto minimo richiesto</td><td style={{ color: "var(--danger)" }}>−{formatEuro(result.profittoMin)}</td></tr>

            <tr style={{ borderTop: "2px solid var(--accent)", fontWeight: 700, background: "var(--accent-soft)" }}>
              <td style={{ padding: "12px" }}>= Prezzo Massimo d'Acquisto</td>
              <td style={{ padding: "12px", color: "var(--accent)", fontFamily: "var(--font-serif)", fontSize: 18, textAlign: "right" }}>{formatEuro(result.prezzoMax)}</td>
            </tr>
            <tr><td>Prezzo richiesto venditore</td><td style={{ textAlign: "right" }}>{formatEuro(result.prezzoRich)}</td></tr>
            <tr style={{ background: result.isOk ? "rgba(79,122,74,.1)" : "rgba(162,59,44,.1)", fontWeight: 700 }}>
              <td style={{ padding: "10px" }}>Differenza (margine acquirente)</td>
              <td style={{ padding: "10px", textAlign: "right", color: result.isOk ? "var(--success)" : "var(--danger)" }}>{formatEuroSign(result.differenza)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 20, padding: 16, background: "var(--bg-sunken)", borderRadius: 8, fontSize: 12, color: "var(--fg-3)", lineHeight: 1.6 }}>
          <strong>Come funziona il calcolo:</strong> partiamo dal prezzo finale di vendita previsto e sottraiamo TUTTI i costi reali dell'operazione (acquisto, ristrutturazione, vendita, tenuta) e il profitto minimo. Quello che resta è la cifra massima che un investitore razionale può pagare per l'immobile.
        </div>

        {result.prezzoVendita > 0 && (
          <PdfDownloadButton
            toolName="Sistema Valutazione Investitore PRO"
            resultSummary={formatEuro(result.prezzoMax)}
            rows={pdfRows}
            extra={{ cliente: info.cliente, indirizzo: info.indirizzo, prezzoMax: result.prezzoMax, isOk: result.isOk, roi: result.roi }}
          />
        )}
      </div>
    </div>
  );
}
