# Research Library

A Flask app to manage a personal library of scientific PDF papers, with an integrated PDF reader, annotations, collections, advanced filtering, and BibTeX/Markdown export.

## Contents

- Overview
- Features
- Tech stack
- Quick setup
- Run the app
- Configuration
- Usage
- Main API endpoints
- Project structure
- Data and persistence
- Known limitations

## Overview

This project lets you:

- import papers from local PDF files or arXiv
- enrich and edit metadata
- organize papers into collections
- track reading status
- search in extracted full text
- read and annotate PDFs directly in the app
- export BibTeX references and annotation notes

## Features

### Library

- PDF upload (max file size: 200 MB)
- Direct import from arXiv URL/ID (automatic PDF download)
- Automatic arXiv metadata fetch (on import and via re-fetch)
- Rich metadata: title, authors, abstract, DOI, year, journal, venue, discipline, keywords
- Article view and collection-first view
- Quick actions on each article card:
  - update reading status
  - add/remove collections
  - export BibTeX
  - open arxivisual (when arXiv ID is present)

### Search and filters

- Text search across title, authors, abstract, DOI, arXiv, and extracted PDF text
- Filter by collection
- Filter by reading status
- Year filtering by decade buckets
- Custom year range filter (From/To)
- Cross-filtering behavior:
  - status counts are recomputed from the active year range
  - decade buckets are recomputed from the active status

### PDF reader and annotations

- PDF.js-based reader
- Zoom and page navigation
- Colored text highlights
- Page-anchored notes
- Edit/delete highlights via popover
- Highlights/Notes dashboard in side panel
- Copy citation from selected text
- Export annotations to Markdown

### Export

- Single paper BibTeX export
- Bulk BibTeX export (selected papers)
- Markdown export for paper annotations

## Tech stack

- Backend: Flask 3, Flask-SQLAlchemy
- Database: SQLite
- PDF parsing: PyPDF2
- External HTTP: requests (arXiv)
- Frontend: Jinja2 templates + vanilla JavaScript + CSS
- Reader: PDF.js (CDN)

Python dependencies (see `requirements.txt`):

- Flask==3.1.*
- Flask-SQLAlchemy==3.1.*
- PyPDF2==3.0.*
- requests==2.32.*

## Quick setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run the app

```bash
python run.py
```

The app runs at:

- http://127.0.0.1:5000

## Configuration

Configuration is in `app/config.py`:

- `SQLALCHEMY_DATABASE_URI`: local SQLite database (`library.db`)
- `UPLOAD_FOLDER`: PDF storage folder (`uploads/`)
- `MAX_CONTENT_LENGTH`: upload limit (200 MB)
- `ALLOWED_EXTENSIONS`: `{"pdf"}`
- `ARXIVISUAL_URL_TEMPLATE`: target URL for arxivisual links
- `FULLTEXT_MAX_CHARS`: max extracted PDF text stored for search

## Usage

### Add a paper

Two options:

- Local PDF upload (with metadata/text extraction)
- arXiv URL/ID import (full import from arXiv)

### Organize the library

- Create collections in the sidebar
- Assign/reassign a paper with the `Collections` quick action on cards
- Update reading status quickly with the `Status` quick action

### Filter

- Use Collection, Status, and Year (decade) facets
- Enter a custom range in `From` / `To`, then click `Apply` (or press Enter)

### Annotate PDFs

- Open reader with double-click on a card or the `Read` button
- Select text to create a highlight
- Click in the page to create a note
- Export annotations to Markdown

## Main API endpoints

### Articles

- `GET /api/articles` (filters: `q`, `collection`, `status`, `year`)
- `POST /api/articles`
- `GET /api/articles/<id>`
- `PATCH /api/articles/<id>`
- `DELETE /api/articles/<id>`
- `POST /api/articles/<id>/fetch-arxiv`
- `GET /api/articles/<id>/bibtex`
- `POST /api/articles/bibtex-bulk`

### Collections

- `GET /api/collections`
- `POST /api/collections`
- `PATCH /api/collections/<id>`
- `DELETE /api/collections/<id>`
- `POST /api/collections/<id>/articles`
- `DELETE /api/collections/<id>/articles/<article_id>`

### Annotations

- Highlights:
  - `GET /api/articles/<id>/highlights`
  - `POST /api/articles/<id>/highlights`
  - `PATCH /api/highlights/<id>`
  - `DELETE /api/highlights/<id>`
- Notes:
  - `GET /api/articles/<id>/notes`
  - `POST /api/articles/<id>/notes`
  - `PATCH /api/notes/<id>`
  - `DELETE /api/notes/<id>`
- Export:
  - `GET /api/articles/<id>/annotations/export`

### Reader

- `GET /read/<id>`
- `GET /uploads/<filename>`

## Project structure

```text
run.py
requirements.txt
app/
  __init__.py
  config.py
  models.py
  routes/
    articles.py
    collections.py
    annotations.py
    reader.py
  services/
    article_service.py
    arxiv_service.py
    bibtex_service.py
    file_service.py
    search_service.py
  static/
    css/style.css
    js/library.js
    js/reader.js
    js/annotations.js
  templates/
    base.html
    library.html
    reader.html
uploads/
library.db
```

## Data and persistence

- SQLAlchemy schema is created automatically at startup (`db.create_all()`)
- Local SQLite database: `library.db`
- Uploaded PDFs are stored in `uploads/`

To reset local data:

```bash
rm -f library.db app/library.db
rm -f uploads/*.pdf
```

(`uploads/.gitkeep` can be kept.)

## Known limitations

- Scanned PDFs without a text layer provide limited extraction/search quality
- Full-text search currently uses SQL `LIKE` (not FTS5)
- `run.py` uses `debug=True` for local development
