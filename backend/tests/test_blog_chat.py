"""Backend tests for /api/blog and /api/chat endpoints."""
import os
import time
import uuid
import pytest
import requests

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_EMAIL = "admin@daniela-immobiliare.it"
ADMIN_PASS = "ChangeMe!2026"

EXPECTED_SEED_SLUGS = {
    "valutare-immobile-loano-2026",
    "comprare-casa-mare-liguria-guida-2026",
    "affitto-breve-vs-locazione-lunga-loano",
    "imposte-acquisto-prima-casa-2026",
    "dove-investire-borghetto-pietra-albenga",
    "ristrutturare-casa-riviera-2026",
}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def auth(s):
    r = s.post(f"{BASE}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=20)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data
    return data


@pytest.fixture(scope="module")
def headers(auth):
    return {"Authorization": f"Bearer {auth['token']}"}


# ============ BLOG TESTS ============

def test_blog_list_returns_6_seeded(s):
    r = s.get(f"{BASE}/api/blog", timeout=20)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) == 6, f"expected 6 seeded posts, got {len(items)}"
    slugs = {p["slug"] for p in items}
    assert slugs == EXPECTED_SEED_SLUGS, f"unexpected slugs: {slugs}"


def test_blog_list_excludes_body_field(s):
    r = s.get(f"{BASE}/api/blog", timeout=20)
    assert r.status_code == 200
    for p in r.json():
        assert "body" not in p, f"body should be excluded from list endpoint, got post {p.get('slug')}"
        # other required fields
        for f in ("slug", "title", "excerpt", "cover", "category", "read_minutes", "tags"):
            assert f in p, f"missing field {f} in post {p.get('slug')}"


def test_blog_get_existing_slug_includes_body(s):
    # use a known seed slug
    slug = "valutare-immobile-loano-2026"
    r = s.get(f"{BASE}/api/blog/{slug}", timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert data["slug"] == slug
    assert "body" in data and isinstance(data["body"], str) and len(data["body"]) > 100
    assert data["title"]


def test_blog_get_nonexistent_slug_returns_404(s):
    r = s.get(f"{BASE}/api/blog/does-not-exist-xyz-{uuid.uuid4().hex[:6]}", timeout=20)
    assert r.status_code == 404


def test_blog_create_without_auth_returns_401(s):
    payload = {
        "slug": f"TEST-noauth-{uuid.uuid4().hex[:6]}",
        "title": "Test no auth",
        "category": "Test",
        "excerpt": "x",
        "cover": "",
        "body": "body",
    }
    # use a fresh session with no cookies
    fresh = requests.Session()
    r = fresh.post(f"{BASE}/api/blog", json=payload, timeout=20)
    assert r.status_code == 401, f"expected 401, got {r.status_code} {r.text}"


def test_blog_create_with_admin_auth(s, headers):
    slug = f"test-create-{uuid.uuid4().hex[:8]}"
    payload = {
        "slug": slug,
        "title": "TEST Articolo creato dal test",
        "category": "Test",
        "excerpt": "Excerpt di test",
        "cover": "/assets/x.jpg",
        "body": "# Heading\n\nCorpo articolo in markdown.",
    }
    r = s.post(f"{BASE}/api/blog", json=payload, headers=headers, timeout=20)
    assert r.status_code == 200, f"{r.status_code} {r.text}"
    data = r.json()
    assert data["slug"] == slug
    assert data["title"] == payload["title"]
    assert "id" in data
    post_id = data["id"]

    # verify persistence via GET by slug
    r2 = s.get(f"{BASE}/api/blog/{slug}", timeout=20)
    assert r2.status_code == 200
    assert r2.json()["title"] == payload["title"]

    # save for next tests
    pytest._blog_created_id = post_id
    pytest._blog_created_slug = slug


def test_blog_create_duplicate_slug_returns_400(s, headers):
    slug = getattr(pytest, "_blog_created_slug", None)
    assert slug, "previous test must create a post"
    payload = {
        "slug": slug,
        "title": "Duplicate",
        "category": "Test",
        "excerpt": "x",
        "cover": "",
        "body": "x",
    }
    r = s.post(f"{BASE}/api/blog", json=payload, headers=headers, timeout=20)
    assert r.status_code == 400, f"expected 400, got {r.status_code} {r.text}"


def test_blog_update_with_auth(s, headers):
    post_id = getattr(pytest, "_blog_created_id", None)
    assert post_id, "previous create test required"
    slug = pytest._blog_created_slug
    payload = {
        "slug": slug,
        "title": "TEST Articolo aggiornato",
        "category": "Test",
        "excerpt": "Excerpt aggiornato",
        "cover": "/assets/x.jpg",
        "body": "Nuovo body",
    }
    r = s.put(f"{BASE}/api/blog/{post_id}", json=payload, headers=headers, timeout=20)
    assert r.status_code == 200, r.text
    assert r.json()["title"] == "TEST Articolo aggiornato"

    # verify GET reflects update
    r2 = s.get(f"{BASE}/api/blog/{slug}", timeout=20)
    assert r2.status_code == 200
    assert r2.json()["title"] == "TEST Articolo aggiornato"


def test_blog_delete_with_auth(s, headers):
    post_id = getattr(pytest, "_blog_created_id", None)
    assert post_id, "previous create test required"
    slug = pytest._blog_created_slug
    r = s.delete(f"{BASE}/api/blog/{post_id}", headers=headers, timeout=20)
    assert r.status_code == 200
    assert r.json().get("ok") is True

    # verify removed
    r2 = s.get(f"{BASE}/api/blog/{slug}", timeout=20)
    assert r2.status_code == 404


# ============ CHAT TESTS ============

def test_chat_message_creates_session(s):
    payload = {"message": "Ciao, vendo casa a Loano, mi potete aiutare?"}
    r = s.post(f"{BASE}/api/chat/message", json=payload, timeout=60)
    assert r.status_code == 200, f"{r.status_code} {r.text}"
    data = r.json()
    assert "session_id" in data and isinstance(data["session_id"], str) and len(data["session_id"]) > 8
    assert "reply" in data and isinstance(data["reply"], str) and len(data["reply"]) > 5
    assert "created_at" in data
    pytest._chat_session_id = data["session_id"]
    pytest._chat_first_reply = data["reply"]


def test_chat_message_multi_turn(s):
    sid = getattr(pytest, "_chat_session_id", None)
    assert sid, "previous chat test required"
    # follow-up — checks the AI remembers context
    payload = {"session_id": sid, "message": "Ho un trilocale di 90mq in via Boragine. Come procediamo?"}
    r = s.post(f"{BASE}/api/chat/message", json=payload, timeout=60)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["session_id"] == sid
    assert isinstance(data["reply"], str) and len(data["reply"]) > 5


def test_chat_sessions_list_requires_auth():
    fresh = requests.Session()
    r = fresh.get(f"{BASE}/api/chat/sessions", timeout=20)
    assert r.status_code == 401


def test_chat_sessions_list_with_auth(s, headers):
    r = s.get(f"{BASE}/api/chat/sessions", headers=headers, timeout=20)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    sid = pytest._chat_session_id
    found = next((it for it in items if it["session_id"] == sid), None)
    assert found is not None, f"session {sid} not found in list"
    assert "message_count" in found
    assert found["message_count"] >= 4  # 2 user + 2 assistant
    assert "last_message" in found
    assert "last_role" in found
    assert found["last_role"] in ("user", "assistant")


def test_chat_session_detail_with_auth(s, headers):
    sid = pytest._chat_session_id
    r = s.get(f"{BASE}/api/chat/sessions/{sid}", headers=headers, timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert data["session_id"] == sid
    assert isinstance(data.get("messages"), list)
    assert len(data["messages"]) >= 4
    roles = [m["role"] for m in data["messages"]]
    assert "user" in roles and "assistant" in roles


def test_chat_session_delete_with_auth(s, headers):
    sid = pytest._chat_session_id
    r = s.delete(f"{BASE}/api/chat/sessions/{sid}", headers=headers, timeout=20)
    assert r.status_code == 200
    # verify gone
    r2 = s.get(f"{BASE}/api/chat/sessions/{sid}", headers=headers, timeout=20)
    assert r2.status_code == 404


# ============ AUTH SANITY ============

def test_auth_login_returns_token():
    r = requests.post(f"{BASE}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert data.get("token")
    assert data.get("email") == ADMIN_EMAIL
