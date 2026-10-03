import json
import re
from functools import lru_cache
from pathlib import Path

from rank_bm25 import BM25Okapi

DATA = Path(__file__).resolve().parent / "data" / "knowledge.json"
STOPWORDS = set("a an the is are was were be been of in on at to for with and or but you your i me my it its this that what why how who when where did do does about tell".split())


def tokenize(text):
    return [w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in STOPWORDS]


@lru_cache(maxsize=1)
def load():
    if not DATA.exists():
        return {}
    return json.loads(DATA.read_text(encoding="utf-8"))


@lru_cache(maxsize=512)
def index_for(painting_id):
    entry = load().get(painting_id)
    if not entry or not entry["chunks"]:
        return None
    return BM25Okapi([tokenize(c["section"] + " " + c["text"]) for c in entry["chunks"]])


def painting(painting_id):
    return load().get(painting_id)


def retrieve(painting_id, question, k=4):
    entry = load().get(painting_id)
    if not entry:
        return []
    chunks = entry["chunks"]
    index = index_for(painting_id)
    if not index:
        return []
    scores = index.get_scores(tokenize(question))
    ranked = sorted(range(len(chunks)), key=lambda i: scores[i], reverse=True)
    picked = [0] + [i for i in ranked if i != 0][: k - 1]
    return [chunks[i] for i in picked]
