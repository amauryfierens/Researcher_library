"""LIKE-based full-text search across articles.

# TODO(fts5): For larger libraries, migrate to a SQLite FTS5 virtual table
# kept in sync via triggers:
#   CREATE VIRTUAL TABLE articles_fts USING fts5(
#       title, authors, abstract, keywords, full_text,
#       content='articles', content_rowid='id'
#   );
"""
from sqlalchemy import String, or_, cast

from app.models import Article


def search_articles(query: str | None = None,
                    collection_id: int | None = None,
                    status: str | None = None,
                    year: int | None = None):
    q = Article.query

    if collection_id:
        q = q.filter(Article.collections.any(id=collection_id))
    if status:
        q = q.filter(Article.reading_status == status)
    if year:
        q = q.filter(Article.year == year)

    if query:
        like = f"%{query}%"
        # JSON columns serialize to text in SQLite, so LIKE works against the cast.
        q = q.filter(
            or_(
                Article.title.ilike(like),
                Article.abstract.ilike(like),
                Article.full_text.ilike(like),
                cast(Article.authors, String).ilike(like),
                cast(Article.keywords, String).ilike(like),
                Article.journal.ilike(like),
                Article.discipline.ilike(like),
                Article.doi.ilike(like),
                Article.arxiv_id.ilike(like),
            )
        )

    return q.order_by(Article.added_at.desc()).all()
