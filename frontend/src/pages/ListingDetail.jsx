import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { api, formatErr, AGENCY } from "../lib/api";
import { goldIcon } from "../lib/leafletSetup";

const FALLBACK = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80";

export default function ListingDetailPage() {
  const { id } = useParams();
  const [l, setL] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/listings/${id}`).then(r => {
      setL(r.data);
      setForm(f => ({ ...f, message: `Sono interessato all'immobile: ${r.data.title} (${r.data.town}). Vorrei maggiori informazioni.` }));
    });
  }, [id]);

  if (!l) return <div className="container" style={{ padding: 96 }}>Caricamento...</div>;

  const imgs = (l.images && l.images.length > 0) ? l.images : [FALLBACK];

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/contact", { ...form, kind: "listing-inquiry", listing_id: l.id });
      setSent(true);
    } catch (err) { setError(formatErr(err)); }
  };

  return (
    <div className="container listing-detail" data-testid="listing-detail">
      <div style={{ marginBottom: 16 }}>
        <Link to="/immobili" className="t-meta" style={{ color: "var(--accent)" }}>‹ Torna agli immobili</Link>
      </div>

      <div className="ld-gallery">
        <div className="ld-main-img"><img src={imgs[0]} alt={l.title} /></div>
        {imgs.length > 1 && (
          <div className="ld-thumbs">
            {imgs.slice(1, 4).map((src, i) => (
              <div key={i} className="ld-thumb"><img src={src} alt={`${l.title} ${i+2}`} /></div>
            ))}
          </div>
        )}
      </div>

      <div className="ld-grid">
        <div>
          <span className="t-eyebrow">{l.town} · {l.type}</span>
          <h1 style={{ fontSize: 48, marginTop: 8 }}>{l.title}</h1>

          <div className="ld-meta">
            <div className="ld-meta-item"><strong>Superficie</strong>{l.sqm} mq</div>
            <div className="ld-meta-item"><strong>Locali</strong>{l.rooms}</div>
            <div className="ld-meta-item"><strong>Bagni</strong>{l.baths}</div>
            <div className="ld-meta-item"><strong>Classe energetica</strong>{l.energy}</div>
            {l.tag && <div className="ld-meta-item"><strong>Caratteristica</strong>{l.tag}</div>}
          </div>

          <h3 style={{ fontSize: 22, marginBottom: 12 }}>Descrizione</h3>
          <p style={{ color: "var(--fg-2)", lineHeight: 1.7 }}>{l.description}</p>

          {l.lat && l.lng && (
            <div className="ld-map" data-testid="listing-map">
              <MapContainer center={[l.lat, l.lng]} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                <Marker position={[l.lat, l.lng]} icon={goldIcon}>
                  <Popup>{l.title}<br/>{l.town}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>

        <aside className="ld-side">
          <div className="ld-side-price">{l.price}</div>
          <p className="t-meta" style={{ marginBottom: 24 }}>Richiedi maggiori informazioni o prenota una visita.</p>
          {sent ? (
            <div data-testid="inquiry-sent">
              <span className="t-eyebrow" style={{ color: "var(--success)" }}>Richiesta inviata</span>
              <h3 style={{ fontSize: 24, marginTop: 8 }}>Grazie {form.name}.</h3>
              <p style={{ color: "var(--fg-2)" }}>Ti rispondiamo entro la giornata.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="form" style={{ padding: 0, border: 0 }} data-testid="inquiry-form">
              <div className="cf-field"><label>Nome</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="cf-field"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              <div className="cf-field"><label>Telefono</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="cf-field"><label>Messaggio</label><textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} /></div>
              {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
              <button type="submit" className="btn btn-primary cf-submit" data-testid="inquiry-submit">Invia richiesta</button>
              <a href={`https://wa.me/${AGENCY.whatsapp}?text=${encodeURIComponent("Ciao, sono interessato a: " + l.title)}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost cf-submit" style={{ marginTop: 8 }}>WhatsApp</a>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
