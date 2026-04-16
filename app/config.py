import os

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


class Config:
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'library.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 200 * 1024 * 1024  # 200 MB max upload
    ALLOWED_EXTENSIONS = {"pdf"}

    # arxivisual canonical article URL
    ARXIVISUAL_URL_TEMPLATE = "https://arxivisual.org/abs/{id}"

    # Maximum chars of extracted PDF text to store for full-text search
    FULLTEXT_MAX_CHARS = 2_000_000
