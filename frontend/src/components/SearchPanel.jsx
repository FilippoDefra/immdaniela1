import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function SearchPanel({ embedded = false, category = null }) {
  const nav = useNavigate();
  const [zone, setZone] = useState("Tutte");
  const [type, setType] = useState(category === "affitto" ? "Locazione" : "Vendita");
  const [pmax, setPmax] = useState("");
  const [rooms, setRooms] = useState("Indiff.");

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (zone !== "Tutte") params.set("zone", zone);
    if (pmax) params.set("pmax", pmax);
    if (rooms !== "Indiff.") params.set("rooms", rooms);
    // Naviga alla sezione corretta in base al tipo selezionato
    const isAffitto = type === "Locazione" || type === "Affitto breve";
    const path = isAffitto ? "/affitti" : "/immobili";
    nav(`${path}?${params.toString()}`);
  };

  // Se siamo già nella sezione vendita o affitto, nascondiamo il selettore tipo
  const showTypeField = !category;

  return (
    <form className={`sp ${embedded ? "sp-embed" : ""}`} onSubmit={submit} data-testid="search-panel" style={!showTypeField ? { gridTemplateColumns: "1.5fr 1fr 1fr auto" } : undefined}>
      <div className="sp-field">
        <label>Località</label>
        <select value={zone} onChange={e => setZone(e.target.value)} data-testid="search-zone">
          <option>Tutte</option>
          <option>Loano</option>
          <option>Boissano</option>
          <option>Borghetto Santo Spirito</option>
          <option>Toirano</option>
          <option>Ceriale</option>
          <option>Pietra Ligure</option>
          <option>Finale Ligure</option>
          <option>Albenga</option>
        </select>
      </div>
      {showTypeField && (
        <div className="sp-field">
          <label>Tipologia</label>
          <select value={type} onChange={e => setType(e.target.value)} data-testid="search-type">
            <option>Vendita</option>
            <option>Locazione</option>
            <option>Affitto breve</option>
          </select>
        </div>
      )}
      <div className="sp-field">
        <label>Prezzo max</label>
        <div className="sp-input-prefix">
          <span>€</span>
          <input type="text" value={pmax} onChange={e => setPmax(e.target.value)} placeholder={category === "affitto" ? "1.500" : "500.000"} data-testid="search-pmax" />
        </div>
      </div>
      <div className="sp-field">
        <label>Locali</label>
        <select value={rooms} onChange={e => setRooms(e.target.value)} data-testid="search-rooms">
          <option>Indiff.</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4+</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary sp-submit" data-testid="search-submit">Cerca</button>
    </form>
  );
}
