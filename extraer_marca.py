#!/usr/bin/env python3
"""
extraer_marca.py

Crea una carpeta con los assets de marca de una web existente:
- Colores (paleta detectada en CSS inline y hojas de estilo externas)
- Tipografías (font-family declaradas + archivos de fuente descargados)
- Logos e imágenes (todas las <img>, favicons, og:image, etc.)
- Un resumen en JSON y en README.md con todo lo detectado

USO:
    python3 extraer_marca.py https://ejemplo.com
    python3 extraer_marca.py https://ejemplo.com --out mi_carpeta

DEPENDENCIAS:
    pip install requests beautifulsoup4 pillow --break-system-packages
"""

import argparse
import json
import os
import re
import sys
from collections import Counter
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

try:
    from PIL import Image
except ImportError:
    Image = None

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,*/*;q=0.8"
    ),
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)

# --- Regex para detectar colores en CSS ---
HEX_RE = re.compile(r"#(?:[0-9a-fA-F]{3}){1,2}\b")
RGB_RE = re.compile(r"rgba?\([^)]+\)")
HSL_RE = re.compile(r"hsla?\([^)]+\)")
FONT_FAMILY_RE = re.compile(r"font-family\s*:\s*([^;}\n]+)", re.IGNORECASE)
FONT_FACE_URL_RE = re.compile(r"url\((['\"]?)([^'\")]+)\1\)")


def slugify(url: str) -> str:
    netloc = urlparse(url).netloc.replace("www.", "")
    return re.sub(r"[^a-zA-Z0-9]+", "_", netloc).strip("_")


def fetch(url: str, timeout=15, referer: str = None):
    try:
        extra = {"Referer": referer} if referer else {}
        r = SESSION.get(url, timeout=timeout, headers=extra)
        r.raise_for_status()
        return r
    except Exception as e:
        print(f"  [aviso] no se pudo descargar {url}: {e}")
        return None


def collect_css_texts(base_url: str, soup: BeautifulSoup):
    """Devuelve una lista de (fuente, texto_css) combinando <style> inline y hojas externas."""
    css_blobs = []

    for style_tag in soup.find_all("style"):
        if style_tag.string:
            css_blobs.append((base_url + " (inline <style>)", style_tag.string))

    for tag in soup.find_all(attrs={"style": True}):
        css_blobs.append((base_url + " (atributo style)", tag["style"]))

    for link in soup.find_all("link", rel=lambda v: v and "stylesheet" in v):
        href = link.get("href")
        if not href:
            continue
        css_url = urljoin(base_url, href)
        resp = fetch(css_url, referer=base_url)
        if resp is not None:
            css_blobs.append((css_url, resp.text))

    return css_blobs


def extract_colors(css_blobs):
    counter = Counter()
    for _, text in css_blobs:
        for m in HEX_RE.findall(text):
            counter[m.lower()] += 1
        for m in RGB_RE.findall(text):
            counter[re.sub(r"\s+", "", m.lower())] += 1
        for m in HSL_RE.findall(text):
            counter[re.sub(r"\s+", "", m.lower())] += 1
    return counter


def extract_fonts(css_blobs):
    families = Counter()
    font_face_urls = set()
    for source, text in css_blobs:
        for m in FONT_FAMILY_RE.findall(text):
            names = [n.strip().strip("'\"") for n in m.split(",")]
            for n in names:
                if n and n.lower() not in (
                    "inherit", "initial", "unset", "sans-serif", "serif", "monospace"
                ):
                    families[n] += 1
        for face_block in re.findall(r"@font-face\s*{([^}]*)}", text, re.IGNORECASE | re.DOTALL):
            for _, url in FONT_FACE_URL_RE.findall(face_block):
                if not url.startswith("data:"):
                    font_face_urls.add(urljoin(source, url))
    return families, font_face_urls


def extract_google_fonts(soup: BeautifulSoup):
    links = []
    for link in soup.find_all("link", href=True):
        if "fonts.googleapis.com" in link["href"] or "fonts.gstatic.com" in link["href"]:
            links.append(link["href"])
    return links


def extract_images(base_url: str, soup: BeautifulSoup):
    images = set()

    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src")
        if src:
            images.add(urljoin(base_url, src))
        srcset = img.get("srcset")
        if srcset:
            for part in srcset.split(","):
                cand = part.strip().split(" ")[0]
                if cand:
                    images.add(urljoin(base_url, cand))

    for link in soup.find_all("link", rel=lambda v: v and any("icon" in r for r in v)):
        href = link.get("href")
        if href:
            images.add(urljoin(base_url, href))

    for meta_prop in ("og:image", "twitter:image"):
        meta = soup.find("meta", property=meta_prop) or soup.find("meta", attrs={"name": meta_prop})
        if meta and meta.get("content"):
            images.add(urljoin(base_url, meta["content"]))

    return images


def download_binary(url: str, dest_path: str, referer: str = None):
    resp = fetch(url, referer=referer)
    if resp is None:
        return False
    try:
        with open(dest_path, "wb") as f:
            f.write(resp.content)
        return True
    except Exception as e:
        print(f"  [aviso] no se pudo guardar {url}: {e}")
        return False


def safe_filename(url: str, fallback_ext=".bin"):
    name = os.path.basename(urlparse(url).path) or "archivo"
    if "." not in name:
        name += fallback_ext
    name = re.sub(r"[^a-zA-Z0-9._-]", "_", name)
    return name


def build_folder(url: str, out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    subdirs = {
        "logos_e_imagenes": os.path.join(out_dir, "logos_e_imagenes"),
        "fuentes": os.path.join(out_dir, "fuentes"),
    }
    for d in subdirs.values():
        os.makedirs(d, exist_ok=True)
    return subdirs


def main():
    parser = argparse.ArgumentParser(description="Extrae assets de marca de una web.")
    parser.add_argument("url", help="URL de la web (ej: https://ejemplo.com)")
    parser.add_argument("--out", help="Carpeta de salida", default=None)
    args = parser.parse_args()

    url = args.url
    if not url.startswith("http"):
        url = "https://" + url

    out_dir = args.out or f"marca_{slugify(url)}"
    print(f"Analizando {url} ...")

    resp = fetch(url)
    if resp is None:
        print(
            "No se pudo acceder a la web. Si el error es 403 Forbidden, el sitio "
            "tiene protección anti-bot (Cloudflare, firewall, etc.) que bloquea "
            "también navegadores automatizados. En ese caso, abre la web en Chrome, "
            "usa 'Guardar como > Página web completa' y pásame el HTML guardado, "
            "o dime la URL y lo reviso manualmente."
        )
        sys.exit(1)

    soup = BeautifulSoup(resp.text, "html.parser")
    subdirs = build_folder(url, out_dir)

    # --- CSS: colores y tipografías ---
    print("Buscando hojas de estilo y colores...")
    css_blobs = collect_css_texts(url, soup)
    colors = extract_colors(css_blobs)
    families, font_face_urls = extract_fonts(css_blobs)
    google_fonts = extract_google_fonts(soup)

    # --- Descargar fuentes @font-face ---
    print(f"Descargando {len(font_face_urls)} archivo(s) de fuente...")
    downloaded_fonts = []
    for furl in font_face_urls:
        fname = safe_filename(furl, ".woff2")
        dest = os.path.join(subdirs["fuentes"], fname)
        if download_binary(furl, dest, referer=url):
            downloaded_fonts.append(fname)

    # --- Imágenes y logos ---
    print("Buscando imágenes y logos...")
    images = extract_images(url, soup)
    print(f"Descargando {len(images)} imagen(es)...")
    downloaded_images = []
    for i, img_url in enumerate(sorted(images)):
        fname = safe_filename(img_url, f".img{i}")
        dest = os.path.join(subdirs["logos_e_imagenes"], fname)
        if download_binary(img_url, dest, referer=url):
            downloaded_images.append(fname)

    # --- Paleta ordenada por frecuencia ---
    top_colors = colors.most_common(30)
    top_fonts = families.most_common(15)

    # --- Guardar resumen JSON ---
    summary = {
        "url": url,
        "colores_detectados": [{"valor": c, "apariciones": n} for c, n in top_colors],
        "tipografias_css": [{"nombre": f, "apariciones": n} for f, n in top_fonts],
        "google_fonts_links": google_fonts,
        "fuentes_descargadas": downloaded_fonts,
        "imagenes_descargadas": downloaded_images,
    }
    with open(os.path.join(out_dir, "resumen_marca.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    # --- Generar paleta visual (PNG) si Pillow está disponible ---
    if Image is not None and top_colors:
        generate_palette_image(top_colors, os.path.join(out_dir, "paleta_colores.png"))

    # --- README legible ---
    write_readme(out_dir, url, top_colors, top_fonts, google_fonts, downloaded_fonts, downloaded_images)

    print(f"\nListo. Todo guardado en: {os.path.abspath(out_dir)}")


def generate_palette_image(top_colors, dest_path, swatch_size=100):
    """Crea una imagen PNG con muestras de los colores hexadecimales detectados."""
    hex_colors = [c for c, _ in top_colors if c.startswith("#")][:20]
    if not hex_colors:
        return
    cols = min(5, len(hex_colors))
    rows = (len(hex_colors) + cols - 1) // cols
    img = Image.new("RGB", (cols * swatch_size, rows * swatch_size), "white")
    for idx, hex_color in enumerate(hex_colors):
        try:
            h = hex_color.lstrip("#")
            if len(h) == 3:
                h = "".join(c * 2 for c in h)
            rgb = tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
        except Exception:
            continue
        x = (idx % cols) * swatch_size
        y = (idx // cols) * swatch_size
        for dx in range(swatch_size):
            for dy in range(swatch_size):
                img.putpixel((x + dx, y + dy), rgb)
    img.save(dest_path)


def write_readme(out_dir, url, top_colors, top_fonts, google_fonts, downloaded_fonts, downloaded_images):
    lines = [
        f"# Assets de marca — {url}",
        "",
        "## Colores detectados",
        "",
    ]
    for c, n in top_colors:
        lines.append(f"- `{c}` (aparece {n} veces)")

    lines += ["", "## Tipografías detectadas (CSS)", ""]
    for name, n in top_fonts:
        lines.append(f"- {name} (aparece {n} veces)")

    if google_fonts:
        lines += ["", "## Google Fonts enlazados", ""]
        for g in google_fonts:
            lines.append(f"- {g}")

    lines += ["", f"## Archivos descargados", ""]
    lines.append(f"- Fuentes: {len(downloaded_fonts)} archivo(s) en `fuentes/`")
    lines.append(f"- Imágenes/logos: {len(downloaded_images)} archivo(s) en `logos_e_imagenes/`")
    lines += ["", "Ver también `resumen_marca.json` para los datos en bruto y `paleta_colores.png` para una vista rápida de la paleta."]

    with open(os.path.join(out_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    main()
