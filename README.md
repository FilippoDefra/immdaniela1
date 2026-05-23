# Database Immobiliare Daniela — Sito Completo

Sito immobiliare full-stack per agenzia boutique sulla Riviera Ligure di Ponente (Loano, Pietra Ligure, Borghetto, Finale, Albenga).

**Stack**: React (Create React App) · FastAPI (Python) · MongoDB · Claude Sonnet 4.5 (chat AI)

---

## ✨ Funzionalità

- **Frontend pubblico**
  - Homepage con hero panoramico di Loano + ricerca immobili
  - Listing vendite/affitti con filtri (zona, prezzo, locali)
  - Pagina dettaglio immobile con galleria, mappa Leaflet, contatto rapido
  - "Clienti che cercano casa" — richieste pubbliche profilate
  - **Blog** con 6 articoli pre-caricati sul mercato immobiliare ligure
  - **5 strumenti calcolatori gratuiti**: valutazione, ristrutturazione, inversione PRO, imposte acquisto, ISTAT
  - Programma "Acquisitore Occasionale"
  - Pagina Agenzia con galleria territorio Loano
  - **Chat AI** flottante (Claude Sonnet 4.5) che risponde 24/7 in italiano
  - Form contatti + valutazione gratuita + segnalazione immobile

- **Backend (FastAPI)**
  - CRUD completo su immobili, buyer-requests, contatti, blog
  - Autenticazione admin con JWT + cookie httponly + bcrypt
  - Endpoint pubblico chat AI con persistenza conversazioni
  - Seed automatico al primo avvio (admin user, buyer requests, blog posts)

- **Admin (/admin)**
  - Gestione immobili (CRUD con upload immagini base64)
  - Gestione richieste clienti
  - Lettura form contatti
  - **CRUD blog** con editor markdown-light
  - **Visualizzazione conversazioni chat AI** con auto-refresh

---

## 🚀 Come usare questo progetto

### Opzione 1 — Continuare lo sviluppo su Emergent (consigliato)
Continua a usare la preview di Emergent dove il sito gira già con backend + database. Quando vuoi pubblicarlo, usa il pulsante **Deploy** in alto a destra (1 click → frontend + backend + DB online su un dominio Emergent).

### Opzione 2 — Pubblicare su altri host
Vedi `DEPLOYMENT.md` per le istruzioni di deploy su:
- **Render.com** (backend Python gratis + MongoDB Atlas gratis)
- **Railway.app** (full-stack semplice)
- **Vercel + Render** (frontend Vercel, backend Render)

---

## 📂 Struttura del progetto

```
.
├── backend/
│   ├── server.py              # FastAPI app principale
│   ├── blog_seeds.py          # 6 articoli pre-caricati
│   ├── import_real_listings.py # Importa 10 immobili reali da fdimmobiliareloano.it
│   ├── requirements.txt
│   └── .env                   # MONGO_URL, ADMIN_*, JWT_SECRET, EMERGENT_LLM_KEY
│
└── frontend/
    ├── src/
    │   ├── App.js             # Routes
    │   ├── index.css          # Stili globali
    │   ├── pages/
    │   │   ├── HomeV2.jsx     # Homepage attuale (con foto Loano)
    │   │   ├── Listings.jsx
    │   │   ├── ListingDetail.jsx
    │   │   ├── Blog.jsx       # Blog (list + detail)
    │   │   ├── Static.jsx     # Agenzia (con galleria Loano)
    │   │   ├── Forms.jsx      # Contatti, valutazione, segnalazione
    │   │   ├── Tools.jsx      # 5 calcolatori
    │   │   └── Admin.jsx      # Admin con tab Blog + Chat
    │   ├── components/
    │   │   ├── Layout.jsx     # Header, Footer, ChatWidget mount
    │   │   ├── ChatWidget.jsx # Widget chat AI
    │   │   └── ...
    │   ├── assets/
    │   │   ├── loano-panorama.jpg
    │   │   ├── loano-centro-storico.jpg
    │   │   └── loano-*.jpg    # 5 foto di Loano
    │   └── lib/
    │       └── api.js         # Axios instance + dati agenzia
    ├── public/
    └── package.json
```

---

## 🔧 Setup locale (solo se vuoi sviluppare localmente)

### Requisiti
- Python 3.11+
- Node 18+ (con yarn)
- MongoDB locale (o connection string Atlas)

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # poi modifica
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

### Seed dati immobili reali (10 immobili)
```bash
cd backend
python import_real_listings.py
```

---

## 🔐 Variabili d'ambiente

### Backend (`backend/.env`)
```
MONGO_URL="mongodb://localhost:27017"        # o connection string Atlas
DB_NAME="test_database"
CORS_ORIGINS="*"
ADMIN_EMAIL="admin@daniela-immobiliare.it"   # cambia con la tua
ADMIN_PASSWORD="ChangeMe!2026"               # cambia con la tua
JWT_SECRET="<una stringa random lunga>"
EMERGENT_LLM_KEY="sk-emergent-..."           # per la chat AI Claude
```

### Frontend (`frontend/.env`)
```
REACT_APP_BACKEND_URL=https://tuo-backend-url.com
```

---

## 🤖 Chat AI

La chat usa **Claude Sonnet 4.5** via Emergent Universal Key. Il system prompt è in `backend/server.py` (variabile `CHAT_SYSTEM_PROMPT`) e include:
- Info contatto agenzia
- Servizi offerti
- Tutte le pagine del sito
- Regole comportamentali (italiano, rimando a /contatti per casi specifici, ecc.)

Se il budget della Universal Key si esaurisce, ricaricalo dal **Profilo Emergent → Universal Key → Add Balance**.

---

## 📊 Admin

Accedi a `/admin/login` con le credenziali in `.env`:
- Email: `admin@daniela-immobiliare.it`
- Password: `ChangeMe!2026` **(cambiala in produzione!)**

5 tab disponibili:
1. **Immobili** — CRUD con upload foto
2. **Clienti cercano** — gestione richieste pubbliche
3. **Richieste contatto** — form arrivati dal sito
4. **Blog** — CRUD articoli con editor markdown-light
5. **Chat AI** — lista conversazioni con auto-refresh, dettaglio messaggi

---

## 📷 Crediti immagini

Foto di Loano da Wikimedia Commons (Creative Commons):
- Panorama costiero — © Al*from*Lig, CC BY-SA 4.0
- Centro storico — © Davide Papalini, CC BY-SA 3.0
- Vista aerea, molo Doria, panorama — vari autori, CC BY-SA

Per uso in produzione aggiungi un credit nel footer o nella pagina legale.

---

## ⚖️ Licenza

Codice: tua proprietà.
Foto Wikimedia: CC BY-SA (richiede attribuzione).
