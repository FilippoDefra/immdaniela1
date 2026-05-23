from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from anthropic import Anthropic
from blog_seeds import BLOG_SEEDS

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

app = FastAPI(title="Immobiliare Daniela API")
api_router = APIRouter(prefix="/api")

# ============== CONFIG ==============
ENV = os.environ.get("ENV", "development")
IS_PROD = ENV == "production"

CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
if "," in CORS_ORIGINS:
    ALLOWED_ORIGINS = [o.strip() for o in CORS_ORIGINS.split(",")]
else:
    ALLOWED_ORIGINS = [CORS_ORIGINS] if CORS_ORIGINS != "*" else ["*"]

COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true" if IS_PROD else "false").lower() == "true"
COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "none" if IS_PROD else "lax")

# ============== HELPERS ==============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=8), "type": "access"}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Non autenticato")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Utente non trovato")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token scaduto")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token non valido")


# ============== MODELS ==============
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Listing(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    town: str
    type: str  # Vendita, Affitto breve, Locazione
    price: str
    sqm: int
    rooms: int
    baths: int
    energy: str = "G"
    tag: Optional[str] = None
    description: str = ""
    images: List[str] = []  # base64 strings
    lat: Optional[float] = None
    lng: Optional[float] = None
    featured: bool = False
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ListingCreate(BaseModel):
    title: str
    town: str
    type: str
    price: str
    sqm: int
    rooms: int
    baths: int
    energy: str = "G"
    tag: Optional[str] = None
    description: str = ""
    images: List[str] = []
    lat: Optional[float] = None
    lng: Optional[float] = None
    featured: bool = False
    published: bool = True

class BuyerRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    zone: str
    property_type: str
    description: str
    budget: str
    label: Optional[str] = None  # Urgente, Già finanziato, Prima casa, Investimento
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BuyerRequestCreate(BaseModel):
    zone: str
    property_type: str
    description: str
    budget: str
    label: Optional[str] = None
    active: bool = True

class ContactSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    kind: str  # contact, valuation, report, buyer-match
    name: str
    email: str
    phone: Optional[str] = ""
    message: str = ""
    extra: dict = {}
    listing_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read: bool = False

class ContactCreate(BaseModel):
    kind: str = "contact"
    name: str
    email: str
    phone: Optional[str] = ""
    message: str = ""
    extra: dict = {}
    listing_id: Optional[str] = None

# --- Blog ---
class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    category: str = "Generale"
    excerpt: str = ""
    cover: str = ""
    author: str = "Filippo De Francisci"
    read_minutes: int = 5
    tags: List[str] = []
    body: str = ""
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPostCreate(BaseModel):
    slug: str
    title: str
    category: str = "Generale"
    excerpt: str = ""
    cover: str = ""
    author: str = "Filippo De Francisci"
    read_minutes: int = 5
    tags: List[str] = []
    body: str = ""
    published: bool = True

# --- Chat (AI assistant) ---
class ChatMessageIn(BaseModel):
    session_id: Optional[str] = None
    message: str
    visitor_name: Optional[str] = None

class ChatMessageOut(BaseModel):
    session_id: str
    reply: str
    created_at: str

# ============== STARTUP ==============
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.listings.create_index("id", unique=True)
    await db.buyer_requests.create_index("id", unique=True)
    await db.contact_submissions.create_index("id", unique=True)
    await db.blog_posts.create_index("slug", unique=True)
    await db.chat_sessions.create_index("session_id", unique=True)

    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # Seed default buyer requests if empty
    if await db.buyer_requests.count_documents({}) == 0:
        seeds = [
            {"zone": "Loano", "property_type": "Appartamento", "description": "Vista mare, box, terrazzo, 2 camere", "budget": "400.000 €", "label": "Urgente"},
            {"zone": "Loano / Borghetto", "property_type": "Villa", "description": "Indipendente o bifamiliare, giardino", "budget": "550.000 €", "label": "Già finanziato"},
            {"zone": "Riviera Ponente", "property_type": "Appartamento", "description": "Prima casa, 1-2 camere, classe energetica buona", "budget": "220.000 €", "label": "Prima casa"},
            {"zone": "Loano Centro", "property_type": "Locale commerciale", "description": "Piano terra, vetrina su strada principale", "budget": "180.000 €", "label": "Investimento"},
        ]
        for s in seeds:
            br = BuyerRequest(**s)
            doc = br.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            await db.buyer_requests.insert_one(doc)

    # Seed default blog posts if empty
    if await db.blog_posts.count_documents({}) == 0:
        for s in BLOG_SEEDS:
            post = BlogPost(**s)
            doc = post.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            await db.blog_posts.insert_one(doc)

    # Seed default listings if empty (disabled — usa import_real_listings.py)
    if False and await db.listings.count_documents({}) == 0:
        seeds = [
            {"title":"Trilocale con terrazzo vista mare","town":"Pietra Ligure","type":"Vendita","price":"€ 280.000","sqm":95,"rooms":3,"baths":2,"energy":"A","tag":"Vista mare","description":"Splendido trilocale ristrutturato con ampio terrazzo affacciato sul mare. Esposizione luminosa, finiture di pregio.","lat":44.1492,"lng":8.2855,"featured":True},
            {"title":"Bilocale arredato in centro","town":"Loano","type":"Vendita","price":"€ 175.000","sqm":62,"rooms":2,"baths":1,"energy":"C","tag":"Centro storico","description":"Bilocale completamente arredato nel cuore del centro storico di Loano. Pronto per essere abitato.","lat":44.1294,"lng":8.2580,"featured":True},
            {"title":"Casa indipendente con giardino","town":"Albenga","type":"Vendita","price":"€ 420.000","sqm":180,"rooms":5,"baths":3,"energy":"B","tag":"Giardino","description":"Casa indipendente su due livelli con ampio giardino privato di 600 mq. Zona tranquilla e residenziale.","lat":44.0501,"lng":8.2169,"featured":True},
            {"title":"Attico panoramico ristrutturato","town":"Finale Ligure","type":"Vendita","price":"€ 495.000","sqm":110,"rooms":4,"baths":2,"energy":"A","tag":"Esclusiva","description":"Attico di pregio con terrazzo panoramico a 360°. Ristrutturazione totale 2024, classe energetica A.","lat":44.1700,"lng":8.3450},
            {"title":"Monolocale fronte mare","town":"Loano","type":"Affitto breve","price":"€ 95 / notte","sqm":38,"rooms":1,"baths":1,"energy":"D","tag":"Fronte mare","description":"Accogliente monolocale fronte mare, perfetto per soggiorni brevi. Wi-Fi, aria condizionata, balcone vista mare.","lat":44.1280,"lng":8.2620},
            {"title":"Appartamento con due terrazzi","town":"Pietra Ligure","type":"Vendita","price":"€ 220.000","sqm":84,"rooms":3,"baths":2,"energy":"B","tag":"Terrazzi","description":"Appartamento luminoso con due terrazzi. Posizione comoda a servizi e spiaggia.","lat":44.1485,"lng":8.2860},
        ]
        for s in seeds:
            l = Listing(**s)
            doc = l.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            await db.listings.insert_one(doc)

# ============== AUTH ==============
@api_router.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenziali non valide")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=28800,
        path="/"
    )
    return {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin"), "token": token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

# ============== LISTINGS ==============
@api_router.get("/listings")
async def list_listings(
    type: Optional[str] = None,
    zone: Optional[str] = None,
    rooms: Optional[str] = None,
    pmax: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 100
):
    q = {"published": True}
    if type and type != "Tutte":
        q["type"] = type
    if zone and zone != "Tutte":
        q["town"] = zone
    if featured is not None:
        q["featured"] = featured
    items = await db.listings.find(q, {"_id": 0}).sort("created_at", -1).to_list(limit)
    if rooms and rooms not in ("Indiff.", ""):
        if rooms.endswith("+"):
            n = int(rooms[:-1])
            items = [i for i in items if i.get("rooms", 0) >= n]
        else:
            try:
                n = int(rooms)
                items = [i for i in items if i.get("rooms", 0) == n]
            except: pass
    if pmax:
        try:
            pn = int(''.join(c for c in pmax if c.isdigit()))
            def pv(p):
                return int(''.join(c for c in str(p) if c.isdigit()) or "0")
            items = [i for i in items if pv(i.get("price", "0")) <= pn]
        except: pass
    return items

@api_router.get("/listings/{listing_id}")
async def get_listing(listing_id: str):
    item = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Immobile non trovato")
    return item

@api_router.post("/listings")
async def create_listing(payload: ListingCreate, user: dict = Depends(get_current_user)):
    listing = Listing(**payload.model_dump())
    doc = listing.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.listings.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/listings/{listing_id}")
async def update_listing(listing_id: str, payload: ListingCreate, user: dict = Depends(get_current_user)):
    upd = payload.model_dump()
    res = await db.listings.update_one({"id": listing_id}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Immobile non trovato")
    item = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    return item

@api_router.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str, user: dict = Depends(get_current_user)):
    res = await db.listings.delete_one({"id": listing_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Immobile non trovato")
    return {"ok": True}

# ============== BUYER REQUESTS ==============
@api_router.get("/buyer-requests")
async def list_buyer_requests(active: Optional[bool] = True):
    q = {}
    if active is not None:
        q["active"] = active
    items = await db.buyer_requests.find(q, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@api_router.post("/buyer-requests")
async def create_buyer_request(payload: BuyerRequestCreate, user: dict = Depends(get_current_user)):
    br = BuyerRequest(**payload.model_dump())
    doc = br.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.buyer_requests.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/buyer-requests/{rid}")
async def update_buyer_request(rid: str, payload: BuyerRequestCreate, user: dict = Depends(get_current_user)):
    res = await db.buyer_requests.update_one({"id": rid}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Non trovata")
    return await db.buyer_requests.find_one({"id": rid}, {"_id": 0})

@api_router.delete("/buyer-requests/{rid}")
async def delete_buyer_request(rid: str, user: dict = Depends(get_current_user)):
    res = await db.buyer_requests.delete_one({"id": rid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Non trovata")
    return {"ok": True}

# ============== CONTACT SUBMISSIONS ==============
@api_router.post("/contact")
async def submit_contact(payload: ContactCreate):
    sub = ContactSubmission(**payload.model_dump())
    doc = sub.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.contact_submissions.insert_one(doc)
    return {"ok": True, "id": sub.id}

@api_router.get("/contact")
async def list_contacts(user: dict = Depends(get_current_user), kind: Optional[str] = None):
    q = {}
    if kind:
        q["kind"] = kind
    items = await db.contact_submissions.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api_router.put("/contact/{cid}/read")
async def mark_read(cid: str, user: dict = Depends(get_current_user)):
    await db.contact_submissions.update_one({"id": cid}, {"$set": {"read": True}})
    return {"ok": True}

@api_router.delete("/contact/{cid}")
async def delete_contact(cid: str, user: dict = Depends(get_current_user)):
    await db.contact_submissions.delete_one({"id": cid})
    return {"ok": True}

# ============== STATS ==============
@api_router.get("/stats")
async def get_stats():
    n_listings = await db.listings.count_documents({"published": True})
    n_requests = await db.buyer_requests.count_documents({"active": True})
    return {"listings": n_listings, "buyer_requests": n_requests, "experience_years": 30, "satisfaction": 98, "rating": 4.9}

@api_router.get("/")
async def root():
    return {"message": "Immobiliare Daniela API", "version": "1.0"}

# ============== BLOG ==============
@api_router.get("/blog")
async def list_blog_posts(category: Optional[str] = None, limit: int = 50):
    q = {"published": True}
    if category and category != "Tutti":
        q["category"] = category
    items = await db.blog_posts.find(q, {"_id": 0, "body": 0}).sort("created_at", -1).to_list(limit)
    return items

@api_router.get("/blog/admin")
async def admin_list_blog(user: dict = Depends(get_current_user)):
    items = await db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items

@api_router.get("/blog/{slug}")
async def get_blog_post(slug: str):
    item = await db.blog_posts.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Articolo non trovato")
    return item

@api_router.post("/blog")
async def create_blog_post(payload: BlogPostCreate, user: dict = Depends(get_current_user)):
    existing = await db.blog_posts.find_one({"slug": payload.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Slug già in uso")
    post = BlogPost(**payload.model_dump())
    doc = post.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.blog_posts.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/blog/{post_id}")
async def update_blog_post(post_id: str, payload: BlogPostCreate, user: dict = Depends(get_current_user)):
    res = await db.blog_posts.update_one({"id": post_id}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Articolo non trovato")
    return await db.blog_posts.find_one({"id": post_id}, {"_id": 0})

@api_router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str, user: dict = Depends(get_current_user)):
    res = await db.blog_posts.delete_one({"id": post_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Articolo non trovato")
    return {"ok": True}

# ============== CHAT AI ==============
CHAT_SYSTEM_PROMPT = """Sei l'assistente virtuale di **Database Immobiliare Daniela**, agenzia immobiliare boutique sulla Riviera Ligure di Ponente (Loano, Pietra Ligure, Borghetto Santo Spirito, Finale Ligure, Albenga).

LA TUA MISSIONE: aiutare i visitatori del sito a trovare informazioni utili, indirizzarli alle pagine giuste o ai contatti diretti dell'agenzia. Sei caloroso, competente, conciso.

INFORMAZIONI AGENZIA:
- Amministratore: Filippo De Francisci (agente immobiliare e geometra, iscritto FIMAA)
- Sede: Loano (SV) - opera in tutta la Riviera Ligure di Ponente
- Specializzazione: compravendite, perizie tecniche, locazioni, affitti brevi turistici
- Tagline: "Zero stress, solo case."
- 30+ anni di esperienza sul territorio
- Tel: 019 666 940 — WhatsApp/Mobile: 339 717 9087
- Email: info@daniela-immobiliare.it

SERVIZI E PAGINE DEL SITO che puoi suggerire:
- /immobili — case in vendita
- /affitti — affitti turistici e locazioni
- /clienti-cercano — richieste reali di acquirenti già profilati
- /strumenti — 5 calcolatori GRATIS (valutazione, ristrutturazione, inversione PRO, imposte, ISTAT)
- /acquisitore — programma "Acquisitore Occasionale" con premio per chi segnala immobili
- /acquisizioni — richiedi valutazione gratuita del tuo immobile
- /segnala-immobile — segnala un immobile in arrivo
- /blog — articoli su mercato immobiliare ligure
- /contatti — modulo contatti e prenotazione visita

REGOLE:
1. Rispondi sempre in **italiano**, tono professionale ma cordiale, mai vendutori aggressivi.
2. Risposte **brevi** (2-4 frasi tipicamente), vai dritto al punto. Solo se l'utente chiede approfondimento, espandi.
3. Quando rilevante, suggerisci una PAGINA del sito (con il path tipo /strumenti/valutazione) o un CONTATTO diretto.
4. NON inventare prezzi specifici di immobili, non fare valutazioni precise: rimanda sempre al modulo gratuito /acquisizioni o alla telefonata.
5. NON dare consulenza legale o fiscale specifica: rimanda al commercialista o all'agenzia per la propria situazione.
6. Se non sai rispondere, di' "Per questa domanda specifica ti conviene parlare direttamente con noi" + lascia numero/email.
7. Se l'utente chiede informazioni di contatto, dagliele subito chiaramente.
8. Non parlare di altre agenzie immobiliari. Resta focalizzato sui servizi di Daniela.
"""

def _chat_session_key(session_id: str) -> str:
    return f"chat_{session_id}"

@api_router.post("/chat/message", response_model=ChatMessageOut)
async def chat_message(payload: ChatMessageIn, request: Request):
    api_key = os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="Chat AI non configurata")

    session_id = payload.session_id or str(uuid.uuid4())

    # Fetch existing session (don't create yet — only after a successful LLM reply)
    session = await db.chat_sessions.find_one({"session_id": session_id})
    history = (session.get("messages", []) if session else [])[-12:]

    # Build messages list for Anthropic SDK
    messages = []
    for m in history:
        role = "user" if m["role"] == "user" else "assistant"
        messages.append({"role": role, "content": m["text"]})
    messages.append({"role": "user", "content": payload.message})

    now_iso = datetime.now(timezone.utc).isoformat()
    user_msg = {"role": "user", "text": payload.message, "ts": now_iso}

    try:
        anthropic_client = Anthropic(api_key=api_key)
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2048,
            system=CHAT_SYSTEM_PROMPT,
            messages=messages,
        )
        reply = response.content[0].text
    except Exception as e:
        logging.exception("LLM call failed")
        raise HTTPException(status_code=502, detail="Servizio chat momentaneamente non disponibile. Riprova tra poco o contattaci direttamente.")

    assistant_msg = {"role": "assistant", "text": reply, "ts": datetime.now(timezone.utc).isoformat()}

    # Persist only after successful LLM call (no ghost sessions)
    if not session:
        await db.chat_sessions.insert_one({
            "session_id": session_id,
            "visitor_name": payload.visitor_name or "Visitatore",
            "messages": [user_msg, assistant_msg],
            "created_at": now_iso,
            "last_activity": assistant_msg["ts"],
        })
    else:
        await db.chat_sessions.update_one(
            {"session_id": session_id},
            {"$push": {"messages": {"$each": [user_msg, assistant_msg]}},
             "$set": {"last_activity": assistant_msg["ts"]}}
        )
    return ChatMessageOut(session_id=session_id, reply=reply, created_at=assistant_msg["ts"])

@api_router.get("/chat/sessions")
async def list_chat_sessions(user: dict = Depends(get_current_user)):
    items = await db.chat_sessions.find({}, {"_id": 0}).sort("last_activity", -1).to_list(200)
    # add light summary
    for it in items:
        msgs = it.get("messages", [])
        it["message_count"] = len(msgs)
        it["last_message"] = msgs[-1]["text"][:160] if msgs else ""
        it["last_role"] = msgs[-1]["role"] if msgs else ""
    return items

@api_router.get("/chat/sessions/{session_id}")
async def get_chat_session(session_id: str, user: dict = Depends(get_current_user)):
    item = await db.chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Conversazione non trovata")
    return item

@api_router.delete("/chat/sessions/{session_id}")
async def delete_chat_session(session_id: str, user: dict = Depends(get_current_user)):
    await db.chat_sessions.delete_one({"session_id": session_id})
    return {"ok": True}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("server:app", host=host, port=port)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
