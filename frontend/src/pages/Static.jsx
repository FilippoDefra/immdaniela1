import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export function ClientiCercanoPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/buyer-requests").then(r => setItems(r.data)); }, []);
  return (
    <div className="container" style={{ padding: "64px 32px 96px" }} data-testid="clienti-cercano-page">
      <div style={{ maxWidth: 720, marginBottom: 48 }}>
        <span className="t-eyebrow">Domanda reale attiva</span>
        <hr className="rule-gold" />
        <h1 style={{ fontSize: 48 }}>I nostri clienti cercano casa.</h1>
        <p className="t-lead">Ogni richiesta corrisponde a un cliente reale, qualificato e pronto. Hai un immobile che potrebbe interessare? Contattaci subito.</p>
      </div>
      <div className="br-grid">
        {items.map(r => (
          <div key={r.id} className="br-card" data-testid={`buyer-request-${r.id}`}>
            <div className="br-zone">{r.zone}</div>
            <div className="br-type">{r.property_type}</div>
            {r.label && <span className="br-label">{r.label}</span>}
            <p className="br-desc">{r.description}</p>
            <div className="br-foot">
              <div className="br-budget">{r.budget}</div>
              <Link to="/segnala-immobile" className="br-cta">Ho un immobile ›</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgenziaPage() {
  return (
    <div data-testid="agenzia-page">
      <div className="container-narrow" style={{ padding: "64px 32px 0", textAlign: "center" }}>
        <span className="t-eyebrow">L'agenzia</span>
        <hr className="rule-gold rule-gold-center" />
        <h1 style={{ fontSize: 56, fontFamily: "var(--font-serif)", fontWeight: 500, lineHeight: 1.05 }}>La Riviera, conosciuta passo per passo.</h1>
      </div>

      <div className="container" style={{ marginTop: 96 }}>
        <div className="story">
          <div className="story-img" />
          <div>
            <span className="t-eyebrow">L'agenzia</span>
            <hr className="rule-gold" />
            <h2 className="story-ttl">A Loano, da sempre.</h2>
            <p className="t-lead">Database Immobiliare Daniela accompagna le famiglie e gli investitori nelle compravendite e negli affitti turistici sulla Riviera di Ponente.</p>
            <p>Operiamo a Loano, Pietra Ligure, Borghetto Santo Spirito, Finale Ligure e Albenga. Trattiamo compravendite, perizie tecniche, locazioni e affitti brevi — con un approccio diretto e curato in ogni passaggio.</p>
            <p className="story-quote">"Zero stress, solo case." — è la promessa che facciamo a ogni cliente.</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="agent-card">
          <div className="agent-photo">
            <img src="/assets/agent-pino.jpg" alt="Filippo De Francisci" data-testid="agent-photo" />
          </div>
          <div>
            <span className="t-eyebrow">Amministratore unico</span>
            <h3 className="agent-name">Filippo De Francisci</h3>
            <div className="agent-role">Agente immobiliare e geometra</div>
            <p>Sono nato e cresciuto sulla Riviera. Conosco ogni via di Loano, ogni caruggio di Borghetto, ogni borgata di Albenga. Ti aiuto a comprare, vendere o affittare — passo dopo passo.</p>
            <div className="agent-badges">
              {["FIMAA", "Geometra", "Perizie tecniche"].map(b => (
                <span key={b} className="agent-badge">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GALLERIA LOANO */}
      <section className="container loano-gallery-section" data-testid="loano-gallery">
        <div className="loano-gallery-head">
          <span className="t-eyebrow">Il territorio</span>
          <hr className="rule-gold rule-gold-center" />
          <h2 className="loano-gallery-ttl">Loano, lo stile di vita.</h2>
          <p className="t-lead loano-gallery-sub">
            Mare cristallino, centro storico vivo, lungomare a misura d'uomo. Vivere o investire qui significa scegliere una Riviera autentica, ancora vera.
          </p>
        </div>

        <div className="loano-gallery">
          <figure className="lg-item lg-item-1" data-testid="loano-gallery-1">
            <img src={require("../assets/loano-aerial.jpg")} alt="Vista aerea di Loano e della costa ligure" loading="lazy" />
            <figcaption><span className="lg-eb">Vista aerea</span><span className="lg-ttl">La costa di Ponente</span></figcaption>
          </figure>
          <figure className="lg-item lg-item-2" data-testid="loano-gallery-2">
            <img src={require("../assets/loano-molo.jpg")} alt="Loano vista dal molo Doria, porto turistico" loading="lazy" />
            <figcaption><span className="lg-eb">Marina di Loano</span><span className="lg-ttl">Dal molo Doria</span></figcaption>
          </figure>
          <figure className="lg-item lg-item-3" data-testid="loano-gallery-3">
            <img src={require("../assets/loano-panoramio.jpg")} alt="Panorama di Loano sulla Riviera ligure" loading="lazy" />
            <figcaption><span className="lg-eb">Panorama</span><span className="lg-ttl">Tra colline e mare</span></figcaption>
          </figure>
        </div>

        <div className="loano-gallery-cta">
          <Link to="/contatti" className="btn btn-primary" data-testid="loano-gallery-cta">Vieni a scoprirla con noi ›</Link>
        </div>
      </section>
    </div>
  );
}
