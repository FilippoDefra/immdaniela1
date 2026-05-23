import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Home as HomeIcon, Hammer, TrendingUp, Scale, BarChart3, FileText, Download, Calculator } from "lucide-react";
import { PdfDownloadButton } from "../components/PdfDownloadButton";
import CapitolatoRistruttura from "../components/CapitolatoRistruttura";
import ValutazioneInvestitore from "../components/ValutazioneInvestitore";

const TOOLS = {
  valutazione: { name: "Valuta il tuo immobile", desc: "Stima orientativa del valore di mercato per zona, tipologia e mq.", icon: HomeIcon },
  ristruttura: { name: "Ristruttura Casa con Prezzi", desc: "Costi dettagliati di ristrutturazione per tipologia di intervento e qualità.", icon: Hammer },
  inversione: { name: "Valutatore Inversione PRO", desc: "Calcola l'offerta massima d'acquisto considerando tutti i costi e il margine.", icon: TrendingUp },
  imposte: { name: "Spese di Acquisto Casa", desc: "Imposte, notaio e tasse complete per prima/seconda casa, da privato o impresa.", icon: Scale },
  istat: { name: "Adeguamento ISTAT", desc: "Aggiorna il canone di locazione con gli indici FOI ufficiali aggiornati.", icon: BarChart3 },
};

const ZONE_BASE = { "Loano": 3000, "Pietra Ligure": 3200, "Borghetto Santo Spirito": 2700, "Toirano": 2400, "Boissano": 2500, "Ceriale": 2700, "Finale Ligure": 3500, "Albenga": 2500, "Altro": 2400 };
const COND = { "Nuovo / Ristrutturato": 1.15, "Buono stato": 1.0, "Da rinfrescare": 0.88, "Da ristrutturare": 0.7 };

function formatEuro(n) { return "€ " + Math.round(n).toLocaleString("it-IT").replace(/,/g, "."); }
function formatEuro2(n) { return "€ " + Number(n).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export function ToolsHub() {
  return (
    <div className="container" style={{ padding: "64px 32px 96px" }} data-testid="tools-hub">
      <div style={{ maxWidth: 720, marginBottom: 48 }}>
        <span className="t-eyebrow">Strumenti gratuiti</span>
        <hr className="rule-gold" />
        <h1 style={{ fontSize: 48 }}>Calcola, simula, decidi.</h1>
        <p className="t-lead">Strumenti professionali, gratuiti, usabili subito — senza registrazione.</p>
      </div>
      <div className="tools-grid">
        {Object.entries(TOOLS).map(([k, t]) => {
          const Icon = t.icon;
          return (
            <Link key={k} to={`/strumenti/${k}`} className="tool-card" data-testid={`tool-link-${k}`}>
              <div className="tool-icon"><Icon size={22} /></div>
              <div className="tool-name">{t.name}</div>
              <div className="tool-desc">{t.desc}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ToolPage() {
  const { tool } = useParams();
  const t = TOOLS[tool];
  return (
    <div className="container" style={{ padding: "64px 32px 96px", maxWidth: tool === "ristruttura" || tool === "inversione" ? 1240 : 1040 }} data-testid={`tool-page-${tool}`}>
      <Link to="/strumenti" className="t-meta" style={{ color: "var(--accent)" }}>‹ Tutti gli strumenti</Link>
      <h1 style={{ fontSize: 48, marginTop: 16 }}>{t?.name || "Strumento"}</h1>
      <p className="t-lead" style={{ marginBottom: 32 }}>{t?.desc}</p>
      <div className={tool === "ristruttura" || tool === "inversione" ? "" : "form"} style={tool === "ristruttura" || tool === "inversione" ? {} : { background: "var(--bg-elevated)" }}>
        {tool === "valutazione" && <ValutazioneForm />}
        {tool === "ristruttura" && <CapitolatoRistruttura />}
        {tool === "inversione" && <ValutazioneInvestitore />}
        {tool === "imposte" && <SpeseAcquistoForm />}
        {tool === "istat" && <IstatProForm />}
      </div>
      <div style={{ marginTop: 24, padding: 16, background: "var(--bg-sunken)", borderRadius: 8, fontSize: 13, color: "var(--fg-3)" }}>
        ⚠️ I valori sono stime orientative basate su parametri standard di mercato. Per valutazioni precise contatta l'agenzia per un sopralluogo e una perizia tecnica.
      </div>
    </div>
  );
}

/* ============== VALUTAZIONE IMMOBILE ============== */
function ValutazioneForm() {
  const [zone, setZone] = useState("Loano");
  const [sqm, setSqm] = useState("80");
  const [cond, setCond] = useState("Buono stato");
  const [floor, setFloor] = useState("Intermedio");
  const [view, setView] = useState("Standard");
  const [parking, setParking] = useState(false);
  const [result, setResult] = useState(null);

  const calc = (e) => {
    e.preventDefault();
    const base = ZONE_BASE[zone] || 2500;
    const factor = COND[cond] || 1;
    const floorF = floor === "Ultimo con vista" ? 1.08 : floor === "Piano terra" ? 0.92 : 1;
    const viewF = view === "Vista mare" ? 1.12 : view === "Vista verde" ? 1.04 : 1;
    const parkingBonus = parking ? 1.05 : 1;
    const value = base * parseInt(sqm || 0) * factor * floorF * viewF * parkingBonus;
    setResult({ low: value * 0.92, mid: value, high: value * 1.08, base, factor, floorF, viewF, parkingBonus });
  };

  return (
    <form onSubmit={calc}>
      <div className="cf-row">
        <div className="cf-field"><label>Zona</label>
          <select value={zone} onChange={e => setZone(e.target.value)}>{Object.keys(ZONE_BASE).map(z => <option key={z}>{z}</option>)}</select>
        </div>
        <div className="cf-field"><label>Superficie (mq)</label><input type="number" value={sqm} onChange={e => setSqm(e.target.value)} required /></div>
      </div>
      <div className="cf-row">
        <div className="cf-field"><label>Stato</label>
          <select value={cond} onChange={e => setCond(e.target.value)}>{Object.keys(COND).map(c => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="cf-field"><label>Piano</label>
          <select value={floor} onChange={e => setFloor(e.target.value)}><option>Piano terra</option><option>Intermedio</option><option>Ultimo con vista</option></select>
        </div>
      </div>
      <div className="cf-row">
        <div className="cf-field"><label>Vista / Affaccio</label>
          <select value={view} onChange={e => setView(e.target.value)}><option>Standard</option><option>Vista verde</option><option>Vista mare</option></select>
        </div>
        <div className="cf-field"><label style={{ display: "block", marginBottom: 12 }}>Box / Posto auto</label>
          <label className="cf-check" style={{ marginTop: 0 }}><input type="checkbox" checked={parking} onChange={e => setParking(e.target.checked)} /> Sì, incluso</label>
        </div>
      </div>
      <button type="submit" className="btn btn-primary cf-submit">Calcola valore</button>
      {result && (
        <div className="result-box" data-testid="valuation-result">
          <span className="t-eyebrow">Stima orientativa</span>
          <h3 className="result-main">{formatEuro(result.mid)}</h3>
          <div className="result-range">Range: {formatEuro(result.low)} — {formatEuro(result.high)}</div>
          <div className="result-breakdown">
            <div><span>Base zona</span><strong>{formatEuro(result.base)}/mq</strong></div>
            <div><span>Coefficiente stato</span><strong>×{result.factor.toFixed(2)}</strong></div>
            <div><span>Coefficiente piano</span><strong>×{result.floorF.toFixed(2)}</strong></div>
            <div><span>Coefficiente vista</span><strong>×{result.viewF.toFixed(2)}</strong></div>
            <div><span>Bonus box</span><strong>×{result.parkingBonus.toFixed(2)}</strong></div>
          </div>
          <Link to="/acquisizioni" className="btn btn-primary" style={{ marginTop: 16 }}>Richiedi valutazione gratuita</Link>
        </div>
      )}
    </form>
  );
}

/* ============== RISTRUTTURA CASA ============== */
const RIST_PRICES = {
  // €/mq per livello qualità (Economica, Media, Alta)
  "Restyling estetico (tinteggio + parquet)": [220, 380, 550],
  "Ammodernamento (bagno + impianti parz.)": [550, 800, 1200],
  "Ristrutturazione parziale (½ casa)": [800, 1200, 1700],
  "Ristrutturazione totale": [1200, 1800, 2600],
  "Ricostruzione completa (struttura)": [2000, 2800, 3800],
};

function RistrutturaForm() {
  const [sqm, setSqm] = useState("80");
  const [type, setType] = useState("Ristrutturazione totale");
  const [quality, setQuality] = useState("Media");
  const [result, setResult] = useState(null);

  const qIndex = ["Economica", "Media", "Alta"].indexOf(quality);

  const calc = (e) => {
    e.preventDefault();
    const range = RIST_PRICES[type];
    const ppm = range[qIndex];
    const total = ppm * parseInt(sqm || 0);
    // Breakdown approssimativo
    const breakdown = [
      { v: "Demolizioni e smaltimento", pct: 0.08 },
      { v: "Opere murarie", pct: 0.18 },
      { v: "Impianto elettrico", pct: 0.12 },
      { v: "Impianto idraulico + sanitari", pct: 0.14 },
      { v: "Impianto termico (caldaia, termosifoni)", pct: 0.10 },
      { v: "Pavimenti e rivestimenti", pct: 0.14 },
      { v: "Infissi (finestre, porte)", pct: 0.10 },
      { v: "Tinteggi e finiture", pct: 0.06 },
      { v: "Cucina e arredo bagno (base)", pct: 0.05 },
      { v: "Direzione lavori e progettazione", pct: 0.03 },
    ];
    setResult({ ppm, total, breakdown, sqm: parseInt(sqm) });
  };

  return (
    <form onSubmit={calc}>
      <div className="cf-row">
        <div className="cf-field"><label>Superficie (mq)</label><input type="number" value={sqm} onChange={e => setSqm(e.target.value)} required min="1" /></div>
        <div className="cf-field"><label>Qualità finiture</label>
          <select value={quality} onChange={e => setQuality(e.target.value)}>
            <option>Economica</option><option>Media</option><option>Alta</option>
          </select>
        </div>
      </div>
      <div className="cf-field"><label>Tipo di intervento</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          {Object.keys(RIST_PRICES).map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
        {RIST_PRICES[type].map((p, i) => (
          <div key={i} style={{ padding: 12, background: i === qIndex ? "var(--accent-soft)" : "var(--bg-sunken)", borderRadius: 4, textAlign: "center", fontSize: 12, border: i === qIndex ? "1px solid var(--accent)" : "1px solid transparent" }}>
            <div style={{ fontWeight: 600, color: i === qIndex ? "var(--accent)" : "var(--fg-3)", letterSpacing: ".1em", textTransform: "uppercase", fontSize: 10, marginBottom: 4 }}>{["Economica", "Media", "Alta"][i]}</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600 }}>{p} €/mq</div>
          </div>
        ))}
      </div>
      <button type="submit" className="btn btn-primary cf-submit">Calcola costo ristrutturazione</button>
      {result && (
        <div className="result-box">
          <span className="t-eyebrow">Stima costo totale</span>
          <h3 className="result-main">{formatEuro(result.total)}</h3>
          <div className="result-range">{result.sqm} mq × {result.ppm} €/mq</div>
          <div style={{ marginTop: 24 }}>
            <div className="t-eyebrow" style={{ marginBottom: 12 }}>Breakdown costi (orientativo)</div>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <tbody>
                {result.breakdown.map((b, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--divider)" }}>
                    <td style={{ padding: "10px 0" }}>{b.v}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", color: "var(--fg-3)", fontSize: 12 }}>{(b.pct * 100).toFixed(0)}%</td>
                    <td style={{ padding: "10px 0", textAlign: "right", fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: 14 }}>{formatEuro(result.total * b.pct)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid var(--accent)", fontWeight: 700 }}>
                  <td style={{ padding: "12px 0", fontSize: 14 }}>TOTALE</td>
                  <td></td>
                  <td style={{ padding: "12px 0", textAlign: "right", fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--accent)" }}>{formatEuro(result.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <PdfDownloadButton
            toolName="Ristrutturazione Casa con Prezzi"
            resultSummary={formatEuro(result.total)}
            rows={[
              ["Costo totale stimato", formatEuro(result.total)],
              ["Superficie", `${result.sqm} mq`],
              ["Prezzo €/mq applicato", `${result.ppm} €/mq`],
              ["Tipo intervento", type],
              ["Qualità finiture", quality],
              ...result.breakdown.map(b => [`${b.v} (${(b.pct*100).toFixed(0)}%)`, formatEuro(result.total * b.pct)]),
            ]}
            extra={{ sqm, type, quality }}
          />
        </div>
      )}
    </form>
  );
}

/* ============== VALUTATORE INVERSIONE PRO ============== */
function InversionePROForm() {
  const [revend, setRevend] = useState("350000");
  const [sqm, setSqm] = useState("80");
  const [ristType, setRistType] = useState("Ristrutturazione totale");
  const [ristQuality, setRistQuality] = useState("Media");
  const [margine, setMargine] = useState("20");
  const [tempi, setTempi] = useState("12");
  const [primaCasa, setPrimaCasa] = useState(false);
  const [result, setResult] = useState(null);

  const calc = (e) => {
    e.preventDefault();
    const revendita = parseInt(revend) || 0;
    const mq = parseInt(sqm) || 0;
    const qIdx = ["Economica", "Media", "Alta"].indexOf(ristQuality);
    const ppm = RIST_PRICES[ristType][qIdx];
    const ristrutturazione = ppm * mq;
    const m = parseFloat(margine) / 100;
    const mesi = parseInt(tempi) || 12;

    // Provvigione di vendita (3% + IVA)
    const provvigioneVendita = revendita * 0.0366;
    // Tasse di acquisto (registro 9% o 2% prima casa, ipo+cat 100€ ciascuna da privato)
    const tasseAcquisto = primaCasa ? 0.02 : 0.09;
    // Costi notarili acquisto
    const notaioAcquisto = 2500;
    // Costi finanziari (1% per anno per immobilizzo)
    const costiFinanziari = (mesi / 12) * 0.01;
    // IMU per il periodo (0.6% / 12 * mesi)
    const imuPercent = (0.006 / 12) * mesi;
    // Margine atteso
    const utileNetto = revendita * m;

    // Calcolo: PrezzoMassimo + (PrezzoMassimo * tasseAcquisto) + notaioAcquisto + ristrutturazione + (PrezzoMassimo * imuPercent) + (PrezzoMassimo * costiFinanziari) + provvigioneVendita + utileNetto = revendita
    // PrezzoMassimo * (1 + tasseAcquisto + imuPercent + costiFinanziari) = revendita - notaioAcquisto - ristrutturazione - provvigioneVendita - utileNetto
    const numeratore = revendita - notaioAcquisto - ristrutturazione - provvigioneVendita - utileNetto;
    const denominatore = 1 + tasseAcquisto + imuPercent + costiFinanziari;
    const prezzoMax = Math.max(0, numeratore / denominatore);

    const tasseAcq_eur = prezzoMax * tasseAcquisto + 200;
    const imu_eur = prezzoMax * imuPercent;
    const fin_eur = prezzoMax * costiFinanziari;

    setResult({
      prezzoMax, ristrutturazione, tasseAcquisto: tasseAcq_eur, notaioAcquisto,
      imu: imu_eur, costiFinanziari: fin_eur, provvigioneVendita, utileNetto,
      revendita, ppm, margine: m * 100,
    });
  };

  return (
    <form onSubmit={calc}>
      <div className="cf-row">
        <div className="cf-field"><label>Valore di rivendita stimato (€)</label><input type="number" value={revend} onChange={e => setRevend(e.target.value)} required /></div>
        <div className="cf-field"><label>Superficie (mq)</label><input type="number" value={sqm} onChange={e => setSqm(e.target.value)} required /></div>
      </div>
      <div className="cf-row">
        <div className="cf-field"><label>Tipo ristrutturazione</label>
          <select value={ristType} onChange={e => setRistType(e.target.value)}>
            {Object.keys(RIST_PRICES).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="cf-field"><label>Qualità finiture</label>
          <select value={ristQuality} onChange={e => setRistQuality(e.target.value)}>
            <option>Economica</option><option>Media</option><option>Alta</option>
          </select>
        </div>
      </div>
      <div className="cf-row">
        <div className="cf-field"><label>Margine atteso (%)</label><input type="number" value={margine} onChange={e => setMargine(e.target.value)} required min="0" max="100" step="0.5" /></div>
        <div className="cf-field"><label>Tempi totali (mesi)</label><input type="number" value={tempi} onChange={e => setTempi(e.target.value)} required min="1" max="60" /></div>
      </div>
      <label className="cf-check"><input type="checkbox" checked={primaCasa} onChange={e => setPrimaCasa(e.target.checked)} /> Acquisto come prima casa (registro 2%)</label>
      <button type="submit" className="btn btn-primary cf-submit">Calcola offerta massima d'acquisto</button>
      {result && (
        <div className="result-box">
          <span className="t-eyebrow">Offerta massima d'acquisto</span>
          <h3 className="result-main">{formatEuro(result.prezzoMax)}</h3>
          <div className="result-range">Per mantenere un margine del {result.margine}% sulla rivendita di {formatEuro(result.revendita)}</div>
          <div style={{ marginTop: 24 }}>
            <div className="t-eyebrow" style={{ marginBottom: 12 }}>Composizione costi & ricavo</div>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                  <td style={{ padding: "8px 0" }}>Prezzo d'acquisto (offerta max)</td>
                  <td style={{ padding: "8px 0", textAlign: "right", fontFamily: "var(--font-serif)", fontWeight: 600 }}>{formatEuro(result.prezzoMax)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                  <td style={{ padding: "8px 0" }}>+ Tasse acquisto (registro/ipo/cat)</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.tasseAcquisto)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                  <td style={{ padding: "8px 0" }}>+ Notaio acquisto</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.notaioAcquisto)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                  <td style={{ padding: "8px 0" }}>+ Ristrutturazione ({result.ppm} €/mq)</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.ristrutturazione)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                  <td style={{ padding: "8px 0" }}>+ IMU periodo immobilizzo</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.imu)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                  <td style={{ padding: "8px 0" }}>+ Costi finanziari/immobilizzo</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.costiFinanziari)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                  <td style={{ padding: "8px 0" }}>+ Provvigione vendita (3% + IVA)</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.provvigioneVendita)}</td>
                </tr>
                <tr style={{ borderBottom: "2px solid var(--accent)", color: "var(--accent)", fontWeight: 700 }}>
                  <td style={{ padding: "10px 0" }}>= Utile netto atteso ({result.margine}%)</td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontFamily: "var(--font-serif)", fontSize: 16 }}>{formatEuro(result.utileNetto)}</td>
                </tr>
                <tr style={{ fontWeight: 700, color: "var(--fg-1)" }}>
                  <td style={{ padding: "10px 0" }}>VALORE FINALE DI RIVENDITA</td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontFamily: "var(--font-serif)", fontSize: 18 }}>{formatEuro(result.revendita)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <PdfDownloadButton
            toolName="Valutatore Inversione PRO"
            resultSummary={formatEuro(result.prezzoMax)}
            rows={[
              ["Offerta massima d'acquisto", formatEuro(result.prezzoMax)],
              ["Margine atteso", `${result.margine}%`],
              ["Valore di rivendita", formatEuro(result.revendita)],
              ["Costi ristrutturazione", formatEuro(result.ristrutturazione)],
              ["Tasse acquisto", formatEuro(result.tasseAcquisto)],
              ["Notaio acquisto", formatEuro(result.notaioAcquisto)],
              ["IMU periodo", formatEuro(result.imu)],
              ["Costi finanziari", formatEuro(result.costiFinanziari)],
              ["Provvigione vendita", formatEuro(result.provvigioneVendita)],
              ["Utile netto atteso", formatEuro(result.utileNetto)],
            ]}
            extra={{ revend, sqm, ristType, ristQuality, margine, tempi, primaCasa }}
          />
        </div>
      )}
    </form>
  );
}

/* ============== SPESE ACQUISTO CASA ============== */
function SpeseAcquistoForm() {
  const [prezzo, setPrezzo] = useState("200000");
  const [valCat, setValCat] = useState("");  // Valore catastale (rendita * 1.05 * coeff)
  const [tipo, setTipo] = useState("prima");
  const [from, setFrom] = useState("privato");
  const [agenzia, setAgenzia] = useState(true);
  const [mutuo, setMutuo] = useState(false);
  const [importoMutuo, setImportoMutuo] = useState("100000");
  const [result, setResult] = useState(null);

  const calc = (e) => {
    e.preventDefault();
    const v = parseInt(prezzo) || 0;
    // Base imponibile: se prima casa privato + prezzo-valore, usa val.cat se fornito, altrimenti prezzo
    const baseImp = (from === "privato" && valCat) ? parseInt(valCat) : v;

    let registro = 0, iva = 0, ipotecaria = 0, catastale = 0;
    if (from === "privato") {
      registro = baseImp * (tipo === "prima" ? 0.02 : 0.09);
      registro = Math.max(registro, 1000); // minimo 1000
      ipotecaria = 50;
      catastale = 50;
    } else {
      // Da impresa: IVA su prezzo
      iva = v * (tipo === "prima" ? 0.04 : 0.10);
      registro = 200;
      ipotecaria = 200;
      catastale = 200;
    }

    // Notaio (forfait realistico)
    const notaio_compr = tipo === "prima" ? 1800 : 2500;
    const notaio_mutuo = mutuo ? 1500 : 0;

    // Mutuo: imposta sostitutiva
    const impSostMutuo = mutuo ? parseInt(importoMutuo || 0) * (tipo === "prima" ? 0.0025 : 0.02) : 0;

    // Provvigione agenzia
    const provvigione = agenzia ? v * 0.0366 : 0;

    const totalImposte = registro + iva + ipotecaria + catastale;
    const totalNotaio = notaio_compr + notaio_mutuo + impSostMutuo;
    const totalGen = totalImposte + totalNotaio + provvigione;
    const grandTotal = v + totalGen;

    setResult({ registro, iva, ipotecaria, catastale, notaio_compr, notaio_mutuo, impSostMutuo, provvigione, totalImposte, totalNotaio, totalGen, grandTotal, prezzo: v, baseImp });
  };

  return (
    <form onSubmit={calc}>
      <div className="cf-row">
        <div className="cf-field"><label>Prezzo d'acquisto (€)</label><input type="number" value={prezzo} onChange={e => setPrezzo(e.target.value)} required /></div>
        <div className="cf-field"><label>Valore catastale (€) <span style={{fontSize: 10, color: "var(--fg-3)"}}>opzionale</span></label><input type="number" value={valCat} onChange={e => setValCat(e.target.value)} placeholder="Lascia vuoto se non lo sai" /></div>
      </div>
      <div className="cf-row">
        <div className="cf-field"><label>Tipo casa</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}><option value="prima">Prima casa</option><option value="seconda">Seconda casa / Investimento</option></select>
        </div>
        <div className="cf-field"><label>Acquisto da</label>
          <select value={from} onChange={e => setFrom(e.target.value)}><option value="privato">Privato</option><option value="impresa">Impresa costruttrice</option></select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <label className="cf-check" style={{ marginBottom: 0 }}><input type="checkbox" checked={agenzia} onChange={e => setAgenzia(e.target.checked)} /> Provvigione agenzia (3% + IVA)</label>
        <label className="cf-check" style={{ marginBottom: 0 }}><input type="checkbox" checked={mutuo} onChange={e => setMutuo(e.target.checked)} /> Acquisto con mutuo</label>
      </div>
      {mutuo && (
        <div className="cf-field" style={{ marginTop: 14 }}><label>Importo mutuo (€)</label><input type="number" value={importoMutuo} onChange={e => setImportoMutuo(e.target.value)} /></div>
      )}
      <button type="submit" className="btn btn-primary cf-submit" style={{ marginTop: 16 }}>Calcola spese totali</button>
      {result && (
        <div className="result-box">
          <span className="t-eyebrow">Spese totali aggiuntive al prezzo</span>
          <h3 className="result-main">{formatEuro(result.totalGen)}</h3>
          <div className="result-range">Costo totale operazione: <strong>{formatEuro(result.grandTotal)}</strong> ({((result.totalGen / result.prezzo) * 100).toFixed(1)}% sul prezzo)</div>

          <div style={{ marginTop: 24 }}>
            <div className="t-eyebrow" style={{ marginBottom: 12 }}>Imposte di acquisto</div>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <tbody>
                {result.registro > 0 && <tr style={{ borderBottom: "1px solid var(--divider)" }}><td style={{ padding: "8px 0" }}>Imposta di registro</td><td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.registro)}</td></tr>}
                {result.iva > 0 && <tr style={{ borderBottom: "1px solid var(--divider)" }}><td style={{ padding: "8px 0" }}>IVA ({tipo === "prima" ? "4%" : "10%"})</td><td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.iva)}</td></tr>}
                <tr style={{ borderBottom: "1px solid var(--divider)" }}><td style={{ padding: "8px 0" }}>Imposta ipotecaria</td><td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.ipotecaria)}</td></tr>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}><td style={{ padding: "8px 0" }}>Imposta catastale</td><td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.catastale)}</td></tr>
                <tr style={{ borderBottom: "1px solid var(--accent)", fontWeight: 600 }}><td style={{ padding: "10px 0" }}>Subtotale imposte</td><td style={{ padding: "10px 0", textAlign: "right", color: "var(--accent)" }}>{formatEuro(result.totalImposte)}</td></tr>
              </tbody>
            </table>

            <div className="t-eyebrow" style={{ marginTop: 24, marginBottom: 12 }}>Notaio e mutuo</div>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}><td style={{ padding: "8px 0" }}>Onorario notaio compravendita</td><td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.notaio_compr)}</td></tr>
                {result.notaio_mutuo > 0 && <tr style={{ borderBottom: "1px solid var(--divider)" }}><td style={{ padding: "8px 0" }}>Onorario notaio mutuo</td><td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.notaio_mutuo)}</td></tr>}
                {result.impSostMutuo > 0 && <tr style={{ borderBottom: "1px solid var(--divider)" }}><td style={{ padding: "8px 0" }}>Imposta sostitutiva mutuo</td><td style={{ padding: "8px 0", textAlign: "right" }}>{formatEuro(result.impSostMutuo)}</td></tr>}
                <tr style={{ borderBottom: "1px solid var(--accent)", fontWeight: 600 }}><td style={{ padding: "10px 0" }}>Subtotale notaio</td><td style={{ padding: "10px 0", textAlign: "right", color: "var(--accent)" }}>{formatEuro(result.totalNotaio)}</td></tr>
              </tbody>
            </table>

            {result.provvigione > 0 && (
              <>
                <div className="t-eyebrow" style={{ marginTop: 24, marginBottom: 12 }}>Provvigione agenzia</div>
                <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--accent)", fontWeight: 600 }}><td style={{ padding: "8px 0" }}>Provvigione (3% + IVA 22%)</td><td style={{ padding: "8px 0", textAlign: "right", color: "var(--accent)" }}>{formatEuro(result.provvigione)}</td></tr>
                  </tbody>
                </table>
              </>
            )}

            <div style={{ marginTop: 24, padding: 16, background: "var(--brand-black)", color: "#FAFAF7", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold-300)" }}>Costo totale operazione</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 600 }}>{formatEuro(result.grandTotal)}</div>
              </div>
              <div style={{ fontSize: 12, color: "rgba(250,250,247,.65)", marginTop: 6 }}>Prezzo casa {formatEuro(result.prezzo)} + spese {formatEuro(result.totalGen)}</div>
            </div>
          </div>
          <PdfDownloadButton
            toolName="Spese Acquisto Casa"
            resultSummary={`Totale ${formatEuro(result.grandTotal)}`}
            rows={[
              ["Prezzo d'acquisto", formatEuro(result.prezzo)],
              ["Spese aggiuntive totali", formatEuro(result.totalGen)],
              ["Costo totale operazione", formatEuro(result.grandTotal)],
              ...(result.registro > 0 ? [["Imposta di registro", formatEuro(result.registro)]] : []),
              ...(result.iva > 0 ? [["IVA", formatEuro(result.iva)]] : []),
              ["Imposta ipotecaria", formatEuro(result.ipotecaria)],
              ["Imposta catastale", formatEuro(result.catastale)],
              ["Notaio compravendita", formatEuro(result.notaio_compr)],
              ...(result.notaio_mutuo > 0 ? [["Notaio mutuo", formatEuro(result.notaio_mutuo)]] : []),
              ...(result.impSostMutuo > 0 ? [["Imposta sostitutiva mutuo", formatEuro(result.impSostMutuo)]] : []),
              ...(result.provvigione > 0 ? [["Provvigione agenzia (3%+IVA)", formatEuro(result.provvigione)]] : []),
              ["Tipo casa", tipo === "prima" ? "Prima casa" : "Seconda casa / Investimento"],
              ["Acquisto da", from === "privato" ? "Privato" : "Impresa costruttrice"],
            ]}
            extra={{ prezzo, valCat, tipo, from, agenzia, mutuo, importoMutuo }}
          />
        </div>
      )}
    </form>
  );
}

/* ============== ADEGUAMENTO ISTAT PRO ============== */
// Indici FOI ufficiali (variazione % annuale media)
const ISTAT_FOI = {
  "2026": 1.4, "2025": 1.8, "2024": 5.4, "2023": 11.6, "2022": 5.7,
  "2021": 1.9, "2020": -0.3, "2019": 0.5, "2018": 1.1, "2017": 0.9, "2016": -0.1,
};

function IstatProForm() {
  const [canone, setCanone] = useState("700");
  const [annoBase, setAnnoBase] = useState("2024");
  const [annoAdeg, setAnnoAdeg] = useState("2026");
  const [percApplicabile, setPercApplicabile] = useState("75");
  const [result, setResult] = useState(null);

  const calc = (e) => {
    e.preventDefault();
    const c = parseFloat(canone) || 0;
    const ab = parseInt(annoBase);
    const aa = parseInt(annoAdeg);
    const perc = parseFloat(percApplicabile) / 100;

    if (aa <= ab) { alert("L'anno di adeguamento deve essere successivo all'anno base"); return; }

    let varCumul = 0;
    const anni = [];
    for (let y = ab + 1; y <= aa; y++) {
      const yStr = String(y);
      const v = ISTAT_FOI[yStr] || 0;
      varCumul += v;
      anni.push({ year: y, foi: v, applicato: v * perc });
    }
    const adegPerc = varCumul * perc;
    const incremento = c * (adegPerc / 100);
    const nuovoCanone = c + incremento;
    setResult({ canoneOrig: c, anni, varCumul, perc: perc * 100, adegPerc, incremento, nuovoCanone, mensileAnnuo: nuovoCanone * 12, mensileAnnuoOrig: c * 12 });
  };

  const annosOptions = Object.keys(ISTAT_FOI).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <form onSubmit={calc}>
      <div className="cf-field"><label>Canone mensile attuale (€)</label><input type="number" step="0.01" value={canone} onChange={e => setCanone(e.target.value)} required /></div>
      <div className="cf-row">
        <div className="cf-field"><label>Anno base contratto</label>
          <select value={annoBase} onChange={e => setAnnoBase(e.target.value)}>{annosOptions.map(a => <option key={a}>{a}</option>)}</select>
        </div>
        <div className="cf-field"><label>Anno di adeguamento</label>
          <select value={annoAdeg} onChange={e => setAnnoAdeg(e.target.value)}>{annosOptions.map(a => <option key={a}>{a}</option>)}</select>
        </div>
      </div>
      <div className="cf-field"><label>% FOI applicabile</label>
        <select value={percApplicabile} onChange={e => setPercApplicabile(e.target.value)}>
          <option value="75">75% (locazioni 4+4 e transitori)</option>
          <option value="100">100% (locazioni a canone libero pre-2010)</option>
          <option value="50">50% (alcuni accordi territoriali)</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary cf-submit">Calcola adeguamento</button>
      {result && (
        <div className="result-box">
          <span className="t-eyebrow">Nuovo canone mensile</span>
          <h3 className="result-main">{formatEuro2(result.nuovoCanone)}</h3>
          <div className="result-range">Incremento: <strong style={{ color: "var(--accent)" }}>+{formatEuro2(result.incremento)}/mese</strong> · +{result.adegPerc.toFixed(2)}% sul canone originario</div>
          <div style={{ marginTop: 24 }}>
            <div className="t-eyebrow" style={{ marginBottom: 12 }}>Variazioni FOI applicate</div>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--accent)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--fg-3)" }}>
                  <th style={{ padding: "8px 0", textAlign: "left", fontWeight: 600 }}>Anno</th>
                  <th style={{ padding: "8px 0", textAlign: "right", fontWeight: 600 }}>Variazione FOI</th>
                  <th style={{ padding: "8px 0", textAlign: "right", fontWeight: 600 }}>Applicato ({result.perc}%)</th>
                </tr>
              </thead>
              <tbody>
                {result.anni.map((a, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--divider)" }}>
                    <td style={{ padding: "8px 0" }}>{a.year}</td>
                    <td style={{ padding: "8px 0", textAlign: "right", color: a.foi < 0 ? "var(--danger)" : "var(--fg-1)" }}>{a.foi > 0 ? "+" : ""}{a.foi.toFixed(2)}%</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontFamily: "var(--font-serif)", fontWeight: 600 }}>{a.applicato > 0 ? "+" : ""}{a.applicato.toFixed(2)}%</td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid var(--accent)", fontWeight: 700 }}>
                  <td style={{ padding: "10px 0" }}>Totale variazione</td>
                  <td style={{ padding: "10px 0", textAlign: "right" }}>{result.varCumul.toFixed(2)}%</td>
                  <td style={{ padding: "10px 0", textAlign: "right", color: "var(--accent)" }}>{result.adegPerc.toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 16, background: "var(--bg-sunken)", borderRadius: 8, textAlign: "center" }}>
                <div className="t-eyebrow" style={{ marginBottom: 6 }}>Canone originario</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600 }}>{formatEuro2(result.canoneOrig)}/mese</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4 }}>{formatEuro(result.mensileAnnuoOrig)}/anno</div>
              </div>
              <div style={{ padding: 16, background: "var(--accent-soft)", border: "1px solid var(--border-gold)", borderRadius: 8, textAlign: "center" }}>
                <div className="t-eyebrow" style={{ marginBottom: 6 }}>Nuovo canone</div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, color: "var(--accent)" }}>{formatEuro2(result.nuovoCanone)}/mese</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4 }}>{formatEuro(result.mensileAnnuo)}/anno</div>
              </div>
            </div>
          </div>
          <PdfDownloadButton
            toolName="Adeguamento ISTAT"
            resultSummary={`${formatEuro2(result.nuovoCanone)}/mese`}
            rows={[
              ["Canone originario", `${formatEuro2(result.canoneOrig)}/mese`],
              ["Nuovo canone adeguato", `${formatEuro2(result.nuovoCanone)}/mese`],
              ["Incremento mensile", `+${formatEuro2(result.incremento)}`],
              ["Variazione cumulata FOI", `${result.varCumul.toFixed(2)}%`],
              ["% applicabile", `${result.perc}%`],
              ["Adeguamento applicato", `${result.adegPerc.toFixed(2)}%`],
              ["Anno base", String(annoBase)],
              ["Anno adeguamento", String(annoAdeg)],
              ["Canone annuale originario", `${formatEuro(result.mensileAnnuoOrig)}/anno`],
              ["Canone annuale adeguato", `${formatEuro(result.mensileAnnuo)}/anno`],
              ...result.anni.map(a => [`FOI anno ${a.year}`, `${a.foi > 0 ? "+" : ""}${a.foi.toFixed(2)}% (applicato: ${a.applicato.toFixed(2)}%)`]),
            ]}
            extra={{ canone, annoBase, annoAdeg, percApplicabile }}
          />
        </div>
      )}
    </form>
  );
}
