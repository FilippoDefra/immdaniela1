import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { LogOut, Plus, Edit2, Trash2, Eye, X, Upload } from "lucide-react";
import { api, formatErr } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState("listings");

  if (loading) return <div style={{ padding: 96, textAlign: "center" }}>Caricamento...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div data-testid="admin-page">
      <header className="hd">
        <div className="hd-inner">
          <Link to="/admin" className="hd-brand">
            <img src="/assets/logo.png" alt="" />
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 20 }}>Admin</span>
          </Link>
          <div style={{ flex: 1 }} />
          <Link to="/" className="t-meta" style={{ color: "var(--fg-2)" }}>Vai al sito ›</Link>
          <button className="btn btn-ghost btn-sm" onClick={logout} data-testid="admin-logout"><LogOut size={14}/> Esci</button>
        </div>
      </header>

      <div className="admin">
        <div className="admin-tabs">
          {[
            { k: "listings", l: "Immobili" },
            { k: "buyers", l: "Clienti cercano" },
            { k: "leads", l: "Richieste contatto" },
            { k: "blog", l: "Blog" },
            { k: "chat", l: "Chat AI" },
          ].map(t => (
            <button key={t.k} className={`admin-tab ${tab === t.k ? "active" : ""}`} onClick={() => setTab(t.k)} data-testid={`admin-tab-${t.k}`}>{t.l}</button>
          ))}
        </div>

        {tab === "listings" && <ListingsAdmin />}
        {tab === "buyers" && <BuyersAdmin />}
        {tab === "leads" && <LeadsAdmin />}
        {tab === "blog" && <BlogAdmin />}
        {tab === "chat" && <ChatAdmin />}
      </div>
    </div>
  );
}

const EMPTY_LISTING = { title: "", town: "Loano", type: "Vendita", price: "", sqm: 0, rooms: 0, baths: 0, energy: "G", tag: "", description: "", images: [], lat: null, lng: null, featured: false, published: true };

function ListingsAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const refresh = () => api.get("/listings", { params: { limit: 200 } }).then(r => setItems(r.data));
  useEffect(() => { refresh(); }, []);

  const del = async (id) => {
    if (!window.confirm("Eliminare questo immobile?")) return;
    await api.delete(`/listings/${id}`);
    refresh();
  };

  return (
    <>
      <div className="admin-bar">
        <h2 style={{ fontSize: 28 }}>Immobili ({items.length})</h2>
        <button className="btn btn-primary" onClick={() => setEditing({ ...EMPTY_LISTING })} data-testid="admin-new-listing"><Plus size={14}/> Nuovo</button>
      </div>
      <table className="admin-table">
        <thead><tr><th>Titolo</th><th>Zona</th><th>Tipo</th><th>Prezzo</th><th>Featured</th><th></th></tr></thead>
        <tbody>
          {items.map(l => (
            <tr key={l.id}>
              <td>{l.title}</td>
              <td>{l.town}</td>
              <td>{l.type}</td>
              <td>{l.price}</td>
              <td>{l.featured ? "★" : "—"}</td>
              <td className="admin-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(l)} data-testid={`edit-${l.id}`}><Edit2 size={14}/></button>
                <button className="btn btn-danger btn-sm" onClick={() => del(l.id)} data-testid={`delete-${l.id}`}><Trash2 size={14}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <ListingModal listing={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </>
  );
}

function ListingModal({ listing, onClose, onSaved }) {
  const [f, setF] = useState({ ...listing });
  const [error, setError] = useState("");

  const upd = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setF({ ...f, [k]: v });
  };

  const onFile = async (e) => {
    const files = Array.from(e.target.files || []);
    const newImgs = await Promise.all(files.map(file => new Promise((res) => {
      const reader = new FileReader();
      reader.onload = (ev) => res(ev.target.result);
      reader.readAsDataURL(file);
    })));
    setF({ ...f, images: [...(f.images || []), ...newImgs] });
  };

  const removeImg = (i) => setF({ ...f, images: f.images.filter((_, idx) => idx !== i) });

  const save = async () => {
    setError("");
    const payload = {
      ...f,
      sqm: parseInt(f.sqm) || 0,
      rooms: parseInt(f.rooms) || 0,
      baths: parseInt(f.baths) || 0,
      lat: f.lat ? parseFloat(f.lat) : null,
      lng: f.lng ? parseFloat(f.lng) : null,
    };
    try {
      if (f.id) await api.put(`/listings/${f.id}`, payload);
      else await api.post("/listings", payload);
      onSaved();
    } catch (err) { setError(formatErr(err)); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} data-testid="listing-modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>{f.id ? "Modifica" : "Nuovo"} immobile</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="form" style={{ padding: 0, border: 0 }}>
          <div className="cf-field"><label>Titolo</label><input value={f.title} onChange={upd("title")} data-testid="modal-title" /></div>
          <div className="cf-row">
            <div className="cf-field"><label>Zona</label>
              <select value={f.town} onChange={upd("town")}><option>Loano</option><option>Pietra Ligure</option><option>Borghetto Santo Spirito</option><option>Finale Ligure</option><option>Albenga</option></select>
            </div>
            <div className="cf-field"><label>Tipo</label>
              <select value={f.type} onChange={upd("type")}><option>Vendita</option><option>Affitto breve</option><option>Locazione</option></select>
            </div>
          </div>
          <div className="cf-row">
            <div className="cf-field"><label>Prezzo</label><input value={f.price} onChange={upd("price")} placeholder="€ 250.000" /></div>
            <div className="cf-field"><label>Tag</label><input value={f.tag || ""} onChange={upd("tag")} placeholder="Vista mare" /></div>
          </div>
          <div className="cf-row">
            <div className="cf-field"><label>Mq</label><input type="number" value={f.sqm} onChange={upd("sqm")} /></div>
            <div className="cf-field"><label>Locali</label><input type="number" value={f.rooms} onChange={upd("rooms")} /></div>
          </div>
          <div className="cf-row">
            <div className="cf-field"><label>Bagni</label><input type="number" value={f.baths} onChange={upd("baths")} /></div>
            <div className="cf-field"><label>Classe energetica</label>
              <select value={f.energy} onChange={upd("energy")}>{["A","B","C","D","E","F","G"].map(c=><option key={c}>{c}</option>)}</select>
            </div>
          </div>
          <div className="cf-row">
            <div className="cf-field"><label>Latitudine</label><input value={f.lat || ""} onChange={upd("lat")} placeholder="44.1294" /></div>
            <div className="cf-field"><label>Longitudine</label><input value={f.lng || ""} onChange={upd("lng")} placeholder="8.2580" /></div>
          </div>
          <div className="cf-field"><label>Descrizione</label><textarea value={f.description} onChange={upd("description")} /></div>

          <div className="cf-field">
            <label>Immagini</label>
            <div className="img-upload-grid">
              {(f.images || []).map((src, i) => (
                <div key={i} className="img-thumb"><img src={src} alt="" /><button type="button" onClick={() => removeImg(i)}>×</button></div>
              ))}
              <label className="img-upload-btn">
                <Upload size={20} />
                <input type="file" accept="image/*" multiple onChange={onFile} style={{ display: "none" }} data-testid="image-upload" />
              </label>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <label className="cf-check"><input type="checkbox" checked={f.featured} onChange={upd("featured")} /> In evidenza</label>
            <label className="cf-check"><input type="checkbox" checked={f.published} onChange={upd("published")} /> Pubblicato</label>
          </div>

          {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
          <button className="btn btn-primary cf-submit" onClick={save} data-testid="modal-save">Salva</button>
        </div>
      </div>
    </div>
  );
}

function BuyersAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const refresh = () => api.get("/buyer-requests", { params: { active: undefined } }).then(r => setItems(r.data));
  useEffect(() => { refresh(); }, []);

  const empty = { zone: "", property_type: "Appartamento", description: "", budget: "", label: "", active: true };

  const save = async () => {
    if (editing.id) await api.put(`/buyer-requests/${editing.id}`, editing);
    else await api.post("/buyer-requests", editing);
    setEditing(null); refresh();
  };
  const del = async (id) => { if (!window.confirm("Eliminare?")) return; await api.delete(`/buyer-requests/${id}`); refresh(); };

  return (
    <>
      <div className="admin-bar">
        <h2 style={{ fontSize: 28 }}>Richieste clienti ({items.length})</h2>
        <button className="btn btn-primary" onClick={() => setEditing({ ...empty })}><Plus size={14}/> Nuova</button>
      </div>
      <table className="admin-table">
        <thead><tr><th>Zona</th><th>Tipo</th><th>Descrizione</th><th>Budget</th><th>Label</th><th></th></tr></thead>
        <tbody>
          {items.map(r => (
            <tr key={r.id}>
              <td>{r.zone}</td><td>{r.property_type}</td><td>{r.description}</td><td>{r.budget}</td><td>{r.label}</td>
              <td className="admin-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(r)}><Edit2 size={14}/></button>
                <button className="btn btn-danger btn-sm" onClick={() => del(r.id)}><Trash2 size={14}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing.id ? "Modifica" : "Nuova"} richiesta</h3>
            <div className="form" style={{ padding: 0, border: 0 }}>
              <div className="cf-field"><label>Zona</label><input value={editing.zone} onChange={e=>setEditing({...editing, zone: e.target.value})} /></div>
              <div className="cf-field"><label>Tipologia</label>
                <select value={editing.property_type} onChange={e=>setEditing({...editing, property_type: e.target.value})}>
                  <option>Appartamento</option><option>Villa</option><option>Casa indipendente</option><option>Locale commerciale</option><option>Terreno</option>
                </select>
              </div>
              <div className="cf-field"><label>Descrizione</label><textarea value={editing.description} onChange={e=>setEditing({...editing, description: e.target.value})} /></div>
              <div className="cf-row">
                <div className="cf-field"><label>Budget</label><input value={editing.budget} onChange={e=>setEditing({...editing, budget: e.target.value})} /></div>
                <div className="cf-field"><label>Label</label>
                  <select value={editing.label || ""} onChange={e=>setEditing({...editing, label: e.target.value})}>
                    <option value="">--</option><option>Urgente</option><option>Già finanziato</option><option>Prima casa</option><option>Investimento</option>
                  </select>
                </div>
              </div>
              <label className="cf-check"><input type="checkbox" checked={editing.active} onChange={e=>setEditing({...editing, active: e.target.checked})} /> Attiva</label>
              <button className="btn btn-primary cf-submit" onClick={save}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LeadsAdmin() {
  const [items, setItems] = useState([]);
  const refresh = () => api.get("/contact").then(r => setItems(r.data));
  useEffect(() => { refresh(); }, []);
  const markRead = async (id) => { await api.put(`/contact/${id}/read`); refresh(); };
  const del = async (id) => { if (!window.confirm("Eliminare?")) return; await api.delete(`/contact/${id}`); refresh(); };
  return (
    <>
      <div className="admin-bar"><h2 style={{ fontSize: 28 }}>Richieste di contatto ({items.length})</h2></div>
      <table className="admin-table">
        <thead><tr><th>Tipo</th><th>Nome</th><th>Email</th><th>Telefono</th><th>Messaggio</th><th>Data</th><th></th></tr></thead>
        <tbody>
          {items.map(c => (
            <tr key={c.id} style={{ background: c.read ? "transparent" : "rgba(184,134,11,.05)" }}>
              <td><span className="t-meta" style={{ textTransform: "uppercase", letterSpacing: ".08em", fontSize: 11 }}>{c.kind}</span></td>
              <td>{c.name}</td>
              <td><a href={`mailto:${c.email}`} style={{ color: "var(--accent)" }}>{c.email}</a></td>
              <td>{c.phone}</td>
              <td style={{ maxWidth: 280, fontSize: 13 }}>{c.message}{c.extra && Object.keys(c.extra).length > 0 && (<div className="t-meta" style={{ fontSize: 11, marginTop: 4 }}>{Object.entries(c.extra).filter(([,v])=>v).map(([k,v]) => `${k}: ${v}`).join(" · ")}</div>)}</td>
              <td className="t-meta" style={{ fontSize: 12 }}>{new Date(c.created_at).toLocaleString("it-IT")}</td>
              <td className="admin-actions">
                {!c.read && <button className="btn btn-ghost btn-sm" onClick={() => markRead(c.id)} title="Letto"><Eye size={14}/></button>}
                <button className="btn btn-danger btn-sm" onClick={() => del(c.id)}><Trash2 size={14}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ============== BLOG ADMIN ==============
const EMPTY_POST = {
  slug: "", title: "", category: "Vendere", excerpt: "", cover: "/assets/loano-panorama.jpg",
  author: "Filippo De Francisci", read_minutes: 5, tags: [], body: "", published: true
};

function BlogAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const refresh = () => api.get("/blog/admin").then(r => setItems(r.data));
  useEffect(() => { refresh(); }, []);

  const del = async (id) => {
    if (!window.confirm("Eliminare questo articolo?")) return;
    await api.delete(`/blog/${id}`);
    refresh();
  };

  return (
    <>
      <div className="admin-bar">
        <h2 style={{ fontSize: 28 }}>Blog ({items.length})</h2>
        <button className="btn btn-primary" onClick={() => setEditing({ ...EMPTY_POST })} data-testid="admin-new-post"><Plus size={14}/> Nuovo articolo</button>
      </div>
      <table className="admin-table">
        <thead><tr><th>Titolo</th><th>Categoria</th><th>Slug</th><th>Pubblicato</th><th>Data</th><th></th></tr></thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id}>
              <td><strong>{p.title}</strong></td>
              <td><span className="t-meta" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>{p.category}</span></td>
              <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--fg-3)" }}>/{p.slug}</td>
              <td>{p.published ? "✓" : "—"}</td>
              <td className="t-meta" style={{ fontSize: 12 }}>{new Date(p.created_at).toLocaleDateString("it-IT")}</td>
              <td className="admin-actions">
                <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" title="Vedi"><Eye size={14}/></a>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)} data-testid={`edit-post-${p.id}`}><Edit2 size={14}/></button>
                <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}><Trash2 size={14}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <BlogPostEditor post={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </>
  );
}

function BlogPostEditor({ post, onClose, onSaved }) {
  const [form, setForm] = useState({ ...post, tags: Array.isArray(post.tags) ? post.tags.join(", ") : (post.tags || "") });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const isNew = !post.id;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const payload = {
        ...form,
        read_minutes: Number(form.read_minutes) || 5,
        tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : form.tags,
      };
      delete payload.id; delete payload.created_at;
      if (isNew) await api.post("/blog", payload);
      else await api.put(`/blog/${post.id}`, payload);
      onSaved();
    } catch (e2) {
      setErr(formatErr(e2));
    } finally { setSaving(false); }
  };

  return (
    <div className="admin-modal" onClick={onClose}>
      <div className="admin-modal-inner" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 880 }}>
        <div className="admin-modal-head">
          <h3>{isNew ? "Nuovo articolo" : "Modifica articolo"}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={16}/></button>
        </div>
        <form onSubmit={submit} className="admin-form">
          <label>Titolo
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required data-testid="post-title" />
          </label>
          <div className="cf-row">
            <label>Slug (URL)
              <input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} required data-testid="post-slug" />
            </label>
            <label>Categoria
              <select value={form.category} onChange={(e) => set("category", e.target.value)}>
                {["Vendere", "Comprare", "Investire", "Fisco & Bonus", "Ristrutturare", "Generale"].map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <label>Sommario (excerpt)
            <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} required />
          </label>
          <div className="cf-row">
            <label>Immagine di copertina (path o URL)
              <input value={form.cover} onChange={(e) => set("cover", e.target.value)} placeholder="/assets/loano-panorama.jpg" />
            </label>
            <label>Tempo di lettura (min)
              <input type="number" value={form.read_minutes} onChange={(e) => set("read_minutes", e.target.value)} min={1} />
            </label>
          </div>
          <div className="cf-row">
            <label>Autore
              <input value={form.author} onChange={(e) => set("author", e.target.value)} />
            </label>
            <label>Tag (separati da virgola)
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="loano, vendere, valutazione" />
            </label>
          </div>
          <label>Contenuto (supporta ## titoli, **grassetto**, - liste, &gt; citazioni, [link](/path), tabelle |)
            <textarea
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              rows={16}
              required
              data-testid="post-body"
              style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.6 }}
            />
          </label>
          <label className="cf-check">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
            Pubblicato (visibile sul sito)
          </label>
          {err && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{err}</div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Annulla</button>
            <button type="submit" disabled={saving} className="btn btn-primary" data-testid="save-post">{saving ? "Salvataggio…" : (isNew ? "Crea articolo" : "Salva modifiche")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============== CHAT ADMIN ==============
function ChatAdmin() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);

  const refresh = () => api.get("/chat/sessions").then(r => setSessions(r.data));
  useEffect(() => { refresh(); const i = setInterval(refresh, 15000); return () => clearInterval(i); }, []);

  const openSession = async (sid) => {
    const { data } = await api.get(`/chat/sessions/${sid}`);
    setSelected(data);
  };

  const del = async (sid) => {
    if (!window.confirm("Eliminare la conversazione?")) return;
    await api.delete(`/chat/sessions/${sid}`);
    setSelected(null); refresh();
  };

  return (
    <>
      <div className="admin-bar">
        <h2 style={{ fontSize: 28 }}>Conversazioni AI ({sessions.length})</h2>
        <span className="t-meta" style={{ fontSize: 12, color: "var(--fg-3)" }}>Aggiornamento ogni 15 sec.</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "flex-start" }}>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {sessions.length === 0 && <div style={{ padding: 24, color: "var(--fg-3)", fontSize: 14 }}>Nessuna conversazione ancora.</div>}
          {sessions.map(s => (
            <button
              key={s.session_id}
              onClick={() => openSession(s.session_id)}
              data-testid={`chat-session-${s.session_id}`}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "14px 16px", borderBottom: "1px solid var(--border)",
                background: selected?.session_id === s.session_id ? "rgba(184,134,11,.08)" : "transparent",
                cursor: "pointer", border: "none", borderLeft: selected?.session_id === s.session_id ? "3px solid var(--accent)" : "3px solid transparent",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--fg-1)" }}>{s.visitor_name || "Visitatore"}</div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4, lineHeight: 1.4, height: 32, overflow: "hidden" }}>
                <strong>{s.last_role === "user" ? "👤 " : "🤖 "}</strong>{s.last_message}
              </div>
              <div className="t-meta" style={{ fontSize: 11, marginTop: 6 }}>
                {new Date(s.last_activity).toLocaleString("it-IT")} · {s.message_count} messaggi
              </div>
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: 0, minHeight: 400 }}>
          {!selected && <div style={{ padding: 48, textAlign: "center", color: "var(--fg-3)", fontSize: 14 }}>Seleziona una conversazione per leggerla.</div>}
          {selected && (
            <>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{selected.visitor_name}</div>
                  <div className="t-meta" style={{ fontSize: 11 }}>Iniziata {new Date(selected.created_at).toLocaleString("it-IT")}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => del(selected.session_id)}><Trash2 size={14}/> Elimina</button>
              </div>
              <div style={{ padding: 20, maxHeight: 560, overflowY: "auto" }}>
                {selected.messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 14, display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "78%",
                      padding: "10px 14px",
                      borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: m.role === "user" ? "var(--accent)" : "var(--ink-50, #f4f4f0)",
                      color: m.role === "user" ? "#fff" : "var(--fg-1)",
                      fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap",
                    }}>{m.text}</div>
                    <div className="t-meta" style={{ fontSize: 10, marginTop: 4 }}>{new Date(m.ts).toLocaleString("it-IT")}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
