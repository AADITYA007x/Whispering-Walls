import json
import re
import time
import unicodedata
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parent.parent
PAINTINGS = ROOT / "src" / "data" / "paintings.json"
HOTSPOTS = ROOT / "src" / "data" / "hotspots.json"
CURATED = ROOT / "src" / "data" / "curated-hotspots.json"
BY_TITLE = ROOT / "src" / "data" / "curated-by-title.json"
OUTPUT = Path(__file__).resolve().parent / "data" / "knowledge.json"

API = "https://en.wikipedia.org/w/api.php"
HEADERS = {"User-Agent": "WhisperingWalls/1.0 (https://github.com/whispering-walls)"}
SKIP_SECTIONS = {"references", "external links", "see also", "notes", "further reading", "sources", "bibliography", "citations", "footnotes"}
CHUNK_CHARS = 900


def fetch_article(client, title):
    params = {
        "action": "query",
        "prop": "extracts",
        "explaintext": 1,
        "redirects": 1,
        "titles": title,
        "format": "json",
        "formatversion": 2,
    }
    reason = "unknown"
    for attempt in range(4):
        try:
            res = client.get(API, params=params, timeout=30)
            if res.status_code == 200:
                pages = res.json().get("query", {}).get("pages", [])
                text = pages[0].get("extract", "") if pages else ""
                return text, None if text else "article empty"
            reason = f"HTTP {res.status_code}"
            if res.status_code in (400, 403, 404):
                break
            if res.status_code == 429:
                time.sleep(10)
        except httpx.HTTPError as error:
            reason = f"network problem ({error.__class__.__name__})"
        time.sleep(2 * (attempt + 1))
    return "", reason


def normalize(text):
    text = unicodedata.normalize("NFD", text or "")
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"\(.*?\)", "", text).lower()
    text = re.sub(r"[^a-z0-9 ]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def title_keys(painting):
    words = normalize(painting.get("artist", "")).split(" ")
    title = normalize(painting.get("title", ""))
    return [f"{title}|{' '.join(words[-2:])}", f"{title}|{words[-1]}"]


def chunk_article(text):
    chunks = []
    section = "Introduction"
    buffer = ""

    def flush():
        nonlocal buffer
        if buffer.strip():
            chunks.append({"section": section, "text": buffer.strip()})
        buffer = ""

    for block in re.split(r"\n{1,}", text):
        heading = re.match(r"^=+\s*(.+?)\s*=+$", block.strip())
        if heading:
            flush()
            section = heading.group(1)
            continue
        if section.lower() in SKIP_SECTIONS or not block.strip():
            continue
        if len(buffer) + len(block) > CHUNK_CHARS:
            flush()
        buffer += " " + block.strip()
    flush()
    return chunks


def main():
    paintings = json.loads(PAINTINGS.read_text(encoding="utf-8"))["paintings"]
    curated = json.loads(CURATED.read_text(encoding="utf-8")) if CURATED.exists() else {}
    yours = json.loads(HOTSPOTS.read_text(encoding="utf-8")) if HOTSPOTS.exists() else {}
    by_title = json.loads(BY_TITLE.read_text(encoding="utf-8")) if BY_TITLE.exists() else {}
    hotspots = {**curated, **yours}
    knowledge = {}
    failures = {}

    with httpx.Client(headers=HEADERS) as client:
        for i, (pid, p) in enumerate(paintings.items(), start=1):
            article = p["article"]
            text, problem = fetch_article(client, article.replace("_", " "))
            if problem:
                failures[problem] = failures.get(problem, 0) + 1
                print(f"\n  could not get '{p['title']}': {problem}")
            chunks = chunk_article(text) if text else []
            if not chunks and p.get("story"):
                chunks = [{"section": "Introduction", "text": p["story"]}]
            spots = hotspots.get(pid) or next((by_title[k] for k in title_keys(p) if k in by_title), [])
            for spot in spots:
                chunks.append({"section": f"Detail: {spot['title']}", "text": spot["story"]})
            knowledge[pid] = {
                "title": p["title"],
                "artist": p["artist"],
                "year": p.get("year"),
                "collection": p.get("collection"),
                "wikipedia": p["wikipedia"],
                "chunks": chunks,
            }
            print(f"\r  {i} / {len(paintings)}  {p['title'][:40]:<40}", end="", flush=True)
            time.sleep(0.5)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(knowledge, ensure_ascii=False), encoding="utf-8")
    total = sum(len(k["chunks"]) for k in knowledge.values())
    print(f"\n\nSaved {total} passages for {len(knowledge)} paintings to backend/data/knowledge.json")
    missed = sum(failures.values())
    if missed:
        print(f"\n{missed} articles could not be downloaded, so those paintings use their short summary instead:")
        for reason, count in failures.items():
            print(f"  - {count} x {reason}")
    else:
        print("Every full article downloaded.")


if __name__ == "__main__":
    main()
