"""Business logic for articles."""
import logging
from sqlalchemy.exc import IntegrityError

from app import db
from app.models import Article, Collection
from app.services import file_service, arxiv_service

logger = logging.getLogger(__name__)


def _apply_arxiv(article: Article, arxiv_input: str) -> None:
    """Try to fetch arXiv metadata and merge it into the article. Fail soft."""
    aid = arxiv_service.normalize_arxiv_id(arxiv_input)
    if not aid:
        return
    try:
        meta = arxiv_service.fetch_arxiv_metadata(aid)
    except Exception as exc:
        logger.warning("arXiv fetch failed for %s: %s", aid, exc)
        article.arxiv_id = aid
        return

    article.arxiv_id = meta["arxiv_id"]
    if meta.get("title"):
        article.title = meta["title"]
    if meta.get("abstract"):
        article.abstract = meta["abstract"]
    if meta.get("authors"):
        article.authors = meta["authors"]
    if meta.get("year"):
        article.year = meta["year"]
    if meta.get("keywords"):
        article.keywords = meta["keywords"]
    if meta.get("venue"):
        article.venue = meta["venue"]
    if meta.get("discipline"):
        article.discipline = meta["discipline"]
    if meta.get("doi") and not article.doi:
        article.doi = meta["doi"]
    if meta.get("journal") and not article.journal:
        article.journal = meta["journal"]


def add_article(file, arxiv_input: str | None = None) -> Article:
    """Save an uploaded PDF, extract metadata, optionally fetch arXiv, persist."""
    filename = file_service.save_upload(file)
    pdf_meta = file_service.extract_pdf_meta(filename)
    full_text = file_service.extract_pdf_full_text(filename)
    size_mb = file_service.get_file_size_mb(filename)

    fallback_title = (
        pdf_meta.get("title")
        or (file.filename.rsplit(".", 1)[0] if file.filename else "Untitled")
    )

    article = Article(
        title=fallback_title,
        authors=pdf_meta.get("authors") or [],
        filename=filename,
        page_count=pdf_meta.get("page_count") or 0,
        file_size_mb=size_mb,
        full_text=full_text or None,
        keywords=[],
    )

    if arxiv_input:
        _apply_arxiv(article, arxiv_input)

    db.session.add(article)
    try:
        db.session.commit()
    except IntegrityError as exc:
        db.session.rollback()
        file_service.delete_file(filename)
        raise ValueError("article already exists (same DOI or unique metadata)") from exc
    return article


def add_article_from_arxiv(arxiv_input: str) -> Article:
    """Create an article directly from an arXiv URL/ID by downloading its PDF."""
    aid = arxiv_service.normalize_arxiv_id(arxiv_input)
    if not aid:
        raise ValueError("invalid arxiv id")

    existing = Article.query.filter_by(arxiv_id=aid).first()
    if existing:
        return existing

    try:
        metadata = arxiv_service.fetch_arxiv_metadata(aid)
    except Exception as exc:
        raise ValueError(f"unable to fetch arXiv metadata: {exc}") from exc

    existing_doi = (metadata.get("doi") or "").strip() or None
    if existing_doi:
        existing = Article.query.filter_by(doi=existing_doi).first()
        if existing:
            return existing

    try:
        pdf_bytes = arxiv_service.download_arxiv_pdf(aid)
    except Exception as exc:
        raise ValueError(f"unable to download arXiv PDF: {exc}") from exc

    safe_aid = aid.replace("/", "_")
    filename = file_service.save_pdf_bytes(pdf_bytes, suggested_stem=f"arxiv_{safe_aid}")

    pdf_meta = file_service.extract_pdf_meta(filename)
    full_text = file_service.extract_pdf_full_text(filename)
    size_mb = file_service.get_file_size_mb(filename)

    fallback_title = (
        metadata.get("title")
        or pdf_meta.get("title")
        or f"arXiv {aid}"
    )

    article = Article(
        title=fallback_title,
        authors=metadata.get("authors") or pdf_meta.get("authors") or [],
        abstract=metadata.get("abstract") or None,
        doi=metadata.get("doi") or None,
        arxiv_id=aid,
        journal=metadata.get("journal") or None,
        year=metadata.get("year") or None,
        venue=metadata.get("venue") or "arXiv preprint",
        discipline=metadata.get("discipline") or None,
        keywords=metadata.get("keywords") or [],
        filename=filename,
        page_count=pdf_meta.get("page_count") or 0,
        file_size_mb=size_mb,
        full_text=full_text or None,
    )

    db.session.add(article)
    try:
        db.session.commit()
    except IntegrityError as exc:
        db.session.rollback()
        file_service.delete_file(filename)
        raise ValueError("article already exists (same DOI or unique metadata)") from exc
    return article


def get_article(article_id: int) -> Article | None:
    return db.session.get(Article, article_id)


def delete_article(article_id: int) -> bool:
    article = get_article(article_id)
    if not article:
        return False
    file_service.delete_file(article.filename)
    db.session.delete(article)
    db.session.commit()
    return True


_UPDATABLE_FIELDS = {
    "title", "abstract", "doi", "journal", "year", "venue",
    "discipline", "reading_status",
}
_UPDATABLE_LIST_FIELDS = {"authors", "keywords"}


def update_article(article_id: int, data: dict) -> Article | None:
    article = get_article(article_id)
    if not article:
        return None

    for field in _UPDATABLE_FIELDS:
        if field in data:
            setattr(article, field, data[field])
    for field in _UPDATABLE_LIST_FIELDS:
        if field in data and isinstance(data[field], list):
            setattr(article, field, data[field])

    if "collection_ids" in data and isinstance(data["collection_ids"], list):
        cols = Collection.query.filter(Collection.id.in_(data["collection_ids"])).all()
        article.collections = cols

    db.session.commit()
    return article


def refetch_arxiv(article_id: int, arxiv_input: str) -> Article | None:
    article = get_article(article_id)
    if not article:
        return None
    _apply_arxiv(article, arxiv_input)
    db.session.commit()
    return article
