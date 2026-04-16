from datetime import datetime, timezone

from app import db


article_collections = db.Table(
    "article_collections",
    db.Column(
        "article_id",
        db.Integer,
        db.ForeignKey("articles.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    db.Column(
        "collection_id",
        db.Integer,
        db.ForeignKey("collections.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Article(db.Model):
    __tablename__ = "articles"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(1000), nullable=False)
    authors = db.Column(db.JSON, nullable=False, default=list)
    abstract = db.Column(db.Text, nullable=True)
    doi = db.Column(db.String(200), nullable=True, unique=True)
    arxiv_id = db.Column(db.String(50), nullable=True, index=True)
    journal = db.Column(db.String(500), nullable=True)
    year = db.Column(db.Integer, nullable=True)
    venue = db.Column(db.String(500), nullable=True)
    discipline = db.Column(db.String(200), nullable=True)
    keywords = db.Column(db.JSON, nullable=False, default=list)

    filename = db.Column(db.String(500), nullable=False, unique=True)
    page_count = db.Column(db.Integer, default=0)
    file_size_mb = db.Column(db.Float, default=0.0)
    added_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    full_text = db.Column(db.Text, nullable=True)
    reading_status = db.Column(db.String(20), default="to_read")

    highlights = db.relationship(
        "Highlight",
        back_populates="article",
        cascade="all, delete-orphan",
        order_by="Highlight.page_number, Highlight.created_at",
    )
    notes = db.relationship(
        "Note",
        back_populates="article",
        cascade="all, delete-orphan",
        order_by="Note.page_number, Note.created_at",
    )
    collections = db.relationship(
        "Collection",
        secondary=article_collections,
        back_populates="articles",
    )

    def to_dict(self, include_full_text=False):
        d = {
            "id": self.id,
            "title": self.title,
            "authors": self.authors or [],
            "abstract": self.abstract,
            "doi": self.doi,
            "arxiv_id": self.arxiv_id,
            "journal": self.journal,
            "year": self.year,
            "venue": self.venue,
            "discipline": self.discipline,
            "keywords": self.keywords or [],
            "filename": self.filename,
            "page_count": self.page_count,
            "file_size_mb": round(self.file_size_mb or 0, 2),
            "added_at": self.added_at.isoformat() if self.added_at else None,
            "reading_status": self.reading_status,
            "collection_ids": [c.id for c in self.collections],
        }
        if include_full_text:
            d["full_text"] = self.full_text
        return d


class Collection(db.Model):
    __tablename__ = "collections"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    articles = db.relationship(
        "Article",
        secondary=article_collections,
        back_populates="collections",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "article_count": len(self.articles),
        }


class Highlight(db.Model):
    __tablename__ = "highlights"

    id = db.Column(db.Integer, primary_key=True)
    article_id = db.Column(
        db.Integer,
        db.ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    page_number = db.Column(db.Integer, nullable=False)
    color = db.Column(db.String(20), nullable=False, default="yellow")
    text_content = db.Column(db.Text, nullable=False)
    rects = db.Column(db.JSON, nullable=False, default=list)
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    article = db.relationship("Article", back_populates="highlights")

    def to_dict(self):
        return {
            "id": self.id,
            "article_id": self.article_id,
            "page_number": self.page_number,
            "color": self.color,
            "text_content": self.text_content,
            "rects": self.rects or [],
            "note": self.note,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    article_id = db.Column(
        db.Integer,
        db.ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    page_number = db.Column(db.Integer, nullable=False)
    x = db.Column(db.Float, nullable=False)
    y = db.Column(db.Float, nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    article = db.relationship("Article", back_populates="notes")

    def to_dict(self):
        return {
            "id": self.id,
            "article_id": self.article_id,
            "page_number": self.page_number,
            "x": self.x,
            "y": self.y,
            "body": self.body,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
