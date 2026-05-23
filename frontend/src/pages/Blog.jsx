import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { api } from "../lib/api";

const CATEGORIES = ["Tutti", "Vendere", "Comprare", "Investire", "Fisco & Bonus", "Ristrutturare"];

export function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [cat, setCat] = useState("Tutti");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/blog", { params: cat !== "Tutti" ? { category: cat } : {} })
      .then(r => setPosts(r.data))
      .finally(() => setLoading(false));
  }, [cat]);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div data-testid="blog-list-page">
      <div className="container-narrow" style={{ padding: "64px 32px 0", textAlign: "center" }}>
        <span className="t-eyebrow">Il blog</span>
        <hr className="rule-gold rule-gold-center" />
        <h1 style={{ fontSize: 56, fontFamily: "var(--font-serif)", fontWeight: 500, lineHeight: 1.05 }}>
          Mercato, dati e <em style={{ color: "var(--accent)", fontStyle: "italic" }}>onestà.</em>
        </h1>
        <p className="t-lead" style={{ marginTop: 16 }}>
          Articoli pratici su vendere, comprare e investire sulla Riviera Ligure di Ponente. Scritti da chi il mercato lo vive, non lo guarda.
        </p>
      </div>

      <div className="container" style={{ marginTop: 56 }}>
        <div className="blog-cats" data-testid="blog-categories">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`blog-cat ${cat === c ? "active" : ""}`}
              onClick={() => setCat(c)}
              data-testid={`blog-cat-${c}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <p style={{ textAlign: "center", padding: 48, color: "var(--fg-3)" }}>Caricamento articoli...</p>}

        {!loading && posts.length === 0 && (
          <p style={{ textAlign: "center", padding: 48, color: "var(--fg-3)" }}>Nessun articolo in questa categoria.</p>
        )}

        {featured && (
          <Link to={`/blog/${featured.slug}`} className="blog-featured" data-testid={`blog-featured-${featured.slug}`}>
            <div className="blog-featured-img" style={{ backgroundImage: `url(${featured.cover})` }} />
            <div className="blog-featured-body">
              <span className="blog-cat-tag">{featured.category}</span>
              <h2 className="blog-featured-ttl">{featured.title}</h2>
              <p className="blog-featured-exc">{featured.excerpt}</p>
              <div className="blog-meta">
                <span><Calendar size={13}/> {new Date(featured.created_at).toLocaleDateString("it-IT", { day:"numeric", month:"long", year:"numeric" })}</span>
                <span><Clock size={13}/> {featured.read_minutes} min lettura</span>
              </div>
            </div>
          </Link>
        )}

        <div className="blog-grid">
          {rest.map(p => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="blog-card" data-testid={`blog-card-${p.slug}`}>
              <div className="blog-card-img" style={{ backgroundImage: `url(${p.cover})` }} />
              <div className="blog-card-body">
                <span className="blog-cat-tag">{p.category}</span>
                <h3 className="blog-card-ttl">{p.title}</h3>
                <p className="blog-card-exc">{p.excerpt}</p>
                <div className="blog-meta">
                  <span><Clock size={12}/> {p.read_minutes} min</span>
                  <span className="blog-card-arrow">Leggi ›</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setPost(null); setNotFound(false);
    api.get(`/blog/${slug}`).then(r => setPost(r.data)).catch(() => setNotFound(true));
    api.get("/blog").then(r => setRelated(r.data.filter(p => p.slug !== slug).slice(0, 3)));
  }, [slug]);

  if (notFound) return (
    <div className="container" style={{ padding: "96px 32px", textAlign: "center" }}>
      <h2>Articolo non trovato.</h2>
      <Link to="/blog" className="btn btn-primary" style={{ marginTop: 24 }}>← Torna al blog</Link>
    </div>
  );

  if (!post) return <div className="container" style={{ padding: 96, textAlign: "center", color: "var(--fg-3)" }}>Caricamento...</div>;

  return (
    <div data-testid="blog-detail-page">
      <div className="blog-detail-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(15,15,15,.35) 0%, rgba(15,15,15,.7) 100%), url(${post.cover})` }}>
        <div className="container-narrow" style={{ padding: "120px 32px 64px", color: "#FAFAF7" }}>
          <Link to="/blog" className="blog-back" data-testid="blog-back">
            <ArrowLeft size={14}/> Tutti gli articoli
          </Link>
          <span className="blog-cat-tag blog-cat-tag-light">{post.category}</span>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontFamily: "var(--font-serif)", fontWeight: 500, lineHeight: 1.08, margin: "16px 0 20px" }}>
            {post.title}
          </h1>
          <div className="blog-meta blog-meta-light">
            <span>{post.author}</span>
            <span>·</span>
            <span><Calendar size={13}/> {new Date(post.created_at).toLocaleDateString("it-IT", { day:"numeric", month:"long", year:"numeric" })}</span>
            <span>·</span>
            <span><Clock size={13}/> {post.read_minutes} min lettura</span>
          </div>
        </div>
      </div>

      <article className="blog-article container-narrow" data-testid="blog-article">
        <BlogBody body={post.body} />

        {post.tags?.length > 0 && (
          <div className="blog-tags">
            <Tag size={14} />
            {post.tags.map(t => <span key={t} className="blog-tag">#{t}</span>)}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="container" style={{ marginTop: 64, paddingBottom: 32 }}>
          <div className="sec-head">
            <div>
              <span className="t-eyebrow">Continua a leggere</span>
              <h2>Altri articoli</h2>
            </div>
            <Link to="/blog" className="sec-cta">Tutto il blog ›</Link>
          </div>
          <div className="blog-grid">
            {related.map(p => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="blog-card">
                <div className="blog-card-img" style={{ backgroundImage: `url(${p.cover})` }} />
                <div className="blog-card-body">
                  <span className="blog-cat-tag">{p.category}</span>
                  <h3 className="blog-card-ttl">{p.title}</h3>
                  <p className="blog-card-exc">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Lightweight markdown-ish renderer (h2, h3, bold, lists, blockquote, paragraphs, tables)
function BlogBody({ body }) {
  const lines = body.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Table detection: starts with "|"
    if (line.trim().startsWith("|") && lines[i+1]?.trim().startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]); i++;
      }
      blocks.push({ type: "table", content: tableLines });
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", content: line.slice(3) });
    } else if (line.startsWith("### ")) {
      blocks.push({ type: "h3", content: line.slice(4) });
    } else if (line.startsWith("> ")) {
      blocks.push({ type: "quote", content: line.slice(2) });
    } else if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2)); i++;
      }
      blocks.push({ type: "ul", content: items });
      continue;
    } else if (line.trim() === "") {
      blocks.push({ type: "spacer" });
    } else {
      blocks.push({ type: "p", content: line });
    }
    i++;
  }

  const inline = (t) =>
    t
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="blog-link">$1</a>');

  return (
    <div className="blog-body">
      {blocks.map((b, idx) => {
        if (b.type === "h2") return <h2 key={idx}>{b.content}</h2>;
        if (b.type === "h3") return <h3 key={idx}>{b.content}</h3>;
        if (b.type === "quote") return <blockquote key={idx} dangerouslySetInnerHTML={{ __html: inline(b.content) }} />;
        if (b.type === "ul") return (
          <ul key={idx}>
            {b.content.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inline(it) }} />)}
          </ul>
        );
        if (b.type === "spacer") return null;
        if (b.type === "table") {
          const rows = b.content.map(l => l.trim().slice(1, -1).split("|").map(c => c.trim()));
          // detect separator row (---)
          const sep = rows.findIndex(r => r.every(c => /^-+$/.test(c.replace(/\s/g, ""))));
          const header = sep >= 0 ? rows[0] : null;
          const body = sep >= 0 ? rows.slice(sep + 1) : rows;
          return (
            <table key={idx} className="blog-table">
              {header && <thead><tr>{header.map((h,j) => <th key={j}>{h}</th>)}</tr></thead>}
              <tbody>
                {body.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci} dangerouslySetInnerHTML={{ __html: inline(c) }}/>)}</tr>)}
              </tbody>
            </table>
          );
        }
        return <p key={idx} dangerouslySetInnerHTML={{ __html: inline(b.content) }} />;
      })}
    </div>
  );
}
