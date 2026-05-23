"""
Scraper completo per fdimmobiliareloano.it
Scarica tutti gli immobili con: descrizione, superficie, locali, foto galleria, classe energetica
"""
import asyncio, os, uuid, re, sys
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
import requests
from bs4 import BeautifulSoup

load_dotenv(Path(__file__).parent / '.env')
from motor.motor_asyncio import AsyncIOMotorClient

BASE = "https://www.fdimmobiliareloano.it"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

ZONE_COORDS = {
    "Loano": (44.1294, 8.2580), "Boissano": (44.1486, 8.2228),
    "Borghetto Santo Spirito": (44.1130, 8.2389), "Toirano": (44.1283, 8.2069),
    "Ceriale": (44.0921, 8.2287), "Pietra Ligure": (44.1485, 8.2860),
    "Finale Ligure": (44.1700, 8.3450), "Albenga": (44.0501, 8.2169),
}

URL_RE = re.compile(r'/immobili/[a-z][a-z-]+/[A-Za-z0-9-]+')

def extract_urls_from_html(html):
    found = set()
    for m in URL_RE.findall(html):
        full = BASE + m if m.startswith("/") else m
        # Filtra finti link
        if not full.endswith("/immobili/") and full.count("/") >= 5:
            found.add(full)
    return found

def discover_urls():
    """BFS: home + ogni pagina dettaglio (che mostra correlati) finché non trova nuovi URL"""
    visited = set()
    to_visit = {f"{BASE}/", f"{BASE}/?pag=2", f"{BASE}/?pag=3", f"{BASE}/?pag=4", f"{BASE}/?pag=5"}
    detail_urls = set()

    while to_visit:
        url = to_visit.pop()
        if url in visited: continue
        visited.add(url)
        try:
            r = requests.get(url, headers=HEADERS, timeout=10)
            if r.status_code != 200: continue
            new_urls = extract_urls_from_html(r.text)
            for u in new_urls:
                if u not in detail_urls:
                    detail_urls.add(u)
                    if u not in visited and len(visited) < 80:
                        to_visit.add(u)
        except Exception as e:
            pass

    return list(detail_urls)

def parse_listing(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200: return None
        soup = BeautifulSoup(r.text, "html.parser")
        text = soup.get_text(" ", strip=True)

        # Estrai parti dall'URL
        m = re.match(r".*/immobili/([a-z]+)-([a-z-]+?)-([a-z-]+)/([^/]+)$", url)
        if not m: return None
        action_url, town_slug, type_slug, ext_id = m.groups()

        type_ = "Vendita" if "vendita" in action_url else ("Locazione" if "affitto" in action_url else "Vendita")
        # Pre-fetch text per riclassificare affitti turistici
        type_map_url = type_
        town_map = {"loano": "Loano", "boissano": "Boissano", "borghetto-santo-spirito": "Borghetto Santo Spirito",
                    "toirano": "Toirano", "ceriale": "Ceriale", "pietra-ligure": "Pietra Ligure",
                    "finale-ligure": "Finale Ligure", "albenga": "Albenga"}
        town = town_map.get(town_slug, town_slug.replace("-", " ").title())

        ptype_map = {"appartamento": "Appartamento", "appartamento-indipendente": "Appartamento Indipendente",
                     "villa-bifamiliare": "Villa Bifamiliare", "villa": "Villa", "casa-indipendente": "Casa Indipendente"}
        ptype = ptype_map.get(type_slug, type_slug.replace("-", " ").title())

        # Prezzo
        price = "Tratt. in Agenzia"
        for el in soup.find_all(string=re.compile(r"€\s*[\d.,]+")):
            mp = re.search(r"€\s*([\d.,]+)", el)
            if mp:
                price = f"€ {mp.group(1)}"
                break

        # Superficie
        sqm = 0
        ms = re.search(r"Superficie[:\s]+(\d+)\s*mq", text, re.IGNORECASE) or re.search(r"(\d+)\s*mq", text)
        if ms:
            try: sqm = int(ms.group(1))
            except: sqm = 0

        # Vani / Locali
        rooms = 0
        mr = re.search(r"Numero Vani[:\s]+(\d+)", text, re.IGNORECASE) or re.search(r"Locali[:\s]+(\d+)", text, re.IGNORECASE)
        if mr:
            try: rooms = int(mr.group(1))
            except: rooms = 0

        # Classe energetica
        energy = "G"
        me = re.search(r"Classe Energetica[:\s]+([A-G][\d\+]?|In fase[\w\s]*)", text)
        if me:
            ev = me.group(1).strip()
            if ev[0] in "ABCDEFG": energy = ev[0]
            else: energy = "G"

        # Tag
        tag = None
        if "Occasione" in text[:500]: tag = "Occasione"
        elif "Vista mare" in text or "vista mare" in text: tag = "Vista mare"
        elif "Centro" in text[:1000]: tag = "Centro"

        # Galleria immagini
        images = []
        seen = set()
        for img in soup.find_all("img"):
            src = img.get("src") or img.get("data-src") or ""
            if "cdn.area159.com" in src and ext_id in src:
                # Versione 1200x800 da link parent se disponibile
                clean = src.replace("/206/", "/205/").replace("600/400", "1200/800")
                # Rimuovi duplicati per nome file
                fn = clean.split("/")[-1]
                if fn not in seen:
                    seen.add(fn)
                    images.append(clean)
        # Cerca anche negli href
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "cdn.area159.com" in href and ext_id in href and "1200/800" in href:
                fn = href.split("/")[-1]
                if fn not in seen:
                    seen.add(fn); images.append(href)

        # Descrizione: cerca <p> dentro l'area descrizione
        desc = ""
        # Trova h2/h3 "Descrizione" e raccogli i p successivi
        for h in soup.find_all(["h1","h2","h3","h4"]):
            if "Descrizione" in h.get_text():
                sib = h.find_next_sibling()
                parts = []
                while sib and sib.name in ("p","div","br"):
                    t = sib.get_text(" ", strip=True)
                    if t and len(t) > 20: parts.append(t)
                    sib = sib.find_next_sibling()
                if parts:
                    desc = "\n\n".join(parts)
                    break
        if not desc:
            # Fallback: meta description
            md = soup.find("meta", attrs={"name": "description"})
            if md: desc = md.get("content", "")
        if not desc:
            desc = f"{ptype} a {town}. Per informazioni dettagliate consulta la scheda originale."

        # Coordinate
        lat, lng = ZONE_COORDS.get(town, (44.13, 8.25))

        # Title
        title = f"{ptype} a {town}"
        if sqm > 0: title += f" — {sqm} mq"

        # Affitto breve auto-detect (CITRA/CIN/USO TURISTICO)
        if type_ == "Locazione":
            if re.search(r"USO TURISTIC|CITRA|\bCIN\b|casa vacanz|breve termine|weekend|per le vacanze", text, re.IGNORECASE):
                type_ = "Affitto breve"

        return {
            "ext_id": ext_id, "title": title, "town": town, "type": type_,
            "price": price, "sqm": sqm, "rooms": rooms, "baths": 1 if rooms > 0 else 0,
            "energy": energy, "tag": tag, "description": desc[:3000],
            "images": images[:15], "lat": lat, "lng": lng,
            "source_url": url,
        }
    except Exception as e:
        print(f"  ERR parsing {url}: {e}")
        return None

async def main():
    print("🔍 Discovery URLs...")
    urls = discover_urls()
    print(f"   Trovati {len(urls)} URL dettaglio")
    if not urls:
        print("Nessun URL trovato. Aborting.")
        return

    print("\n📥 Parsing immobili...")
    listings = []
    for i, u in enumerate(urls):
        print(f"  [{i+1}/{len(urls)}] {u}")
        d = parse_listing(u)
        if d: listings.append(d)

    print(f"\n✅ Parsati {len(listings)} immobili")

    # Salva nel DB
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    deleted = await db.listings.delete_many({})
    print(f"\n🗑️  Eliminati {deleted.deleted_count} immobili esistenti")

    for i, item in enumerate(listings):
        doc = {
            "id": str(uuid.uuid4()),
            "title": item["title"], "town": item["town"], "type": item["type"],
            "price": item["price"], "sqm": item["sqm"], "rooms": item["rooms"],
            "baths": item["baths"], "energy": item["energy"], "tag": item["tag"],
            "description": item["description"], "images": item["images"],
            "lat": item["lat"], "lng": item["lng"],
            "featured": i < 6, "published": True,
            "ext_id": item["ext_id"], "source_url": item["source_url"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.listings.insert_one(doc)

    total = await db.listings.count_documents({})
    print(f"💾 Inseriti {total} immobili nel database")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
