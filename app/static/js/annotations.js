export function buildCitation(text, article) {
    const firstAuthor = ((article.authors || [])[0] || "Auteur inconnu").trim();
    const shortAuthor = firstAuthor.includes(",")
        ? firstAuthor.split(",", 1)[0].trim()
        : (firstAuthor.split(" ").pop() || "Auteur");
    const year = article.year || "n.d.";
    return `"${text}" — ${shortAuthor} et al., ${year}`;
}

export async function copyCitation(text, article) {
    const citation = buildCitation(text, article);
    try {
        await navigator.clipboard.writeText(citation);
        return { ok: true, citation };
    } catch (err) {
        const fallback = document.createElement("textarea");
        fallback.value = citation;
        document.body.appendChild(fallback);
        fallback.select();
        document.execCommand("copy");
        fallback.remove();
        return { ok: true, citation };
    }
}

export function truncate(text, max = 130) {
    if (!text) return "";
    return text.length <= max ? text : `${text.slice(0, max)}...`;
}
