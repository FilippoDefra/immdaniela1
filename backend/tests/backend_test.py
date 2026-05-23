"""Backend regression tests for Immobiliare Daniela."""
import os
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://emergent-export-test.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@immobiliaredaniela.it"
ADMIN_PASS = "Daniela2026!"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def auth(s):
    r = s.post(f"{BASE}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and data["email"] == ADMIN_EMAIL
    return data


# ---- Public listings ----
def test_listings_seeded(s):
    r = s.get(f"{BASE}/api/listings", timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 6, f"expected >=6 seeded, got {len(data)}"


def test_listings_filters(s):
    r = s.get(f"{BASE}/api/listings", params={"type": "Vendita", "zone": "Loano", "pmax": "300000", "rooms": "2"}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    for it in data:
        assert it["type"] == "Vendita"
        assert it["town"] == "Loano"
        assert it["rooms"] == 2


def test_listing_detail_404(s):
    r = s.get(f"{BASE}/api/listings/nonexistent-id", timeout=20)
    assert r.status_code == 404


def test_listing_detail_ok(s):
    items = s.get(f"{BASE}/api/listings", timeout=20).json()
    lid = items[0]["id"]
    r = s.get(f"{BASE}/api/listings/{lid}", timeout=20)
    assert r.status_code == 200
    assert r.json()["id"] == lid


def test_buyer_requests_seeded(s):
    r = s.get(f"{BASE}/api/buyer-requests", timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 4


def test_stats(s):
    r = s.get(f"{BASE}/api/stats", timeout=20)
    assert r.status_code == 200
    d = r.json()
    assert "listings" in d and "buyer_requests" in d


# ---- Contact submissions (public POST) ----
def test_contact_submit(s):
    for kind in ["contact", "valuation", "report", "listing-inquiry"]:
        r = s.post(f"{BASE}/api/contact", json={"kind": kind, "name": f"TEST_{kind}", "email": "test@example.com", "message": "Test", "extra": {"x": 1}}, timeout=20)
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True


# ---- Auth ----
def test_login_invalid(s):
    r = s.post(f"{BASE}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=20)
    assert r.status_code == 401


def test_me_no_auth():
    r = requests.get(f"{BASE}/api/auth/me", timeout=20)
    assert r.status_code == 401


def test_me_with_cookie(s, auth):
    r = s.get(f"{BASE}/api/auth/me", timeout=20)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_contact_list_requires_auth():
    r = requests.get(f"{BASE}/api/contact", timeout=20)
    assert r.status_code == 401


def test_contact_list_with_auth(s, auth):
    r = s.get(f"{BASE}/api/contact", timeout=20)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---- Listings CRUD (auth) ----
def test_listings_crud(s, auth):
    payload = {
        "title": "TEST_listing",
        "town": "Loano",
        "type": "Vendita",
        "price": "€ 250.000",
        "sqm": 80,
        "rooms": 3,
        "baths": 1,
        "energy": "B",
        "description": "Test description",
        "lat": 44.13,
        "lng": 8.26,
    }
    # create requires auth
    r_no = requests.post(f"{BASE}/api/listings", json=payload, timeout=20)
    assert r_no.status_code == 401

    r = s.post(f"{BASE}/api/listings", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    lid = r.json()["id"]

    g = s.get(f"{BASE}/api/listings/{lid}", timeout=20)
    assert g.status_code == 200 and g.json()["title"] == "TEST_listing"

    payload["title"] = "TEST_listing_updated"
    u = s.put(f"{BASE}/api/listings/{lid}", json=payload, timeout=20)
    assert u.status_code == 200
    assert u.json()["title"] == "TEST_listing_updated"

    d = s.delete(f"{BASE}/api/listings/{lid}", timeout=20)
    assert d.status_code == 200
    assert s.get(f"{BASE}/api/listings/{lid}", timeout=20).status_code == 404


# ---- Buyer requests CRUD (auth) ----
def test_buyer_requests_crud(s, auth):
    payload = {"zone": "TEST_zone", "property_type": "Appartamento", "description": "Test", "budget": "300.000 €", "label": "Urgente", "active": True}
    r_no = requests.post(f"{BASE}/api/buyer-requests", json=payload, timeout=20)
    assert r_no.status_code == 401

    r = s.post(f"{BASE}/api/buyer-requests", json=payload, timeout=20)
    assert r.status_code == 200
    rid = r.json()["id"]

    payload["description"] = "Updated"
    u = s.put(f"{BASE}/api/buyer-requests/{rid}", json=payload, timeout=20)
    assert u.status_code == 200 and u.json()["description"] == "Updated"

    d = s.delete(f"{BASE}/api/buyer-requests/{rid}", timeout=20)
    assert d.status_code == 200
