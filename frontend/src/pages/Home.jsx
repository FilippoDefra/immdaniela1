import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, Calculator, Scale, BarChart3, FileText, Star, Sparkles } from "lucide-react";
import { api, AGENCY } from "../lib/api";
import { SearchPanel } from "../components/SearchPanel";
import { PropertyCard } from "../components/PropertyCard";

export default function HomePage() {
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
    <div data-testid="home-page">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grad" />
        <div className="hero-inner">
          <div className="hero-content">
            <span className="t-eyebrow hero-eb">Loano · Pietra Ligure · Albenga</span>
            <hr className="rule-gold hero-rule" />
            <h1 className="hero-ttl">La casa giusta<br/>sulla Riviera.</h1>
            <p className="hero-sub">
              Compravendite, perizie e affitti brevi sulla costa ligure di ponente.
              Seguiti personalmente — passo dopo passo.
            </p>
            <div className="hero-ctas">
              <Link to="/immobili" className="btn btn-primary" data-testid="hero-cta-vendite">Vedi vendite</Link>
              <Link to="/affitti" className="btn btn-ghost-light" data-testid="hero-cta-affitti">Vedi affitti</Link>
              <Link to="/acquisizioni" className="btn btn-ghost-light" data-testid="hero-cta-valuation">Valuta il tuo immobile</Link>
            </div>
          </div>

          {/* Floating eye-catcher cards — right side */}
          <div className="hero-floats">
            <Link to="/clienti-cercano" className="hero-float" data-testid="hero-float-clients">
              <div className="hero-float-icon"><Star size={22} fill="#fff" /></div>
              <div className="hero-float-body">
                <div className="hero-float-eb">Domanda reale attiva</div>
                <div className="hero-float-ttl">Nostri Clienti Profilati<br/>Che Cercano Casa</div>
                <div className="hero-float-meta">Hai un immobile? Potrebbe interessare a loro ›</div>
              </div>
            </Link>
            <Link to="/strumenti" className="hero-float" data-testid="hero-float-tools">
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

      {/* SEARCH PANEL EMBEDDED */}
      <div className="container">
        <SearchPanel embedded />
      </div>

      {/* STATS */}
      <div className="container">
        <div className="stats">
          <div className="stat"><div className="stat-num">+{stats.listings || 150}</div><div className="stat-lbl">Immobili trattati</div></div>
          <div className="stat"><div className="stat-num">{stats.experience_years}+</div><div className="stat-lbl">Anni di esperienza</div></div>
          <div className="stat"><div className="stat-num">{stats.satisfaction}<span>%</span></div><div className="stat-lbl">Clienti soddisfatti</div></div>
          <div className="stat"><div className="stat-num">{stats.rating}<span>★</span></div><div className="stat-lbl">Rating Google</div></div>
        </div>
      </div>

      {/* TRIPLE CTA */}
      <div className="container">
        <div className="triple">
          <div className="triple-card" data-testid="triple-vendi">
            <span className="t-eyebrow">Vuoi vendere?</span>
            <h3>Valutazione gratuita</h3>
            <p>Strategia di prezzo, clienti selezionati già pronti. Niente annunci abbandonati.</p>
            <Link to="/acquisizioni">Richiedi valutazione ›</Link>
          </div>
          <div className="triple-card" data-testid="triple-compra">
            <span className="t-eyebrow">Vuoi comprare?</span>
            <h3>Database completo</h3>
            <p>Accesso al database completo. Vendita, affitto, investimento e immobili non ancora pubblicati.</p>
            <Link to="/immobili">Vedi vendite ›</Link>
          </div>
          <div className="triple-card" data-testid="triple-segnala">
            <span className="t-eyebrow">Conosci un immobile?</span>
            <h3>Segnalalo</h3>
            <p>Segnalaci appartamenti, case o palazzine. Abbiamo clienti reali in attesa.</p>
            <Link to="/segnala-immobile">Segnala ora ›</Link>
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

      {/* TOOLS */}
      <section className="container" style={{ marginTop: 96 }}>
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 32px" }}>
          <span className="t-eyebrow">Strumenti gratuiti</span>
          <hr className="rule-gold rule-gold-center" />
          <h2 style={{ fontSize: 40 }}>Calcola, simula, decidi con dati reali</h2>
          <p className="t-lead" style={{ marginTop: 16 }}>Cinque strumenti professionali, gratuiti, usabili subito — senza registrazione.</p>
        </div>
        <div className="tools-grid">
          {[
            { icon: HomeIcon, name: "Valuta immobile", desc: "Stima il valore di mercato per zona e mq", to: "/strumenti/valutazione" },
            { icon: Calculator, name: "Valutatore Inversione", desc: "Offerta su immobili da ristrutturare", to: "/strumenti/inversione" },
            { icon: Scale, name: "Calcolo Imposte", desc: "Prima e seconda casa, stima precisa", to: "/strumenti/imposte" },
            { icon: BarChart3, name: "Adeguamento ISTAT", desc: "Aggiorna il canone FOI in secondi", to: "/strumenti/istat" },
            { icon: FileText, name: "Visure Catastali", desc: "Richiedi documenti gratuitamente", to: "/strumenti/visure" },
          ].map((t, i) => (
            <Link key={i} to={t.to} className="tool-card" data-testid={`tool-${i}`}>
              <div className="tool-icon"><t.icon size={22} /></div>
              <div className="tool-name">{t.name}</div>
              <div className="tool-desc">{t.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="container" style={{ marginTop: 96 }}>
        <div style={{ maxWidth: 720 }}>
          <span className="t-eyebrow">Perché Database Immobiliare Daniela</span>
          <hr className="rule-gold" />
          <h2 style={{ fontSize: 40 }}>Specialisti del territorio con strumenti che nessun altro ha.</h2>
        </div>
        <div className="why">
          <div className="why-item">
            <h3>30 anni sul territorio</h3>
            <p>Presenti a Loano dal 1995. Conosciamo ogni via, ogni quartiere, ogni opportunità della Riviera.</p>
          </div>
          <div className="why-item">
            <h3>Strumenti tech esclusivi</h3>
            <p>Calcolatori, simulatori e analisi che anticipano il mercato. Il primo hub digitale immobiliare della Riviera.</p>
          </div>
          <div className="why-item">
            <h3>Clienti reali in attesa</h3>
            <p>Database di acquirenti qualificati pronti ad acquistare. Il tuo immobile ha già un pubblico.</p>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <div className="cta-strip">
        <div className="cta-strip-inner">
          <h2>Zero stress, solo case.</h2>
          <p>Cerchi, vendi, o vuoi capire quanto vale la tua casa? Parliamone.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`tel:${AGENCY.phoneDial}`} className="btn btn-primary" data-testid="cta-call">Chiama: {AGENCY.phone}</a>
            <a href={`https://wa.me/${AGENCY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light" data-testid="cta-whatsapp">WhatsApp: {AGENCY.mobile}</a>
            <Link to="/contatti" className="btn btn-ghost-light">Scrivici</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
