import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, Calculator, Scale, BarChart3, FileText, Star, Sparkles, Gift, Award, TrendingUp, Wrench, Hammer, Cpu } from "lucide-react";
import { api, AGENCY } from "../lib/api";
import { SearchPanel } from "../components/SearchPanel";
import { PropertyCard } from "../components/PropertyCard";

export default function HomeV2() {
  const [featured, setFeatured] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ listings: 0, experience_years: 30, satisfaction: 98, rating: 4.9 });

  useEffect(() => {
    api.get("/listings", { params: { type: "Vendita", limit: 50 } }).then(r => setFeatured(r.data.slice(0, 3)));
    api.get("/listings", { params: { limit: 100 } }).then(r => {
      const aff = r.data.filter(l => l.type === "Locazione" || l.type === "Affitto breve").slice(0, 3);
      setRentals(aff);
    });
    api.get("/buyer-requests").then(r => setRequests(r.data.slice(0, 4)));
    api.get("/stats").then(r => setStats(r.data));
  }, []);

  return (
    <div data-testid="home-v2">
      {/* HERO RIVISITATO — Boutique tech-immobiliare */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grad" />
        <div className="hero-inner">
          <div className="hero-content">
            <span className="t-eyebrow hero-eb">Boutique tech-immobiliare · Loano</span>
            <hr className="rule-gold hero-rule" />
            <h1 className="hero-ttl">Acquisizioni, vendite<br/>e strumenti digitali.</h1>
            <p className="hero-sub">
              Analisi tecnica, strumenti gratuiti e consulenza vera per chi vende, acquista o investe sulla Riviera Ligure di Ponente. Una piattaforma — non solo un'agenzia.
            </p>
            <div className="hero-ctas">
              <Link to="/immobili" className="btn btn-primary" data-testid="hero-cta-vendite">Vedi vendite</Link>
              <Link to="/affitti" className="btn btn-ghost-light" data-testid="hero-cta-affitti">Vedi affitti</Link>
              <Link to="/strumenti" className="btn btn-ghost-light">Strumenti gratuiti ›</Link>
            </div>
          </div>

          <div className="hero-floats">
            <Link to="/clienti-cercano" className="hero-float">
              <div className="hero-float-icon"><Star size={22} fill="#fff" /></div>
              <div className="hero-float-body">
                <div className="hero-float-eb">Domanda reale attiva</div>
                <div className="hero-float-ttl">Nostri Clienti Profilati<br/>Che Cercano Casa</div>
                <div className="hero-float-meta">Hai un immobile? Potrebbe interessare a loro ›</div>
              </div>
            </Link>
            <Link to="/strumenti" className="hero-float">
              <div className="hero-float-badge">GRATIS</div>
              <div className="hero-float-icon hero-float-icon-tools"><Sparkles size={22} /></div>
              <div className="hero-float-body">
                <div className="hero-float-eb">5 strumenti free</div>
                <div className="hero-float-ttl">Calcolatori per investitori</div>
                <div className="hero-float-meta">Valuta, calcola imposte, ISTAT — senza registrazione ›</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <div className="container"><SearchPanel embedded /></div>

      {/* DOPPIA NATURA — Agenzia + Piattaforma */}
      <section className="container" style={{ marginTop: 96 }}>
        <div style={{ textAlign: "center", maxWidth: 880, margin: "0 auto 48px" }}>
          <span className="t-eyebrow">Più di un'agenzia</span>
          <hr className="rule-gold rule-gold-center" />
          <h2 style={{ fontSize: 48, lineHeight: 1.1, marginTop: 12 }}>
            Una <em style={{ color: "var(--accent)", fontStyle: "italic" }}>piattaforma</em> per il mondo immobiliare.
          </h2>
          <p className="t-lead" style={{ marginTop: 20 }}>
            Da una parte vendiamo, affittiamo e cerchiamo casa per i nostri clienti. Dall'altra mettiamo a disposizione di tutti — gratis — gli strumenti tecnici che usiamo ogni giorno.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="dual-grid">
          <div className="dual-card">
            <div className="dual-icon"><Hammer size={26} /></div>
            <span className="t-eyebrow">Lato umano</span>
            <h3 style={{ fontSize: 28, margin: "8px 0 12px", fontFamily: "var(--font-serif)" }}>Agenzia tradizionale, fatta bene.</h3>
            <p style={{ color: "var(--fg-2)" }}>Compravendite, perizie tecniche, locazioni e affitti turistici. Consulenza personale di un geometra-agente, non di un call-center.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0" }}>
              <li style={{ padding: "6px 0", color: "var(--fg-2)", fontSize: 14 }}>✓ Valutazioni di mercato gratuite</li>
              <li style={{ padding: "6px 0", color: "var(--fg-2)", fontSize: 14 }}>✓ Database acquirenti già profilati</li>
              <li style={{ padding: "6px 0", color: "var(--fg-2)", fontSize: 14 }}>✓ Perizie e visure catastali</li>
            </ul>
          </div>

          <div className="dual-card dual-card-tech">
            <div className="dual-icon dual-icon-tech"><Cpu size={26} /></div>
            <span className="t-eyebrow" style={{ color: "var(--gold-200)" }}>Lato digitale</span>
            <h3 style={{ fontSize: 28, margin: "8px 0 12px", fontFamily: "var(--font-serif)", color: "#FAFAF7" }}>Piattaforma di strumenti gratuiti.</h3>
            <p style={{ color: "rgba(250,250,247,.75)" }}>Calcolatori, simulatori e analisi tecniche accessibili a chiunque. Senza registrazione, senza email obbligatoria. Solo dati utili.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0" }}>
              <li style={{ padding: "6px 0", color: "rgba(250,250,247,.75)", fontSize: 14 }}>✓ Stima valore immobile per zona/mq</li>
              <li style={{ padding: "6px 0", color: "rgba(250,250,247,.75)", fontSize: 14 }}>✓ Calcolo imposte e ISTAT</li>
              <li style={{ padding: "6px 0", color: "rgba(250,250,247,.75)", fontSize: 14 }}>✓ Valutatore investimento da ristrutturare</li>
            </ul>
            <Link to="/strumenti" className="btn btn-primary btn-sm" style={{ marginTop: 20 }}>Apri la piattaforma ›</Link>
          </div>
        </div>
      </section>

      {/* PIATTAFORMA STRUMENTI — Sezione dedicata grande */}
      <section className="platform-strip">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 64, alignItems: "center" }} className="platform-grid">
            <div>
              <span className="t-eyebrow" style={{ color: "var(--gold-300)" }}>La piattaforma</span>
              <hr className="rule-gold" />
              <h2 style={{ fontSize: 52, color: "#FAFAF7", lineHeight: 1.05, fontFamily: "var(--font-serif)", fontWeight: 500, margin: "12px 0 20px" }}>
                5 strumenti tecnici.<br/><em style={{ color: "var(--gold-300)", fontStyle: "italic" }}>Gratis. Per sempre.</em>
              </h2>
              <p style={{ color: "rgba(250,250,247,.78)", fontSize: 17, lineHeight: 1.6, marginBottom: 24 }}>
                Calcoli, simulazioni e analisi tecniche che normalmente paghi un perito per ottenere. Qui sono accessibili a chiunque, senza registrazione, senza email obbligatoria.
              </p>
              <p style={{ color: "rgba(250,250,247,.6)", fontSize: 14, fontStyle: "italic" }}>
                Pensati per privati, investitori e professionisti che vogliono numeri reali prima di prendere decisioni importanti.
              </p>
            </div>

            <div className="platform-tools">
              {[
                { n: "01", icon: HomeIcon, name: "Valuta immobile", desc: "Stima il valore di mercato per zona, tipologia e mq. Risultato immediato.", to: "/strumenti/valutazione" },
                { n: "02", icon: TrendingUp, name: "Ristruttura Casa", desc: "Costi dettagliati per tipo di intervento e qualità finiture, con breakdown.", to: "/strumenti/ristruttura" },
                { n: "03", icon: Wrench, name: "Valutatore Inversione PRO", desc: "Offerta massima d'acquisto con tutti i costi (tasse, notaio, ristrutturazione).", to: "/strumenti/inversione" },
                { n: "04", icon: Scale, name: "Spese Acquisto Casa", desc: "Imposte, notaio e mutuo: prima/seconda casa, da privato o impresa.", to: "/strumenti/imposte" },
                { n: "05", icon: BarChart3, name: "Adeguamento ISTAT", desc: "Aggiornamento canone con indici FOI ufficiali e tabella per anno.", to: "/strumenti/istat" },
              ].map((t, i) => (
                <Link key={i} to={t.to} className="platform-tool" data-testid={`platform-tool-${i}`}>
                  <span className="platform-tool-num">{t.n}</span>
                  <div className="platform-tool-icon"><t.icon size={22} /></div>
                  <div>
                    <div className="platform-tool-name">{t.name}</div>
                    <div className="platform-tool-desc">{t.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link to="/strumenti" className="btn btn-primary" data-testid="platform-cta">Apri la piattaforma strumenti ›</Link>
          </div>
        </div>
      </section>

      {/* PROGRAMMA ACQUISITORE OCCASIONALE */}
      <section className="acquisitore-strip">
        <div className="container">
          <div className="acquisitore-grid">
            <div className="acquisitore-icon"><Gift size={56} /></div>
            <div>
              <span className="t-eyebrow" style={{ color: "var(--gold-200)" }}>Programma esclusivo</span>
              <h2 style={{ fontSize: 44, color: "#FAFAF7", margin: "8px 0 16px", lineHeight: 1.1 }}>
                Acquisitore Occasionale<br/><span style={{ color: "var(--gold-300)", fontStyle: "italic" }}>premiato.</span>
              </h2>
              <p style={{ color: "rgba(250,250,247,.85)", fontSize: 17, lineHeight: 1.6, maxWidth: 580 }}>
                Conosci qualcuno che vuole vendere casa? Hai sentito di un immobile in arrivo sul mercato? <strong style={{ color: "#FAFAF7" }}>Segnalalo a noi</strong> — se la trattativa si chiude grazie a te, ti ringraziamo con un <strong style={{ color: "var(--gold-200)" }}>premio dedicato</strong>.
              </p>
              <div className="acquisitore-tiers">
                <div className="tier"><div className="tier-num">1</div><div><strong>Segnali</strong><span>Indicaci un immobile o una zona</span></div></div>
                <div className="tier"><div className="tier-num">2</div><div><strong>Verifichiamo</strong><span>Contattiamo il proprietario</span></div></div>
                <div className="tier"><div className="tier-num">3</div><div><strong>Sei premiato</strong><span>Premio dedicato come ringraziamento</span></div></div>
              </div>
              <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link to="/acquisitore" className="btn btn-primary" data-testid="acquisitore-cta">Scopri il programma</Link>
                <Link to="/segnala-immobile" className="btn btn-ghost-light">Segnala subito ›</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="container">
        <div className="stats">
          <div className="stat"><div className="stat-num">+{stats.listings || 43}</div><div className="stat-lbl">Immobili in database</div></div>
          <div className="stat"><div className="stat-num">{stats.experience_years}+</div><div className="stat-lbl">Anni di esperienza</div></div>
          <div className="stat"><div className="stat-num">5</div><div className="stat-lbl">Strumenti gratuiti</div></div>
          <div className="stat"><div className="stat-num">{stats.rating}<span>★</span></div><div className="stat-lbl">Rating Google</div></div>
        </div>
      </div>

      {/* TRIPLE CTA */}
      <div className="container">
        <div className="triple">
          <div className="triple-card">
            <span className="t-eyebrow">Vendi</span>
            <h3>Valutazione gratuita</h3>
            <p>Strategia di prezzo basata su dati reali del mercato locale. Clienti profilati pronti.</p>
            <Link to="/acquisizioni">Richiedi valutazione ›</Link>
          </div>
          <div className="triple-card">
            <span className="t-eyebrow">Compri</span>
            <h3>Database completo</h3>
            <p>Vendite, affitti turistici, locazioni e immobili non ancora pubblicati. Tutto qui.</p>
            <Link to="/immobili">Vedi vendite ›</Link>
          </div>
          <div className="triple-card">
            <span className="t-eyebrow">Investi</span>
            <h3>Strumenti tecnici</h3>
            <p>Valutatore inversione, calcolo imposte, simulatori. Per decidere con dati, non con istinto.</p>
            <Link to="/strumenti">Apri strumenti ›</Link>
          </div>
        </div>
      </div>

      {/* CLIENTI CERCANO */}
      <section className="container" style={{ marginTop: 96 }}>
        <div className="sec-head">
          <div>
            <span className="t-eyebrow">Domanda reale attiva</span>
            <h2>I nostri clienti cercano casa</h2>
          </div>
          <Link to="/clienti-cercano" className="sec-cta">Vedi tutte ›</Link>
        </div>
        <div className="br-grid">
          {requests.map(r => (
            <div key={r.id} className="br-card">
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
      </section>

      {/* FEATURED VENDITE */}
      {featured.length > 0 && (
        <section className="container" style={{ marginTop: 96 }}>
          <div className="sec-head">
            <div>
              <span className="t-eyebrow">In evidenza · Vendite</span>
              <h2>Case in vendita selezionate</h2>
            </div>
            <Link to="/immobili" className="sec-cta">Vedi tutte le vendite ›</Link>
          </div>
          <div className="pg-grid">
            {featured.map(l => <PropertyCard key={l.id} l={l} />)}
          </div>
        </section>
      )}

      {/* FEATURED AFFITTI */}
      {rentals.length > 0 && (
        <section className="container" style={{ marginTop: 96 }}>
          <div className="sec-head">
            <div>
              <span className="t-eyebrow">In evidenza · Affitti</span>
              <h2>Soluzioni in locazione</h2>
            </div>
            <Link to="/affitti" className="sec-cta">Vedi tutti gli affitti ›</Link>
          </div>
          <div className="pg-grid">
            {rentals.map(l => <PropertyCard key={l.id} l={l} />)}
          </div>
        </section>
      )}

      {/* TOOLS (mini) */}
      <section className="container" style={{ marginTop: 96 }}>
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 32px" }}>
          <span className="t-eyebrow">Riepilogo strumenti</span>
          <hr className="rule-gold rule-gold-center" />
          <h2 style={{ fontSize: 32 }}>I 5 calcolatori in un colpo d'occhio</h2>
        </div>
        <div className="tools-grid">
          {[
            { icon: HomeIcon, name: "Valuta immobile", desc: "Stima il valore di mercato per zona e mq", to: "/strumenti/valutazione" },
            { icon: Hammer, name: "Ristruttura Casa", desc: "Costi dettagliati di ristrutturazione", to: "/strumenti/ristruttura" },
            { icon: Wrench, name: "Inversione PRO", desc: "Offerta max con tutti i costi inclusi", to: "/strumenti/inversione" },
            { icon: Scale, name: "Spese Acquisto", desc: "Imposte, notaio, mutuo: prima/seconda casa", to: "/strumenti/imposte" },
            { icon: BarChart3, name: "ISTAT con tabella", desc: "Adeguamento canone FOI dettagliato", to: "/strumenti/istat" },
          ].map((t, i) => (
            <Link key={i} to={t.to} className="tool-card">
              <div className="tool-icon"><t.icon size={22} /></div>
              <div className="tool-name">{t.name}</div>
              <div className="tool-desc">{t.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <div className="cta-strip">
        <div className="cta-strip-inner">
          <h2>Zero stress, solo case.</h2>
          <p>Vendi, compri, investi o cerchi solo numeri reali? Siamo qui.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`tel:${AGENCY.phoneDial}`} className="btn btn-primary">Chiama: {AGENCY.phone}</a>
            <a href={`https://wa.me/${AGENCY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">WhatsApp: {AGENCY.mobile}</a>
            <Link to="/contatti" className="btn btn-ghost-light">Scrivici</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
