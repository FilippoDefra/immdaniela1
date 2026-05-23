import React from "react";
import { Link } from "react-router-dom";
import { Gift, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { AGENCY } from "../lib/api";

export default function AcquisitoreOccasionale() {
  return (
    <div data-testid="acquisitore-page">
      {/* HERO compatto */}
      <section className="acquisitore-strip" style={{ marginTop: 0, paddingTop: 80, paddingBottom: 80 }}>
        <div className="container">
          <div className="acquisitore-grid">
            <div className="acquisitore-icon"><Gift size={56} /></div>
            <div>
              <span className="t-eyebrow" style={{ color: "var(--gold-200)" }}>Programma esclusivo</span>
              <h1 style={{ fontSize: 56, color: "#FAFAF7", margin: "8px 0 16px", lineHeight: 1.05, fontFamily: "var(--font-serif)", fontWeight: 500 }}>
                Acquisitore Occasionale<br/><span style={{ color: "var(--gold-300)", fontStyle: "italic" }}>premiato.</span>
              </h1>
              <p style={{ color: "rgba(250,250,247,.85)", fontSize: 18, lineHeight: 1.6, maxWidth: 620 }}>
                Conosci qualcuno che vuole vendere casa? Hai sentito di un immobile in arrivo sul mercato? <strong style={{ color: "#FAFAF7" }}>Segnalalo a noi</strong> — se la trattativa si chiude grazie a te, ti ringraziamo con un <strong style={{ color: "var(--gold-200)" }}>premio dedicato</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="container" style={{ padding: "96px 32px" }}>
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 64px" }}>
          <span className="t-eyebrow">Come funziona</span>
          <hr className="rule-gold rule-gold-center" />
          <h2 style={{ fontSize: 44, marginTop: 12 }}>3 step semplici. Zero impegno.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }} className="howitworks-grid">
          {[
            { n: 1, t: "Segnali un immobile", d: "Compili il modulo di segnalazione indicando l'immobile, la zona o il proprietario che potrebbe voler vendere. Bastano pochi dati." },
            { n: 2, t: "Verifichiamo e contattiamo", d: "I nostri agenti contattano il proprietario, valutano l'immobile e avviano la trattativa con i nostri clienti profilati." },
            { n: 3, t: "Sei premiato", d: "Se la vendita si conclude grazie alla tua segnalazione, ricevi un premio dedicato come ringraziamento per il tuo contributo." },
          ].map(s => (
            <div key={s.n} style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gold-gradient)", color: "var(--ink-900)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: 40, fontWeight: 600, margin: "0 auto 20px", boxShadow: "0 12px 32px rgba(184,134,11,.35)" }}>{s.n}</div>
              <h3 style={{ fontSize: 24, marginBottom: 12 }}>{s.t}</h3>
              <p style={{ color: "var(--fg-2)", lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CHI PUO PARTECIPARE */}
      <section style={{ background: "var(--bg-sunken)", padding: "96px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 64, alignItems: "center" }} className="who-grid">
            <div>
              <span className="t-eyebrow">Chi può partecipare</span>
              <hr className="rule-gold" />
              <h2 style={{ fontSize: 44, marginTop: 12 }}>Tutti.<br/>Senza eccezioni.</h2>
              <p className="t-lead" style={{ marginTop: 20 }}>
                Non serve essere un agente, non serve avere licenze. Vicini di casa, parenti, amici, colleghi: chiunque conosca un immobile in vendita può diventare un Acquisitore Occasionale.
              </p>
            </div>
            <div>
              {[
                "Famiglie e privati che conoscono casi nel proprio quartiere",
                "Professionisti (commercialisti, avvocati, notai) con clienti che vogliono vendere",
                "Amministratori di condominio in contatto con proprietari",
                "Imprese di pulizie, manutenzione, ristrutturazione",
                "Chiunque abbia informazioni utili sul mercato locale",
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 4 ? "1px solid var(--divider)" : "none" }}>
                  <CheckCircle2 size={22} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: "var(--fg-1)" }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section style={{ background: "var(--brand-black)", padding: "96px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Award size={48} color="var(--gold-300)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 48, color: "#FAFAF7", marginBottom: 16, fontFamily: "var(--font-serif)" }}>Pronto a iniziare?</h2>
          <p style={{ color: "rgba(250,250,247,.75)", fontSize: 18, marginBottom: 32 }}>Bastano 30 secondi per fare la tua prima segnalazione. Niente registrazione, niente impegni.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/segnala-immobile" className="btn btn-primary" data-testid="acquisitore-cta">Segnala un immobile</Link>
            <a href={`https://wa.me/${AGENCY.whatsapp}?text=${encodeURIComponent("Ciao, vorrei diventare Acquisitore Occasionale")}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">Chiedi info su WhatsApp</a>
          </div>
        </div>
      </section>
    </div>
  );
}
