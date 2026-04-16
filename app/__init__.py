import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)

    from app.routes.articles import articles_bp
    from app.routes.collections import collections_bp
    from app.routes.annotations import annotations_bp
    from app.routes.reader import reader_bp

    app.register_blueprint(articles_bp)
    app.register_blueprint(collections_bp)
    app.register_blueprint(annotations_bp)
    app.register_blueprint(reader_bp)

    with app.app_context():
        from app import models  # noqa: F401

        db.create_all()

    return app
