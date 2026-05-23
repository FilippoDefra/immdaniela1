"""
Riclassifica gli affitti già presenti nel DB:
- Affitti con CITRA/CIN/USO TURISTICO → "Affitto breve"
- Altri affitti → "Locazione"
"""
import asyncio, os, re
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / '.env')
from motor.motor_asyncio import AsyncIOMotorClient

TURISTIC_PATTERNS = [
    r"USO TURISTIC", r"\bCITRA\b", r"\bCIN\b", r"Codice CIN", r"Codice CITRA",
    r"casa vacanz", r"affitto turistic", r"locazione turistic", r"breve termine",
    r"weekend", r"settimanale", r"per le vacanze",
]
TURISTIC_RE = re.compile("|".join(TURISTIC_PATTERNS), re.IGNORECASE)

async def main():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]

    affitti = await db.listings.find({"type": {"$in": ["Locazione", "Affitto breve"]}}).to_list(200)
    print(f"Trovati {len(affitti)} affitti da riclassificare\n")

    n_breve, n_loc = 0, 0
    for l in affitti:
        desc = l.get("description", "") or ""
        title = l.get("title", "") or ""
        text = f"{title} {desc}"
        is_turistic = bool(TURISTIC_RE.search(text))
        new_type = "Affitto breve" if is_turistic else "Locazione"
        if new_type != l.get("type"):
            await db.listings.update_one({"id": l["id"]}, {"$set": {"type": new_type}})
            print(f"  ✓ {l['title'][:60]}  →  {new_type}")
        if new_type == "Affitto breve": n_breve += 1
        else: n_loc += 1

    print(f"\n📊 Risultato finale:")
    print(f"   Affitto breve (turistico): {n_breve}")
    print(f"   Locazione (annuale): {n_loc}")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
