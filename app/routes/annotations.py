from flask import Blueprint, jsonify, request, abort, Response

from app import db
from app.models import Article, Highlight, Note

annotations_bp = Blueprint("annotations", __name__)


# ---------- Highlights ----------

@annotations_bp.route("/api/articles/<int:article_id>/highlights", methods=["GET"])
def list_highlights(article_id):
    article = db.session.get(Article, article_id)
    if not article:
        abort(404)
    return jsonify([h.to_dict() for h in article.highlights])


@annotations_bp.route("/api/articles/<int:article_id>/highlights", methods=["POST"])
def create_highlight(article_id):
    article = db.session.get(Article, article_id)
    if not article:
        abort(404)
    data = request.get_json(silent=True) or {}
    page = data.get("page_number")
    text_content = data.get("text_content") or ""
    rects = data.get("rects") or []
    color = data.get("color") or "yellow"
    if page is None or not text_content or not isinstance(rects, list):
        return jsonify({"error": "page_number, text_content, rects required"}), 400

    h = Highlight(
        article_id=article_id,
        page_number=int(page),
        color=color,
        text_content=text_content,
        rects=rects,
        note=(data.get("note") or None),
    )
    db.session.add(h)
    db.session.commit()
    return jsonify(h.to_dict()), 201


@annotations_bp.route("/api/highlights/<int:hid>", methods=["PATCH"])
def update_highlight(hid):
    h = db.session.get(Highlight, hid)
    if not h:
        abort(404)
    data = request.get_json(silent=True) or {}
    if "color" in data:
        h.color = data["color"]
    if "note" in data:
        h.note = data["note"] or None
    db.session.commit()
    return jsonify(h.to_dict())


@annotations_bp.route("/api/highlights/<int:hid>", methods=["DELETE"])
def delete_highlight(hid):
    h = db.session.get(Highlight, hid)
    if not h:
        abort(404)
    db.session.delete(h)
    db.session.commit()
    return jsonify({"ok": True})


# ---------- Notes ----------

@annotations_bp.route("/api/articles/<int:article_id>/notes", methods=["GET"])
def list_notes(article_id):
    article = db.session.get(Article, article_id)
    if not article:
        abort(404)
    return jsonify([n.to_dict() for n in article.notes])


@annotations_bp.route("/api/articles/<int:article_id>/notes", methods=["POST"])
def create_note(article_id):
    article = db.session.get(Article, article_id)
    if not article:
        abort(404)
    data = request.get_json(silent=True) or {}
    page = data.get("page_number")
    body = (data.get("body") or "").strip()
    x = data.get("x")
    y = data.get("y")
    if page is None or x is None or y is None or not body:
        return jsonify({"error": "page_number, x, y, body required"}), 400

    n = Note(
        article_id=article_id,
        page_number=int(page),
        x=float(x),
        y=float(y),
        body=body,
    )
    db.session.add(n)
    db.session.commit()
    return jsonify(n.to_dict()), 201


@annotations_bp.route("/api/notes/<int:nid>", methods=["PATCH"])
def update_note(nid):
    n = db.session.get(Note, nid)
    if not n:
        abort(404)
    data = request.get_json(silent=True) or {}
    if "body" in data:
        n.body = (data["body"] or "").strip()
    if "x" in data:
        n.x = float(data["x"])
    if "y" in data:
        n.y = float(data["y"])
    db.session.commit()
    return jsonify(n.to_dict())


@annotations_bp.route("/api/notes/<int:nid>", methods=["DELETE"])
def delete_note(nid):
    n = db.session.get(Note, nid)
    if not n:
        abort(404)
    db.session.delete(n)
    db.session.commit()
    return jsonify({"ok": True})


# ---------- Markdown export ----------

@annotations_bp.route("/api/articles/<int:article_id>/annotations/export", methods=["GET"])
def export_annotations(article_id):
    article = db.session.get(Article, article_id)
    if not article:
        abort(404)

    lines = [f"# {article.title}", ""]
    if article.authors:
        lines.append(f"_{', '.join(article.authors)}_")
    if article.year:
        lines.append(f"_{article.year}_")
    if article.arxiv_id:
        lines.append(f"arXiv: `{article.arxiv_id}`")
    lines.append("")

    # Group by page
    by_page: dict[int, list] = {}
    for h in article.highlights:
        by_page.setdefault(h.page_number, []).append(("h", h))
    for n in article.notes:
        by_page.setdefault(n.page_number, []).append(("n", n))

    for page in sorted(by_page.keys()):
        lines.append(f"## Page {page}")
        lines.append("")
        for kind, item in by_page[page]:
            if kind == "h":
                lines.append(f"- **[{item.color}]** > {item.text_content.strip()}")
                if item.note:
                    lines.append(f"  - _{item.note.strip()}_")
            else:
                lines.append(f"- 📌 {item.body.strip()}")
        lines.append("")

    md = "\n".join(lines)
    fname = f"annotations_{article_id}.md"
    return Response(
        md,
        mimetype="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )
