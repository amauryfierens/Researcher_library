"""arXiv API metadata fetcher.

Uses the public arXiv export API to retrieve title, authors, abstract,
publication year and primary categories from an arXiv ID.
"""
import re
import xml.etree.ElementTree as ET

import requests

ATOM = "{http://www.w3.org/2005/Atom}"
ARXIV = "{http://arxiv.org/schemas/atom}"
DEFAULT_HEADERS = {"User-Agent": "library/1.0"}

ARXIV_API_ENDPOINTS = [
    "https://export.arxiv.org/api/query?id_list={id}",
    "http://export.arxiv.org/api/query?id_list={id}",
    "https://arxiv.org/api/query?id_list={id}",
]

ARXIV_PDF_ENDPOINTS = [
    "https://arxiv.org/pdf/{id}.pdf",
    "https://export.arxiv.org/pdf/{id}.pdf",
]

# Matches "2401.12345", "2401.12345v2", "arxiv.org/abs/2401.12345",
# "https://arxiv.org/pdf/2401.12345v1.pdf", etc.
ARXIV_ID_RE = re.compile(
    r"(?:arxiv\.org/(?:abs|pdf)/)?(?P<id>(?:\d{4}\.\d{4,5}|[a-z\-]+(?:\.[A-Z]{2})?/\d{7}))(?:v\d+)?(?:\.pdf)?",
    re.IGNORECASE,
)


def normalize_arxiv_id(user_input: str) -> str | None:
    if not user_input:
        return None
    m = ARXIV_ID_RE.search(user_input.strip())
    return m.group("id") if m else None


def _request_with_fallback(
    candidates: list[tuple[str, tuple[int, int]]]
) -> requests.Response:
    """Try endpoints in order and return the first successful response."""
    errors: list[str] = []
    for url, timeout in candidates:
        try:
            resp = requests.get(url, timeout=timeout, headers=DEFAULT_HEADERS)
            resp.raise_for_status()
            return resp
        except requests.RequestException as exc:
            errors.append(f"{url}: {exc}")

    tail = " | ".join(errors[-3:])
    raise RuntimeError(f"all arXiv endpoints failed ({tail})")


def download_arxiv_pdf(arxiv_id: str) -> bytes:
    """Download the canonical PDF for a normalized arXiv id."""
    candidates = [
        (ARXIV_PDF_ENDPOINTS[0].format(id=arxiv_id), (4, 28)),
        (ARXIV_PDF_ENDPOINTS[1].format(id=arxiv_id), (4, 20)),
    ]
    resp = _request_with_fallback(candidates)
    payload = resp.content or b""
    if not payload.startswith(b"%PDF"):
        raise ValueError("Downloaded file is not a valid PDF")
    return payload


def fetch_arxiv_metadata(arxiv_id: str) -> dict:
    """Fetch metadata for a normalized arXiv id. Raises on network/parse errors."""
    candidates = [
        (ARXIV_API_ENDPOINTS[0].format(id=arxiv_id), (4, 12)),
        (ARXIV_API_ENDPOINTS[1].format(id=arxiv_id), (4, 8)),
        (ARXIV_API_ENDPOINTS[2].format(id=arxiv_id), (4, 8)),
    ]
    resp = _request_with_fallback(candidates)
    root = ET.fromstring(resp.text)
    entry = root.find(f"{ATOM}entry")
    if entry is None:
        raise ValueError("arXiv entry not found")

    title = (entry.findtext(f"{ATOM}title") or "").strip()
    summary = (entry.findtext(f"{ATOM}summary") or "").strip()
    # Collapse whitespace introduced by XML line wrapping
    title = re.sub(r"\s+", " ", title)
    summary = re.sub(r"\s+", " ", summary)

    authors = []
    for a in entry.findall(f"{ATOM}author"):
        name = (a.findtext(f"{ATOM}name") or "").strip()
        if name:
            authors.append(name)

    published = entry.findtext(f"{ATOM}published") or ""
    year = None
    if len(published) >= 4 and published[:4].isdigit():
        year = int(published[:4])

    categories = [
        c.get("term") for c in entry.findall(f"{ATOM}category") if c.get("term")
    ]

    primary_category = entry.find(f"{ARXIV}primary_category")
    primary_term = primary_category.get("term") if primary_category is not None else None
    discipline = None
    if primary_term:
        discipline = primary_term.split(".", 1)[0]

    doi = (entry.findtext(f"{ARXIV}doi") or "").strip() or None
    journal_ref = (entry.findtext(f"{ARXIV}journal_ref") or "").strip() or None

    pdf_url = None
    for link in entry.findall(f"{ATOM}link"):
        link_title = (link.get("title") or "").lower()
        href = link.get("href")
        if href and (link_title == "pdf" or "/pdf/" in href):
            pdf_url = href
            break

    return {
        "arxiv_id": arxiv_id,
        "title": title,
        "abstract": summary,
        "authors": authors,
        "year": year,
        "keywords": categories,
        "venue": "arXiv preprint",
        "discipline": discipline,
        "doi": doi,
        "journal": journal_ref,
        "pdf_url": pdf_url,
    }
