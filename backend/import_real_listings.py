"""
Importa gli immobili reali da fdimmobiliareloano.it
Esegui: python /app/backend/import_real_listings.py
"""
import asyncio
import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')
from motor.motor_asyncio import AsyncIOMotorClient

REAL_LISTINGS = [
    {
        "ext_id": "290", "town": "Boissano", "type": "Vendita", "title": "Appartamento a Boissano — Occasione",
        "price": "€ 145.000", "tag": "Occasione",
        "image": "https://cdn.area159.com/v2/672/120498/600/400/crop/206/290-appartamento-boissano-5fa18.jpg",
        "source_url": "https://www.fdimmobiliareloano.it/immobili/vendita-boissano-appartamento/290",
        "lat": 44.1486, "lng": 8.2228,
    },
    {
        "ext_id": "311", "town": "Toirano", "type": "Vendita", "title": "Appartamento Indipendente a Toirano — Occasione",
        "price": "€ 98.000", "tag": "Occasione",
        "image": "https://cdn.area159.com/v2/672/120868/600/400/crop/206/311-appartamento-indipendente-toirano-d95f9.jpg",
        "source_url": "https://www.fdimmobiliareloano.it/immobili/vendita-toirano-appartamento-indipendente/311",
        "lat": 44.1283, "lng": 8.2069,
    },
    {
        "ext_id": "103", "town": "Loano", "type": "Vendita", "title": "Appartamento a Loano — Occasione",
        "price": "€ 185.000", "tag": "Occasione",
        "image": "https://cdn.area159.com/v2/672/121676/600/400/crop/206/103-appartamento-loano-088ed.jpg",
        "source_url": "https://www.fdimmobiliareloano.it/immobili/vendita-loano-appartamento/103",
        "lat": 44.1294, "lng": 8.2580,
    },
    {
        "ext_id": "202", "town": "Borghetto Santo Spirito", "type": "Vendita", "title": "Appartamento a Borghetto S.S. — Occasione",
        "price": "€ 135.000", "tag": "Occasione",
        "image": "https://cdn.area159.com/v2/672/120521/600/400/crop/206/202-appartamento-borghetto-santo-spirito-bc7e0.jpg",
        "source_url": "https://www.fdimmobiliareloano.it/immobili/vendita-borghetto-santo-spirito-appartamento/202",
        "lat": 44.1130, "lng": 8.2389,
    },
    {
        "ext_id": "CE-03", "town": "Ceriale", "type": "Vendita", "title": "Appartamento a Ceriale",
        "price": "€ 143.000", "tag": None,
        "image": "https://cdn.area159.com/v2/672/127167/600/400/crop/206/ce-03-appartamento-ceriale-fbe98.jpg",
        "source_url": "https://www.fdimmobiliareloano.it/immobili/vendita-ceriale-appartamento/CE-03",
        "lat": 44.0921, "lng": 8.2287,
    },
    {
        "ext_id": "178", "town": "Loano", "type": "Vendita", "title": "Appartamento a Loano",
        "price": "€ 345.000", "tag": None,
        "image": "https://cdn.area159.com/v2/672/127024/600/400/crop/206/178-appartamento-loano-10098.jpg",
        "source_url": "https://www.fdimmobiliareloano.it/immobili/vendita-loano-appartamento/178",
        "lat": 44.1294, "lng": 8.2580,
    },
    {
        "ext_id": "33", "town": "Loano", "type": "Locazione", "title": "Appartamento in affitto a Loano",
        "price": "Tratt. in Agenzia", "tag": "Affitto",
        "image": "https://cdn.area159.com/v2/672/125848/600/400/crop/206/33-appartamento-loano-6db70.jpg",
        "source_url": "https://www.fdimmobiliareloano.it/immobili/affitto-loano-appartamento/33",
        "lat": 44.1294, "lng": 8.2580,
    },
    {
        "ext_id": "203", "town": "Borghetto Santo Spirito", "type": "Vendita", "title": "Appartamento a Borghetto S.S.",
        "price": "€ 279.000", "tag": None,
        "image": "https://cdn.area159.com/v2/672/128279/600/400/crop/206/203-appartamento-borghetto-santo-spirito-b80f8.jpg",
        "source_url": "https://www.fdimmobiliareloano.it/immobili/vendita-borghetto-santo-spirito-appartamento/203",
        "lat": 44.1130, "lng": 8.2389,
    },
    {
        "ext_id": "201", "town": "Borghetto Santo Spirito", "type": "Vendita", "title": "Appartamento a Borghetto S.S.",
        "price": "€ 185.000", "tag": None,
        "image": "https://cdn.area159.com/v2/672/128256/600/400/crop/206/201-appartamento-borghetto-santo-spirito-d7756.jpg",
        "source_url": "https://www.fdimmobiliareloano.it/immobili/vendita-borghetto-santo-spirito-appartamento/201",
        "lat": 44.1130, "lng": 8.2389,
    },
    {
        "ext_id": "245", "town": "Borghetto Santo Spirito", "type": "Vendita", "title": "Appartamento a Borghetto S.S.",
        "price": "€ 189.000", "tag": None,
        "image": "https://cdn.area159.com/v2/672/128117/600/400/crop/206/245-appartamento-borghetto-santo-spirito-03b2f.jpg",
        "source_url": "https://www.fdimmobiliareloano.it/immobili/vendita-borghetto-santo-spirito-appartamento/245",
        "lat": 44.1130, "lng": 8.2389,
    },
]

async def main():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]

    # Svuota tutti gli immobili esistenti (seed demo)
    deleted = await db.listings.delete_many({})
    print(f"Eliminati {deleted.deleted_count} immobili esistenti")

    # Inserisci immobili reali
    for i, item in enumerate(REAL_LISTINGS):
        doc = {
            "id": str(uuid.uuid4()),
            "title": item["title"],
            "town": item["town"],
            "type": item["type"],
            "price": item["price"],
            "sqm": 0,  # Da completare dal pannello admin
            "rooms": 0,
            "baths": 0,
            "energy": "G",
            "tag": item["tag"],
            "description": f"Immobile a {item['town']}. Per maggiori dettagli (superficie, locali, descrizione completa) contatta l'agenzia o vedi la scheda originale: {item['source_url']}",
            "images": [item["image"]],
            "lat": item["lat"],
            "lng": item["lng"],
            "featured": i < 3,  # Primi 3 in evidenza
            "published": True,
            "ext_id": item["ext_id"],
            "source_url": item["source_url"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.listings.insert_one(doc)
        print(f"  ✓ Inserito: {item['title']} - {item['price']}")

    total = await db.listings.count_documents({})
    print(f"\nTotale immobili nel database: {total}")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
