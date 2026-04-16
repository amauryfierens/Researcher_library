from flask import Blueprint, jsonify, request, abort

from app import db
from app.models import Collection, Article

collections_bp = Blueprint("collections", __name__)


@collections_bp.route("/api/collections", methods=["GET"])
def list_collections():
    cols = Collection.query.order_by(Collection.name).all()
    return jsonify([c.to_dict() for c in cols])


@collections_bp.route("/api/collections", methods=["POST"])
def create_collection():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name required"}), 400
    if Collection.query.filter_by(name=name).first():
        return jsonify({"error": "name already exists"}), 409
    col = Collection(name=name, description=(data.get("description") or "").strip() or None)
    db.session.add(col)
    db.session.commit()
    return jsonify(col.to_dict()), 201


@collections_bp.route("/api/collections/<int:col_id>", methods=["PATCH"])
def update_collection(col_id):
    col = db.session.get(Collection, col_id)
    if not col:
        abort(404)
    data = request.get_json(silent=True) or {}
    if "name" in data:
        new_name = (data["name"] or "").strip()
        if not new_name:
            return jsonify({"error": "name required"}), 400
        col.name = new_name
    if "description" in data:
        col.description = (data["description"] or "").strip() or None
    db.session.commit()
    return jsonify(col.to_dict())


@collections_bp.route("/api/collections/<int:col_id>", methods=["DELETE"])
def delete_collection(col_id):
    col = db.session.get(Collection, col_id)
    if not col:
        abort(404)
    db.session.delete(col)
    db.session.commit()
    return jsonify({"ok": True})


@collections_bp.route("/api/collections/<int:col_id>/articles", methods=["POST"])
def add_article_to_collection(col_id):
    col = db.session.get(Collection, col_id)
    if not col:
        abort(404)
    data = request.get_json(silent=True) or {}
    aid = data.get("article_id")
    article = db.session.get(Article, aid) if aid else None
    if not article:
        return jsonify({"error": "article not found"}), 404
    if article not in col.articles:
        col.articles.append(article)
        db.session.commit()
    return jsonify(col.to_dict())


@collections_bp.route(
    "/api/collections/<int:col_id>/articles/<int:article_id>", methods=["DELETE"]
)
def remove_article_from_collection(col_id, article_id):
    col = db.session.get(Collection, col_id)
    if not col:
        abort(404)
    article = db.session.get(Article, article_id)
    if article and article in col.articles:
        col.articles.remove(article)
        db.session.commit()
    return jsonify(col.to_dict())
