import React, { useState, useMemo } from "react";
import { Plus, Minus } from "lucide-react";
import { PdfDownloadButton } from "./PdfDownloadButton";

/**
 * Capitolato Ristrutturazione cella-per-cella, ispirato a llamacoder
 * Output: totale + breakdown voce per voce
 */

const CAPITOLATO = [
  {
    cat: "Allestimento Cantiere e Sicurezza",
    items: [
      { v: "Allestimento cantiere (ponteggi, recinzioni, baracche)", p: 1200, u: "lotto" },
      { v: "Piano di Sicurezza e Coordinamento (PSC)", p: 800, u: "lotto" },
      { v: "Direzione Lavori e Coordinatore Sicurezza", p: 2500, u: "lotto" },
      { v: "Pulizia finale cantiere", p: 6, u: "mq" },
      { v: "Smontaggio e ripristino", p: 600, u: "lotto" },
    ],
  },
  {
    cat: "Demolizioni e Smaltimenti",
    items: [
      { v: "Demolizione muri portanti", p: 95, u: "mq" },
      { v: "Demolizione tramezzi non portanti", p: 45, u: "mq" },
      { v: "Rimozione pavimenti esistenti", p: 35, u: "mq" },
      { v: "Rimozione rivestimenti (piastrelle/intonaco)", p: 30, u: "mq" },
      { v: "Rimozione infissi (finestre/porte)", p: 80, u: "unità" },
      { v: "Rimozione sanitari e accessori bagno", p: 280, u: "lotto" },
      { v: "Smaltimento macerie in discarica autorizzata", p: 100, u: "m³" },
      { v: "Rimozione amianto / Eternit (con bonifica)", p: 65, u: "mq" },
      { v: "Demolizione pavimentazione esterna", p: 28, u: "mq" },
    ],
  },
  {
    cat: "Strutture e Muratura",
    items: [
      { v: "Ricostruzione muri portanti (laterizio)", p: 95, u: "mq" },
      { v: "Realizzazione tramezzi in cartongesso", p: 60, u: "mq" },
      { v: "Realizzazione tramezzi in laterizio forato", p: 75, u: "mq" },
      { v: "Rifacimento intonaco interno", p: 40, u: "mq" },
      { v: "Rifacimento intonaco esterno (incl. ponteggio)", p: 55, u: "mq" },
      { v: "Realizzazione massetto autolivellante", p: 35, u: "mq" },
      { v: "Realizzazione massetto isolante", p: 45, u: "mq" },
      { v: "Posa piastrelle a pavimento", p: 35, u: "mq" },
      { v: "Posa rivestimenti a parete", p: 38, u: "mq" },
      { v: "Realizzazione architravi e cordoli", p: 180, u: "ml" },
      { v: "Apertura/chiusura vani porta", p: 480, u: "unità" },
    ],
  },
  {
    cat: "Coperture e Lattoneria",
    items: [
      { v: "Rifacimento manto di copertura (tegole)", p: 110, u: "mq" },
      { v: "Coibentazione tetto (cappotto + freno vapore)", p: 75, u: "mq" },
      { v: "Lattoneria (gronde + pluviali in rame)", p: 65, u: "ml" },
      { v: "Camini e canne fumarie", p: 320, u: "ml" },
      { v: "Lucernari e abbaini", p: 1400, u: "unità" },
    ],
  },
  {
    cat: "Impianti Elettrici",
    items: [
      { v: "Quadro elettrico 24 moduli + interruttori", p: 850, u: "unità" },
      { v: "Quadro generale di appartamento", p: 1200, u: "unità" },
      { v: "Punto luce semplice", p: 60, u: "unità" },
      { v: "Punto luce deviato/invertito", p: 95, u: "unità" },
      { v: "Punto presa civile (10/16A)", p: 50, u: "unità" },
      { v: "Punto presa industriale", p: 95, u: "unità" },
      { v: "Punto TV / dati / fibra", p: 70, u: "unità" },
      { v: "Punto cucina (forno + piano induzione)", p: 220, u: "unità" },
      { v: "Citofono / videocitofono", p: 380, u: "unità" },
      { v: "Predisposizione domotica (KNX/scenari)", p: 1800, u: "lotto" },
      { v: "Certificazione DM 37/08", p: 350, u: "lotto" },
    ],
  },
  {
    cat: "Impianti Idraulici e Termici",
    items: [
      { v: "Punto acqua/scarico", p: 180, u: "unità" },
      { v: "Bagno completo (sanitari + collegamenti)", p: 1900, u: "unità" },
      { v: "Cucina (collegamenti acqua/scarico/gas)", p: 650, u: "unità" },
      { v: "Caldaia a condensazione 24 kW", p: 1900, u: "unità" },
      { v: "Pompa di calore aria-acqua", p: 5800, u: "unità" },
      { v: "Termosifoni in alluminio", p: 220, u: "unità" },
      { v: "Termoarredo bagno", p: 280, u: "unità" },
      { v: "Riscaldamento a pavimento", p: 70, u: "mq" },
      { v: "Climatizzatore split (mono)", p: 950, u: "unità" },
      { v: "Climatizzatore multi-split", p: 2400, u: "unità" },
      { v: "Pannelli solari termici (kit base)", p: 3200, u: "unità" },
      { v: "Bollitore acqua sanitaria 200 L", p: 850, u: "unità" },
      { v: "Certificazione impianto gas (Cig)", p: 280, u: "lotto" },
    ],
  },
  {
    cat: "Pavimenti e Rivestimenti (forniture)",
    items: [
      { v: "Gres porcellanato standard", p: 28, u: "mq" },
      { v: "Gres porcellanato effetto legno/marmo", p: 55, u: "mq" },
      { v: "Parquet prefinito rovere", p: 95, u: "mq" },
      { v: "Parquet massello", p: 140, u: "mq" },
      { v: "Battiscopa in legno o MDF", p: 12, u: "ml" },
      { v: "Marmo o pietra naturale", p: 180, u: "mq" },
      { v: "Resina decorativa", p: 110, u: "mq" },
    ],
  },
  {
    cat: "Infissi Esterni e Interni",
    items: [
      { v: "Finestra PVC doppio vetro standard", p: 580, u: "unità" },
      { v: "Finestra PVC triplo vetro / classe A++", p: 850, u: "unità" },
      { v: "Finestra alluminio taglio termico", p: 950, u: "unità" },
      { v: "Portafinestra (doppio battente)", p: 1100, u: "unità" },
      { v: "Persiane in alluminio", p: 380, u: "unità" },
      { v: "Tapparelle motorizzate", p: 480, u: "unità" },
      { v: "Porta interna standard", p: 280, u: "unità" },
      { v: "Porta interna scorrevole interno muro", p: 850, u: "unità" },
      { v: "Porta blindata classe 3", p: 1500, u: "unità" },
      { v: "Porta blindata classe 4 (alta sicurezza)", p: 2400, u: "unità" },
    ],
  },
  {
    cat: "Tinteggi e Finiture",
    items: [
      { v: "Tinteggio pareti (idropittura traspirante)", p: 12, u: "mq" },
      { v: "Tinteggio soffitti", p: 14, u: "mq" },
      { v: "Pittura decorativa (effetto)", p: 32, u: "mq" },
      { v: "Stuccatura e rasatura", p: 18, u: "mq" },
      { v: "Carta da parati (compresa posa)", p: 55, u: "mq" },
      { v: "Cappotto termico esterno (10 cm)", p: 95, u: "mq" },
    ],
  },
  {
    cat: "Sanitari, Cucina e Arredo Bagno",
    items: [
      { v: "WC sospeso con cassetta incassata", p: 320, u: "unità" },
      { v: "Lavabo + miscelatore (gamma media)", p: 380, u: "unità" },
      { v: "Bidet sospeso", p: 240, u: "unità" },
      { v: "Doccia (piatto + box vetro)", p: 750, u: "unità" },
      { v: "Vasca da bagno standard", p: 600, u: "unità" },
      { v: "Vasca idromassaggio", p: 1800, u: "unità" },
      { v: "Mobile bagno completo", p: 950, u: "unità" },
      { v: "Specchio retroilluminato", p: 280, u: "unità" },
    ],
  },
  {
    cat: "Sicurezza e Domotica",
    items: [
      { v: "Impianto antifurto (centrale + 4 sensori)", p: 1900, u: "lotto" },
      { v: "Videosorveglianza (kit 4 camere)", p: 1400, u: "lotto" },
      { v: "Domotica scenari + tapparelle", p: 2800, u: "lotto" },
      { v: "Controllo accessi smart (serratura wifi)", p: 480, u: "unità" },
      { v: "Sensori fumo/gas/allagamento", p: 280, u: "unità" },
    ],
  },
  {
    cat: "Esterni e Sistemazione Aree",
    items: [
      { v: "Pavimentazione esterna (autobloccanti)", p: 65, u: "mq" },
      { v: "Pavimentazione esterna (gres)", p: 110, u: "mq" },
      { v: "Recinzione muraria + cancello pedonale", p: 380, u: "ml" },
      { v: "Cancello carrabile motorizzato", p: 2800, u: "unità" },
      { v: "Sistemazione giardino e prato a rotoli", p: 28, u: "mq" },
      { v: "Impianto irrigazione automatico", p: 18, u: "mq" },
      { v: "Cappotto termico facciata", p: 95, u: "mq" },
    ],
  },
  {
    cat: "Pratiche e Spese Tecniche",
    items: [
      { v: "Pratica edilizia CILA", p: 850, u: "lotto" },
      { v: "Pratica edilizia SCIA", p: 1400, u: "lotto" },
      { v: "Permesso di Costruire", p: 2500, u: "lotto" },
      { v: "Accatastamento DOCFA + planimetria", p: 650, u: "lotto" },
      { v: "Attestato di Prestazione Energetica (APE)", p: 280, u: "lotto" },
      { v: "Relazione tecnica L.10/91 (termotecnica)", p: 480, u: "lotto" },
      { v: "Pratica ENEA detrazioni fiscali", p: 280, u: "lotto" },
    ],
  },
];

function formatEuro(n) { return "€ " + Math.round(n).toLocaleString("it-IT").replace(/,/g, "."); }

export default function CapitolatoRistruttura() {
  const [info, setInfo] = useState({ progetto: "", indirizzo: "", data: "" });
  const [qty, setQty] = useState({}); // key = "cat|item" → number

  const setQ = (key, v) => setQty(prev => ({ ...prev, [key]: v }));
  const getQ = (key) => parseFloat(qty[key] || 0);

  const totals = useMemo(() => {
    const cats = {};
    let grand = 0;
    CAPITOLATO.forEach(group => {
      let catTotal = 0;
      group.items.forEach(it => {
        const key = `${group.cat}|${it.v}`;
        const q = getQ(key);
        const subtotal = q * it.p;
        catTotal += subtotal;
      });
      cats[group.cat] = catTotal;
      grand += catTotal;
    });
    return { cats, grand };
  }, [qty]);

  const pdfRows = useMemo(() => {
    const rows = [];
    if (info.progetto) rows.push(["Progetto", info.progetto]);
    if (info.indirizzo) rows.push(["Indirizzo", info.indirizzo]);
    if (info.data) rows.push(["Data inizio", info.data]);
    rows.push(["TOTALE PREVENTIVO", formatEuro(totals.grand)]);
    rows.push([" ", " "]);
    CAPITOLATO.forEach(group => {
      if (totals.cats[group.cat] > 0) {
        rows.push([`▸ ${group.cat}`, formatEuro(totals.cats[group.cat])]);
        group.items.forEach(it => {
          const key = `${group.cat}|${it.v}`;
          const q = getQ(key);
          if (q > 0) rows.push([`  ${it.v} (${q} ${it.u} × ${it.p} €)`, formatEuro(q * it.p)]);
        });
      }
    });
    return rows;
  }, [info, totals, qty]);

  const reset = () => { setQty({}); setInfo({ progetto: "", indirizzo: "", data: "" }); };

  return (
    <div data-testid="capitolato-form">
      {/* Header: info progetto */}
      <div style={{ background: "var(--brand-black)", color: "#FAFAF7", padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600 }}>Capitolato Ristrutturazione</div>
            <div className="t-eyebrow" style={{ color: "var(--gold-300)", marginTop: 4 }}>Database Immobiliare Daniela</div>
          </div>
          <span style={{ background: "var(--accent-soft)", color: "var(--accent)", padding: "6px 14px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase" }}>Preventivo</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="cf-field" style={{ marginBottom: 0 }}>
            <label style={{ color: "rgba(250,250,247,.65)" }}>Nome progetto</label>
            <input value={info.progetto} onChange={e => setInfo({ ...info, progetto: e.target.value })} placeholder="es. Ristrutturazione Via Genova" />
          </div>
          <div className="cf-field" style={{ marginBottom: 0 }}>
            <label style={{ color: "rgba(250,250,247,.65)" }}>Indirizzo</label>
            <input value={info.indirizzo} onChange={e => setInfo({ ...info, indirizzo: e.target.value })} placeholder="Via, civico, città" />
          </div>
          <div className="cf-field" style={{ marginBottom: 0 }}>
            <label style={{ color: "rgba(250,250,247,.65)" }}>Data inizio</label>
            <input type="date" value={info.data} onChange={e => setInfo({ ...info, data: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Categorie con voci */}
      {CAPITOLATO.map((group, gi) => (
        <div key={gi} className="capitolato-cat">
          <div className="capitolato-cat-head">
            <h3>{group.cat}</h3>
            {totals.cats[group.cat] > 0 && (
              <span className="capitolato-cat-total">{formatEuro(totals.cats[group.cat])}</span>
            )}
          </div>
          <div className="capitolato-items">
            {group.items.map((it, ii) => {
              const key = `${group.cat}|${it.v}`;
              const q = getQ(key);
              const sub = q * it.p;
              return (
                <div key={ii} className={`capitolato-row ${q > 0 ? "active" : ""}`}>
                  <div className="capitolato-row-info">
                    <div className="capitolato-row-name">{it.v}</div>
                    <div className="capitolato-row-price">{formatEuro(it.p)} / {it.u}</div>
                  </div>
                  <div className="capitolato-row-qty">
                    <button type="button" onClick={() => setQ(key, Math.max(0, q - 1))} className="qty-btn" aria-label="Diminuisci"><Minus size={14} /></button>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={qty[key] || ""}
                      onChange={e => setQ(key, e.target.value)}
                      placeholder="0"
                    />
                    <button type="button" onClick={() => setQ(key, q + 1)} className="qty-btn" aria-label="Aumenta"><Plus size={14} /></button>
                    <span className="capitolato-row-unit">{it.u}</span>
                  </div>
                  <div className="capitolato-row-sub">{sub > 0 ? formatEuro(sub) : "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Totale finale */}
      <div className="capitolato-total">
        <div>
          <div className="t-eyebrow">Totale preventivo</div>
          <div className="capitolato-total-num">{formatEuro(totals.grand)}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button type="button" onClick={reset} className="btn btn-ghost btn-sm">Reset</button>
          {totals.grand > 0 && (
            <PdfDownloadButton
              toolName="Capitolato Ristrutturazione"
              resultSummary={formatEuro(totals.grand)}
              rows={pdfRows}
              extra={{ progetto: info.progetto, indirizzo: info.indirizzo, totale: totals.grand }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
