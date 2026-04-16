from flask import Blueprint, abort, render_template, send_from_directory, current_app

from app.services.article_service import get_article

reader_bp = Blueprint("reader", __name__)


@reader_bp.route("/read/<int:article_id>")
def read_article(article_id):
    article = get_article(article_id)
    if not article:
        abort(404)
    return render_template(
        "reader.html",
        article=article.to_dict(),
        arxivisual_template=current_app.config["ARXIVISUAL_URL_TEMPLATE"],
    )


@reader_bp.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)
