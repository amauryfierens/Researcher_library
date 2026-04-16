import os
import uuid

from flask import current_app
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader


def allowed_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in current_app.config["ALLOWED_EXTENSIONS"]
    )


def save_upload(file) -> str:
    """Save uploaded PDF with a unique name. Returns stored filename."""
    original = secure_filename(file.filename or "upload.pdf")
    ext = original.rsplit(".", 1)[-1].lower() if "." in original else "pdf"
    if ext != "pdf":
        ext = "pdf"
    stored_name = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], stored_name))
    return stored_name


def save_pdf_bytes(data: bytes, suggested_stem: str | None = None) -> str:
    """Save in-memory PDF content as a stored file. Returns stored filename."""
    stem = secure_filename(suggested_stem or "arxiv") or "arxiv"
    stored_name = f"{stem}-{uuid.uuid4().hex}.pdf"
    path = os.path.join(current_app.config["UPLOAD_FOLDER"], stored_name)
    with open(path, "wb") as fh:
        fh.write(data)
    return stored_name


def delete_file(filename: str) -> None:
    path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    if os.path.exists(path):
        os.remove(path)


def get_file_path(filename: str) -> str:
    return os.path.join(current_app.config["UPLOAD_FOLDER"], filename)


def get_file_size_mb(filename: str) -> float:
    path = get_file_path(filename)
    return os.path.getsize(path) / (1024 * 1024)


def extract_pdf_meta(filename: str) -> dict:
    """Extract title/author/page_count from a stored PDF."""
    path = get_file_path(filename)
    meta = {"title": None, "authors": [], "page_count": 0}
    try:
        reader = PdfReader(path)
        meta["page_count"] = len(reader.pages)
        info = reader.metadata or {}
        title = (info.get("/Title") or "").strip() if info else ""
        author = (info.get("/Author") or "").strip() if info else ""
        if title:
            meta["title"] = title
        if author:
            # Author field may contain multiple authors separated by ; or ,
            parts = [a.strip() for a in author.replace(";", ",").split(",")]
            meta["authors"] = [p for p in parts if p]
    except Exception:
        pass
    return meta


def extract_pdf_full_text(filename: str, max_chars: int | None = None) -> str:
    """Extract all text from a stored PDF, truncated to max_chars."""
    path = get_file_path(filename)
    if max_chars is None:
        max_chars = current_app.config.get("FULLTEXT_MAX_CHARS", 2_000_000)
    chunks: list[str] = []
    total = 0
    try:
        reader = PdfReader(path)
        for page in reader.pages:
            try:
                txt = page.extract_text() or ""
            except Exception:
                txt = ""
            if not txt:
                continue
            chunks.append(txt)
            total += len(txt)
            if total >= max_chars:
                break
    except Exception:
        return ""
    out = "\n".join(chunks)
    return out[:max_chars]
