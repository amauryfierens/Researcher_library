"""Generate BibTeX entries from Article models."""
import re


def _slug(s: str) -> str:
    s = re.sub(r"[^A-Za-z0-9]+", "", s or "")
    return s or "ref"


def _escape(value: str) -> str:
    if value is None:
        return ""
    return str(value).replace("\\", "\\textbackslash{}").replace("{", "\\{").replace("}", "\\}")


def make_citation_key(article) -> str:
    first_author = ""
    if article.authors:
        # Take last name of first author
        name = article.authors[0]
        # Could be "Doe, John" or "John Doe"
        if "," in name:
            first_author = name.split(",", 1)[0]
        else:
            first_author = name.strip().split()[-1] if name.strip() else ""
    year = article.year or ""
    title_word = ""
    if article.title:
        for w in re.findall(r"[A-Za-z]+", article.title):
            if len(w) > 3:
                title_word = w
                break
    return f"{_slug(first_author)}{year}{_slug(title_word)}" or f"article{article.id}"


def article_to_bibtex(article) -> str:
    key = make_citation_key(article)
    entry_type = "article" if article.journal else "misc"
    fields = []

    if article.title:
        fields.append(("title", article.title))
    if article.authors:
        fields.append(("author", " and ".join(article.authors)))
    if article.year:
        fields.append(("year", str(article.year)))
    if article.journal:
        fields.append(("journal", article.journal))
    if article.venue and not article.journal:
        fields.append(("howpublished", article.venue))
    if article.doi:
        fields.append(("doi", article.doi))
    if article.arxiv_id:
        fields.append(("eprint", article.arxiv_id))
        fields.append(("archivePrefix", "arXiv"))
    if article.abstract:
        fields.append(("abstract", article.abstract))
    if article.keywords:
        fields.append(("keywords", ", ".join(article.keywords)))

    lines = [f"@{entry_type}{{{key},"]
    for name, value in fields:
        lines.append(f"  {name} = {{{_escape(value)}}},")
    lines.append("}")
    return "\n".join(lines)


def articles_to_bibtex(articles) -> str:
    return "\n\n".join(article_to_bibtex(a) for a in articles)
