# Library - Bibliothèque d'articles scientifiques

Application Flask pour gérer une bibliothèque personnelle d'articles scientifiques (PDF uniquement), avec lecteur PDF, annotations et export BibTeX.

## Fonctionnalités principales

- Upload de PDF avec extraction automatique du texte (PyPDF2)
- Import direct depuis URL/ID arXiv (download automatique du PDF)
- Fetch automatique des métadonnées arXiv à l'upload ou après coup
- Métadonnées riches: titre, auteurs, résumé, DOI, année, journal, discipline, mots-clés
- Collections d'articles
- Recherche full-text (LIKE SQLite sur titre/résumé/auteurs/mots-clés/texte)
- Lecteur PDF avec:
	- surlignages colorés
	- notes ancrées par page
	- bouton Citer sur sélection
	- tableau de bord Highlights / Notes
- Export markdown des annotations
- Export BibTeX (unitaire et en masse)

## Prérequis

- Python 3.10+
- pip

## Installation

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Lancer l'application

```bash
python run.py
```

L'application est servie sur http://127.0.0.1:5000.

## Base de données

Le schéma SQLAlchemy est recréé automatiquement au démarrage via `db.create_all()`.

Si vous venez de l'ancienne version orientée livres, supprimez l'ancienne base:

```bash
rm -f library.db app/library.db
```

## arXiv et arxivisual

- Le fetch arXiv utilise l'API `http://export.arxiv.org/api/query`.
- Le PDF arXiv est téléchargé automatiquement via `https://arxiv.org/pdf/{id}.pdf` si vous ajoutez un article sans fichier local.
- Le template d'URL arxivisual est configurable dans [app/config.py](app/config.py) via `ARXIVISUAL_URL_TEMPLATE` (par défaut: `https://arxivisual.org/abs/{id}`).

## Limitations connues

- Les PDFs scannés sans couche texte donnent peu ou pas de résultat en recherche.
- La recherche full-text est en mode LIKE (pas encore FTS5).
