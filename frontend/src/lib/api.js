import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export function formatErr(err) {
  const d = err?.response?.data?.detail;
  if (!d) return err?.message || "Errore sconosciuto";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map(e => e?.msg || JSON.stringify(e)).join(" ");
  return String(d);
}

export const AGENCY = {
  name: "Database Immobiliare Daniela",
  shortName: "Immobiliare Daniela",
  legalName: "FD IMMOBILIARE di De Francisci Fabio",
  tagline: "Zero stress, solo case.",
  address: "Via Genova, 20 — 17025 Loano (SV)",
  legalAddress: "Via Genova, 20 — 17025 Loano (SV)",
  pec: "fdimmobiliare@pec.it",
  phone: "019 667779",
  phoneDial: "+39019667779",
  mobile: "333 7246324",
  mobileDial: "+393337246324",
  whatsapp: "393337246324",
  email: "info@fdimmobiliareloano.it",
  piva: "01807360092",
  rea: "SV-",
  zones: ["Loano", "Boissano", "Borghetto Santo Spirito", "Toirano", "Ceriale", "Pietra Ligure", "Finale Ligure", "Albenga"],
  lat: 44.1294,
  lng: 8.2580,
};

export const AGENT = {
  name: "Filippo De Francisci",
  role: "Agente immobiliare e geometra",
  bio: "Sono nato e cresciuto sulla Riviera. Conosco ogni via di Loano, ogni caruggio di Borghetto, ogni borgata di Albenga. Ti aiuto a comprare, vendere o affittare — passo dopo passo.",
  badges: ["FIMAA", "Geometra abilitato", "Perizie tecniche"],
};
