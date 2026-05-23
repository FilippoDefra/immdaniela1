import React, { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { AGENCY } from "../lib/api";
import { ChatWidget } from "./ChatWidget";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/immobili", label: "Vendite" },
  { to: "/affitti", label: "Affitti" },
  { to: "/clienti-cercano", label: "Clienti che cercano casa" },
  { to: "/strumenti", label: "Strumenti gratuiti" },
  { to: "/acquisitore", label: "Acquisitore Occasionale" },
  { to: "/blog", label: "Blog" },
  { to: "/agenzia", label: "Agenzia" },
  { to: "/contatti", label: "Contatti" },
];

export function Header() {
  const [mob, setMob] = useState(false);
  return (
    <>
      <header className="hd" data-testid="site-header">
        <div className="hd-inner">
          <Link to="/" className="hd-brand" data-testid="brand-link">
            <img src="/assets/logo.png" alt="Database Immobiliare Daniela" style={{ height: 72 }} />
          </Link>
          <nav className="hd-links">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.end} data-testid={`nav-${n.to.replace(/\//g, "") || "home"}`}>
                {({ isActive }) => <span className={isActive ? "active" : ""}>{n.label}</span>}
              </NavLink>
            ))}
          </nav>
          <Link to="/contatti" className="hd-cta" data-testid="header-cta">Prenota una visita</Link>
          <button className="hd-mobile-toggle" onClick={() => setMob(true)} aria-label="Menu" data-testid="mobile-menu-open">
            <Menu size={20} />
          </button>
        </div>
      </header>
      {mob && (
        <div className="mobile-menu" data-testid="mobile-menu">
          <button className="mobile-menu-close btn btn-ghost btn-sm" onClick={() => setMob(false)} aria-label="Chiudi">
            <X size={20} />
          </button>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setMob(false)}>
              {({ isActive }) => <span className={isActive ? "active" : ""}>{n.label}</span>}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="ft" data-testid="site-footer">
      <div className="ft-inner">
        <div className="ft-col">
          <img src="/assets/logo.png" alt="" className="ft-logo" />
          <p className="ft-tag">{AGENCY.tagline}</p>
        </div>
        <div className="ft-col">
          <h4>Sede</h4>
          <p>{AGENCY.address}<br/>Sede legale: {AGENCY.legalAddress}</p>
        </div>
        <div className="ft-col">
          <h4>Contatti</h4>
          <p>Tel: <a href={`tel:${AGENCY.phoneDial}`}>{AGENCY.phone}</a><br/>Mobile / WhatsApp: <a href={`tel:${AGENCY.mobileDial}`}>{AGENCY.mobile}</a><br/>{AGENCY.email}</p>
        </div>
        <div className="ft-col">
          <h4>Zone</h4>
          <p>{AGENCY.zones.join(" · ")}</p>
        </div>
      </div>
      <div className="ft-legal">
        <span>© 2026 {AGENCY.legalName}</span>
        <span>P.IVA {AGENCY.piva}</span>
        <span>Iscritta FIMAA</span>
      </div>
    </footer>
  );
}

export function WhatsappFloat() {
  const txt = encodeURIComponent("Ciao, ho visitato il vostro sito e vorrei maggiori informazioni.");
  return (
    <a href={`https://wa.me/${AGENCY.whatsapp}?text=${txt}`} target="_blank" rel="noopener noreferrer" className="wa-float" data-testid="whatsapp-float" aria-label="WhatsApp">
      <MessageCircle size={28} color="#fff" />
    </a>
  );
}

export function Layout({ children }) {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");
  return (
    <>
      {!isAdmin && <Header />}
      {children}
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsappFloat />}
      {!isAdmin && <ChatWidget />}
    </>
  );
}
