# Deployment Guide

Questo progetto è composto da **frontend** (React) + **backend** (FastAPI) + **MongoDB**. Per pubblicarlo online ci sono diverse opzioni — eccole in ordine di semplicità.

---

## 🥇 Opzione A — Deploy con Emergent (più semplice, 1 click)

1. Apri questo progetto nella tua workspace Emergent
2. Clicca il pulsante **Deploy** in alto a destra
3. Scegli il piano (c'è una versione gratuita di prova)
4. In 2-3 minuti il sito è online su un dominio tipo `daniela-immobiliare.emergent.host`
5. Da Emergent puoi anche **collegare il tuo dominio personalizzato** (es. `daniela-immobiliare.it`)

**Vantaggi**: frontend + backend + database tutti gestiti, niente da configurare.
**Costo**: vedi il pannello deploy per i prezzi attuali.

---

## 🥈 Opzione B — Render.com (backend gratis) + Vercel (frontend gratis)

### B1. Backend su Render

1. Vai su https://render.com e crea un account gratuito
2. Crea un nuovo **"Web Service"**
3. Collega il tuo repo GitHub
4. Configura:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables** (le aggiungi nella tab Environment):
   - `MONGO_URL` → connection string MongoDB Atlas (vedi B2)
   - `DB_NAME` → es. `daniela_immobiliare`
   - `CORS_ORIGINS` → `https://tuo-frontend.vercel.app,https://tuo-dominio.com`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (per accesso admin)
   - `JWT_SECRET` → stringa random lunga 50+ caratteri (genera con `openssl rand -hex 32`)
   - `EMERGENT_LLM_KEY` → la tua Universal Key Emergent
6. Deploy! Render ti darà un URL tipo `https://daniela-backend.onrender.com`

### B2. MongoDB Atlas (database gratuito)

1. Vai su https://www.mongodb.com/cloud/atlas e crea account
2. Crea un cluster **M0 Free** (512 MB gratis)
3. Crea utente database (User + password)
4. Network Access → "Allow Access from Anywhere" (0.0.0.0/0) — per Render
5. Connect → "Connect your application" → copia la connection string
   ```
   mongodb+srv://user:pass@cluster.xxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Incollala in `MONGO_URL` su Render

### B3. Frontend su Vercel

1. Vai su https://vercel.com e collega il repo GitHub
2. **Root Directory**: `frontend`
3. **Build Command**: `yarn build`
4. **Output Directory**: `build`
5. **Environment Variables**:
   - `REACT_APP_BACKEND_URL` → l'URL di Render (es. `https://daniela-backend.onrender.com`)
6. Deploy!

### B4. Aggancia il dominio

Su Vercel, **Settings → Domains**, aggiungi `daniela-immobiliare.it` (o il tuo dominio) e segui le istruzioni DNS.

---

## 🥉 Opzione C — Railway.app (tutto in 1 posto, semplice)

Railway permette di hostare backend + database + frontend insieme.

1. https://railway.app → New Project → Deploy from GitHub
2. Railway rileva automaticamente Python e React e crea 2 servizi
3. Aggiungi un **MongoDB plugin** (Add Service → Database → MongoDB)
4. Configura variabili d'ambiente come in Render
5. Generate Domain → ottieni `*.railway.app`

---

## 🧪 Test post-deploy

Dopo aver deployato, verifica che tutto funzioni:

```bash
# Backend
curl https://tuo-backend.com/api/stats
# → dovrebbe ritornare JSON con listings/buyer_requests count

# Frontend
# Apri il sito in browser e prova:
# - /immobili (deve mostrare gli immobili)
# - /blog (deve mostrare 6 articoli)
# - chat in basso a sinistra (chiedi qualcosa, deve rispondere)
# - /admin/login (login con ADMIN_EMAIL / ADMIN_PASSWORD)
```

---

## ⚠️ Note di sicurezza per produzione

1. **Cambia subito `ADMIN_PASSWORD`** in `.env`
2. **Genera un `JWT_SECRET` random vero** (no default!)
3. **Imposta `CORS_ORIGINS`** solo ai tuoi domini reali (non `*` in produzione)
4. **Disabilita `secure=False` nei cookie**: in `backend/server.py` riga `response.set_cookie(..., secure=False, ...)` → cambia in `secure=True` quando sei in HTTPS
5. **Rate-limit la chat AI**: l'endpoint `/api/chat/message` è pubblico. Considera di aggiungere rate-limiting (es. `slowapi`) per proteggere il budget della Universal Key Emergent.

---

## 💸 Costi indicativi (gennaio 2026)

| Servizio | Tier gratuito | A pagamento |
|---|---|---|
| **Emergent Deploy** | Trial | da ~$10/mese |
| **Render** (backend) | 750h/mese gratis (si spegne in idle) | $7/mese (always-on) |
| **MongoDB Atlas** | 512 MB gratis per sempre | da $9/mese |
| **Vercel** (frontend) | Gratis per progetti personali | $20/mese pro |
| **Railway** | $5 credito gratuito | pay-as-you-go |

Per partire: **B (Render + Atlas + Vercel) tutto a 0€/mese** finché il traffico è basso.
