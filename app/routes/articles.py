from flask import (
    Blueprint, jsonify, request, render_template, abort,
    Response, current_app,
)
from sqlalchemy.exc import IntegrityError

from app import db

from app.services import article_service, file_service, search_service, arxiv_service
from app.services.bibtex_service import article_to_bibtex, articles_to_bibtex
from app.models import Article

articles_bp = Blueprint("articles", __name__)


@articles_bp.route("/")
def index():
    return render_template(
        "library.html",
        arxivisual_template=current_app.config["ARXIVISUAL_URL_TEMPLATE"],
    )


@articles_bp.route("/api/articles", methods=["GET"])
def list_articles():
    q = request.args.get("q", "").strip() or None
    collection_id = request.args.get("collection", type=int)
    status = request.args.get("status") or None
    year = request.args.get("year", type=int)
    articles = search_service.search_articles(
        query=q, collection_id=collection_id, status=status, year=year
    )
    return jsonify([a.to_dict() for a in articles])


@articles_bp.route("/api/articles", methods=["POST"])
def upload_article():
    file = request.files.get("file")
    has_file = bool(file and file.filename)
    arxiv_input = (request.form.get("arxiv") or "").strip() or None

    if has_file and not file_service.allowed_file(file.filename):
        return jsonify({"error": "only PDF allowed"}), 400

    if not has_file and not arxiv_input:
        return jsonify({"error": "provide a PDF file or an arXiv URL/ID"}), 400

    # For arXiv-only imports, avoid creating duplicates when article already exists.
    if not has_file and arxiv_input:
        aid = arxiv_service.normalize_arxiv_id(arxiv_input)
        if aid:
            existing = Article.query.filter_by(arxiv_id=aid).first()
            if existing:
                return jsonify(existing.to_dict()), 200

    try:
        if has_file:
            article = article_service.add_article(file, arxiv_input=arxiv_input)
        else:
            article = article_service.add_article_from_arxiv(arxiv_input)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "article already exists (duplicate DOI)"}), 409

    return jsonify(article.to_dict()), 201


@articles_bp.route("/api/articles/<int:article_id>", methods=["GET"])
def get_article(article_id):
    article = article_service.get_article(article_id)
    if not article:
        abort(404)
    return jsonify(article.to_dict())


@articles_bp.route("/api/articles/<int:article_id>", methods=["PATCH"])
def update_article(article_id):
    data = request.get_json(silent=True) or {}
    article = article_service.update_article(article_id, data)
    if not article:
        abort(404)
    return jsonify(article.to_dict())


@articles_bp.route("/api/articles/<int:article_id>", methods=["DELETE"])
def delete_article(article_id):
    if not article_service.delete_article(article_id):
        abort(404)
    return jsonify({"ok": True})


@articles_bp.route("/api/articles/<int:article_id>/fetch-arxiv", methods=["POST"])
def fetch_arxiv(article_id):
    data = request.get_json(silent=True) or {}
    arxiv_input = (data.get("arxiv") or "").strip()
    if not arxiv_input:
        return jsonify({"error": "missing arxiv id"}), 400
    article = article_service.refetch_arxiv(article_id, arxiv_input)
    if not article:
        abort(404)
    return jsonify(article.to_dict())


@articles_bp.route("/api/articles/<int:article_id>/bibtex", methods=["GET"])
def get_bibtex(article_id):
    article = article_service.get_article(article_id)
    if not article:
        abort(404)
    bib = article_to_bibtex(article)
    return Response(
        bib,
        mimetype="application/x-bibtex",
        headers={
            "Content-Disposition": f'attachment; filename="article_{article_id}.bib"'
        },
    )


@articles_bp.route("/api/articles/bibtex-bulk", methods=["POST"])
def bulk_bibtex():
    data = request.get_json(silent=True) or {}
    ids = data.get("ids") or []
    if not isinstance(ids, list) or not ids:
        return jsonify({"error": "ids required"}), 400
    articles = Article.query.filter(Article.id.in_(ids)).all()
    bib = articles_to_bibtex(articles)
    return Response(
        bib,
        mimetype="application/x-bibtex",
        headers={"Content-Disposition": 'attachment; filename="library.bib"'},
    )
