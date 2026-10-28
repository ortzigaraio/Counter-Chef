#!/usr/bin/env python3
"""
Busca y descarga las fotos del catálogo desde Wikimedia Commons.

- Lee catalog/*.md (línea `foto:` de cada receta):
    es:Título / en:Título / it:Título  -> imagen principal del artículo de Wikipedia
    c:términos de búsqueda             -> primera foto de Commons que coincida
- Solo acepta licencias libres (CC0, dominio público, CC BY, CC BY-SA).
- Guarda public/catalog/img/<slug>.webp (720 px, recorte 16:10) y los créditos en catalog/photos.json.
- Es incremental: lo ya descargado no se vuelve a pedir.

Uso:  python3 scripts/catalog_photos.py
"""
import io
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "catalog"
OUT = ROOT / "public" / "catalog" / "img"
CREDITS = SRC / "photos.json"
RESOLVED = SRC / ".photo-resolve.json"  # caché local de búsquedas (no se sube)
UA = "CounterChefBot/0.1 (https://github.com/ortzigaraio/Counter-Chef) catalog-photo-fetch"
OK_LICENSE = re.compile(r"^(cc0|public domain|pd|cc by(-sa)?( \d\.\d)?|cc-by(-sa)?)", re.I)


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60]


def get_json(url: str, params: dict) -> dict:
    q = url + "?" + urllib.parse.urlencode({**params, "format": "json", "formatversion": 2})
    for attempt in range(60):
        try:
            req = urllib.request.Request(q, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                time.sleep(1.0)
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = int(e.headers.get("Retry-After") or 10 * (attempt + 1))
                print(f"  429, espero {wait} s", flush=True)
                time.sleep(wait)
                continue
            raise
    raise RuntimeError("demasiados 429 en " + q)


def read_recipes():
    out = []
    for f in sorted(SRC.glob("*.md")):
        title = None
        for line in f.read_text(encoding="utf-8").splitlines():
            if line.startswith("# "):
                title = line[2:].strip()
            elif line.startswith("cat:") and title:
                m = re.search(r"foto:\s*([^|]+)", line)
                if m:
                    out.append((slugify(title), title, m.group(1).strip()))
    return out


def strip_html(s: str) -> str:
    s = re.sub(r"<[^>]+>", "", s or "")
    return re.sub(r"\s+", " ", s).strip()[:120]


def resolve_wiki(lang: str, titles: list[str]) -> dict:
    """Título de artículo -> nombre de archivo de su imagen principal (libre)."""
    found = {}
    for i in range(0, len(titles), 40):
        chunk = titles[i : i + 40]
        data = get_json(
            f"https://{lang}.wikipedia.org/w/api.php",
            {"action": "query", "prop": "pageimages", "piprop": "name", "pilicense": "free", "redirects": 1, "titles": "|".join(chunk)},
        )
        q = data.get("query", {})
        back = {}
        for n in q.get("normalized", []):
            back[n["to"]] = n["from"]
        for r in q.get("redirects", []):
            back[r["to"]] = back.get(r["from"], r["from"])
        for p in q.get("pages", []):
            if p.get("pageimage"):
                original = back.get(p["title"], p["title"])
                found[original] = "File:" + p["pageimage"].replace("_", " ")
    return found


def search_commons(terms: str) -> str | None:
    data = get_json(
        "https://commons.wikimedia.org/w/api.php",
        {"action": "query", "list": "search", "srnamespace": 6, "srlimit": 8, "srsearch": f"{terms} filetype:bitmap"},
    )
    for hit in data.get("query", {}).get("search", []):
        t = hit["title"]
        if re.search(r"\.(jpe?g|png|webp)$", t, re.I) and not re.search(r"logo|map|icon|diagram|svg", t, re.I):
            return t
    return None


def file_info(files: list[str]) -> dict:
    info = {}
    for i in range(0, len(files), 40):
        chunk = files[i : i + 40]
        data = get_json(
            "https://commons.wikimedia.org/w/api.php",
            {"action": "query", "prop": "imageinfo", "iiprop": "url|extmetadata|mime", "iiurlwidth": 960, "titles": "|".join(chunk)},
        )
        for p in data.get("query", {}).get("pages", []):
            ii = (p.get("imageinfo") or [None])[0]
            if not ii:
                continue
            meta = ii.get("extmetadata", {})
            lic = meta.get("LicenseShortName", {}).get("value", "")
            info[p["title"].replace("_", " ")] = {
                "thumb": ii.get("thumburl") or ii.get("url"),
                "page": ii.get("descriptionurl"),
                "license": lic,
                "licenseUrl": meta.get("LicenseUrl", {}).get("value", ""),
                "author": strip_html(meta.get("Artist", {}).get("value", "")) or "Autor desconocido",
            }
    return info


def save_image(url: str, dest: Path):
    raw = None
    for attempt in range(30):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                raw = r.read()
            break
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(int(e.headers.get("Retry-After") or 2) + attempt)
    if raw is None:
        raise RuntimeError("429 persistente")
    time.sleep(1.0)
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    # Recorte centrado a 16:10 y 720 px de ancho
    w, h = im.size
    target = 16 / 10
    if w / h > target:
        nw = int(h * target)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / target)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize((720, 450), Image.LANCZOS)
    im.save(dest, "WEBP", quality=72, method=6)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    credits = json.loads(CREDITS.read_text()) if CREDITS.exists() else {}
    recipes = read_recipes()
    pending = [r for r in recipes if not (r[0] in credits and (OUT / f"{r[0]}.webp").exists())]
    print(f"{len(recipes)} recetas, {len(pending)} sin foto")

    # 1. Resolver nombres de archivo (con caché para poder reanudar)
    by_lang: dict[str, list[tuple[str, str]]] = {}
    cache = json.loads(RESOLVED.read_text()) if RESOLVED.exists() else {}
    pending_slugs = {p[0] for p in pending}
    files: dict[str, str] = {k: v.replace("_", " ") for k, v in cache.items() if v and k in pending_slugs}
    for slug, _title, spec in pending:
        if slug in cache:
            continue
        kind, _, value = spec.partition(":")
        if kind == "c":
            continue
        by_lang.setdefault(kind, []).append((slug, value.strip()))
    for lang, items in by_lang.items():
        found = resolve_wiki(lang, [t for _, t in items])
        for slug, t in items:
            if t in found:
                files[slug] = found[t]
                cache[slug] = found[t]
        RESOLVED.write_text(json.dumps(cache, ensure_ascii=False, indent=1))
    for slug, title, spec in pending:
        if slug in files or cache.get(slug) == "":
            continue
        kind, _, value = spec.partition(":")
        query = value if kind == "c" else title
        hit = search_commons(query)
        cache[slug] = hit or ""
        RESOLVED.write_text(json.dumps(cache, ensure_ascii=False, indent=1))
        if hit:
            files[slug] = hit
        else:
            print("  sin resultado:", title, "←", spec, flush=True)

    # 2. Licencias y URLs
    info = file_info(sorted(set(files.values())))

    # 3. Descargar
    for slug, fname in files.items():
        meta = info.get(fname.replace("_", " "))
        if not meta or not meta["thumb"]:
            print("  sin info:", slug, fname)
            continue
        if not OK_LICENSE.match(meta["license"].strip()):
            print("  licencia no libre:", slug, meta["license"])
            continue
        try:
            save_image(meta["thumb"], OUT / f"{slug}.webp")
        except Exception as e:  # noqa: BLE001
            print("  error descargando", slug, e)
            continue
        credits[slug] = {"file": fname, "author": meta["author"], "license": meta["license"], "licenseUrl": meta["licenseUrl"], "source": meta["page"]}
        CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=1, sort_keys=True))
        print("  ok", slug, flush=True)

    missing = [r[1] for r in recipes if r[0] not in credits]
    print(f"Con foto: {len(recipes) - len(missing)}/{len(recipes)}")
    if missing:
        print("Sin foto:", "; ".join(missing))


if __name__ == "__main__":
    sys.exit(main())
