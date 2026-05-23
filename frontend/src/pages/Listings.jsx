import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { SearchPanel } from "../components/SearchPanel";
import { PropertyCard } from "../components/PropertyCard";

export default function ListingsPage({ category = "vendita" }) {
  const [params] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subType, setSubType] = useState("Tutti"); // per affitti: Locazione, Affitto breve

  useEffect(() => {
    setLoading(true);
    const q = {};
    if (category === "vendita") {
      q.type = "Vendita";
    }
    if (params.get("zone")) q.zone = params.get("zone");
    if (params.get("rooms")) q.rooms = params.get("rooms");
    if (params.get("pmax")) q.pmax = params.get("pmax");
    api.get("/listings", { params: q })
      .then(r => {
        let data = r.data;
        if (category === "affitto") {
          data = data.filter(l => l.type === "Locazione" || l.type === "Affitto breve");
          if (subType !== "Tutti") data = data.filter(l => l.type === subType);
        }
        setItems(data);
      })
      .finally(() => setLoading(false));
  }, [params, category, subType]);

  const isVendita = category === "vendita";

  return (
    <div className="container sr-page" data-testid={`listings-page-${category}`}>
      <div className="sr-head">
        <span className="t-eyebrow">{isVendita ? "Vendite" : "Affitti"}</span>
        <hr className="rule-gold" />
        <h1>{isVendita ? "Case in vendita sulla Riviera Ligure" : "Case in affitto sulla Riviera Ligure"}</h1>
        <p className="t-meta">{loading ? "Caricamento..." : `${items.length} immobili disponibili · aggiornati oggi`}</p>
      </div>

      {!isVendita && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["Tutti", "Locazione", "Affitto breve"].map(t => (
            <button
              key={t}
              onClick={() => setSubType(t)}
              className={`btn ${subType === t ? "btn-primary" : "btn-ghost"} btn-sm`}
              data-testid={`subtype-${t.toLowerCase().replace(/\s/g, "-")}`}
            >{t}</button>
          ))}
        </div>
      )}

      <SearchPanel category={category} />

      {!loading && items.length === 0 && (
        <div style={{ padding: 96, textAlign: "center", color: "var(--fg-3)" }}>
          Nessun immobile trovato con i filtri selezionati.
        </div>
      )}
      <div className="pg-grid" style={{ marginTop: 32 }}>
        {items.map(l => <PropertyCard key={l.id} l={l} />)}
      </div>
    </div>
  );
}
