const statusLabels = {
    to_read: "A lire",
    reading: "En cours",
    read: "Lu",
    to_reread: "A relire",
};

const statusOptions = ["to_read", "reading", "read", "to_reread"];

const state = {
    articles: [],
    facetArticles: [],
    collections: [],
    selectedIds: new Set(),
    viewMode: "articles",
    collectionView: {
        selectedCollectionId: null,
        articles: [],
    },
    filters: {
        q: "",
        collection: null,
        status: null,
        yearRange: null,
    },
    editingArticleId: null,
    deletingArticleId: null,
    quickMenu: {
        type: null,
        articleId: null,
    },
};

const dom = {
    searchInput: document.getElementById("searchInput"),
    articlesViewBtn: document.getElementById("articlesViewBtn"),
    collectionsViewBtn: document.getElementById("collectionsViewBtn"),
    uploadBtn: document.getElementById("uploadBtn"),
    bulkBibtexBtn: document.getElementById("bulkBibtexBtn"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    collectionList: document.getElementById("collectionList"),
    statusFilterGroup: document.getElementById("statusFilterGroup"),
    yearFilterGroup: document.getElementById("yearFilterGroup"),
    statusList: document.getElementById("statusList"),
    yearList: document.getElementById("yearList"),
    yearRangeStart: document.getElementById("yearRangeStart"),
    yearRangeEnd: document.getElementById("yearRangeEnd"),
    applyYearRangeBtn: document.getElementById("applyYearRangeBtn"),
    clearYearRangeBtn: document.getElementById("clearYearRangeBtn"),
    createCollectionBtn: document.getElementById("createCollectionBtn"),
    newCollectionName: document.getElementById("newCollectionName"),
    newCollectionDescription: document.getElementById("newCollectionDescription"),
    articlesViewSection: document.getElementById("articlesViewSection"),
    collectionsViewSection: document.getElementById("collectionsViewSection"),
    collectionsBrowser: document.getElementById("collectionsBrowser"),
    collectionsGrid: document.getElementById("collectionsGrid"),
    collectionsEmptyState: document.getElementById("collectionsEmptyState"),
    collectionDetailView: document.getElementById("collectionDetailView"),
    backToCollectionsBtn: document.getElementById("backToCollectionsBtn"),
    collectionDetailTitle: document.getElementById("collectionDetailTitle"),
    collectionDetailMeta: document.getElementById("collectionDetailMeta"),
    collectionArticleGrid: document.getElementById("collectionArticleGrid"),
    collectionArticlesEmptyState: document.getElementById("collectionArticlesEmptyState"),
    articleGrid: document.getElementById("articleGrid"),
    resultCount: document.getElementById("resultCount"),
    activeFilterLabel: document.getElementById("activeFilterLabel"),
    emptyState: document.getElementById("emptyState"),

    uploadModal: document.getElementById("uploadModal"),
    uploadFile: document.getElementById("uploadFile"),
    uploadArxiv: document.getElementById("uploadArxiv"),
    cancelUploadBtn: document.getElementById("cancelUploadBtn"),
    confirmUploadBtn: document.getElementById("confirmUploadBtn"),

    editModal: document.getElementById("editModal"),
    editTitle: document.getElementById("editTitle"),
    editAuthors: document.getElementById("editAuthors"),
    editAbstract: document.getElementById("editAbstract"),
    editYear: document.getElementById("editYear"),
    editStatus: document.getElementById("editStatus"),
    editDiscipline: document.getElementById("editDiscipline"),
    editDoi: document.getElementById("editDoi"),
    editJournal: document.getElementById("editJournal"),
    editVenue: document.getElementById("editVenue"),
    editKeywords: document.getElementById("editKeywords"),
    editArxiv: document.getElementById("editArxiv"),
    refetchArxivBtn: document.getElementById("refetchArxivBtn"),
    editCollections: document.getElementById("editCollections"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),
    saveEditBtn: document.getElementById("saveEditBtn"),

    deleteModal: document.getElementById("deleteModal"),
    deleteLabel: document.getElementById("deleteLabel"),
    cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
    confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
    quickActionMenu: null,
};

init();

function init() {
    initQuickActionMenu();
    bindEvents();
    applyViewMode();
    refresh();
}

function bindEvents() {
    let searchTimer;
    dom.searchInput.addEventListener("input", () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.filters.q = dom.searchInput.value.trim();
            if (state.viewMode === "collections") {
                if (state.collectionView.selectedCollectionId) {
                    loadCollectionViewArticles();
                } else {
                    renderCollectionsBrowser();
                }
            } else {
                loadArticles();
            }
        }, 280);
    });

    dom.articlesViewBtn.addEventListener("click", () => setViewMode("articles"));
    dom.collectionsViewBtn.addEventListener("click", () => setViewMode("collections"));
    dom.backToCollectionsBtn.addEventListener("click", closeCollectionDetail);

    dom.uploadBtn.addEventListener("click", () => openModal(dom.uploadModal));
    dom.cancelUploadBtn.addEventListener("click", () => closeModal(dom.uploadModal));
    dom.confirmUploadBtn.addEventListener("click", uploadArticle);

    dom.clearFiltersBtn.addEventListener("click", () => {
        state.filters.q = "";
        state.filters.collection = null;
        state.filters.status = null;
        state.filters.yearRange = null;
        state.collectionView.selectedCollectionId = null;
        state.collectionView.articles = [];
        state.selectedIds.clear();
        dom.searchInput.value = "";
        renderYearRangeInputs();
        renderAll();
        loadArticles();
    });

    dom.bulkBibtexBtn.addEventListener("click", exportBulkBibtex);
    dom.createCollectionBtn.addEventListener("click", createCollection);

    if (dom.applyYearRangeBtn) {
        dom.applyYearRangeBtn.addEventListener("click", applyCustomYearRange);
    }
    if (dom.clearYearRangeBtn) {
        dom.clearYearRangeBtn.addEventListener("click", () => {
            clearYearRangeFilter();
            loadArticles();
        });
    }
    if (dom.yearRangeStart) {
        dom.yearRangeStart.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                applyCustomYearRange();
            }
        });
    }
    if (dom.yearRangeEnd) {
        dom.yearRangeEnd.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                applyCustomYearRange();
            }
        });
    }

    dom.cancelEditBtn.addEventListener("click", () => closeModal(dom.editModal));
    dom.saveEditBtn.addEventListener("click", saveArticleEdits);
    dom.refetchArxivBtn.addEventListener("click", refetchArxivMetadata);

    dom.cancelDeleteBtn.addEventListener("click", () => closeModal(dom.deleteModal));
    dom.confirmDeleteBtn.addEventListener("click", confirmDeleteArticle);

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        if (
            dom.quickActionMenu &&
            dom.quickActionMenu.style.display !== "none" &&
            !dom.quickActionMenu.contains(target) &&
            !target.closest(".quick-action-trigger")
        ) {
            closeQuickActionMenu();
        }

        const overlay = target.closest(".modal-overlay");
        if (overlay && target === overlay) {
            closeModal(overlay);
        }
    });
}

function initQuickActionMenu() {
    const menu = document.createElement("div");
    menu.className = "quick-action-menu";
    menu.style.display = "none";
    document.body.appendChild(menu);
    dom.quickActionMenu = menu;
}

async function refresh() {
    await Promise.all([loadCollections(), loadArticles()]);
    if (state.collectionView.selectedCollectionId) {
        await loadCollectionViewArticles(state.collectionView.selectedCollectionId);
    } else {
        renderCollectionsBrowser();
    }
}

async function loadCollections() {
    try {
        state.collections = await fetchJson("/api/collections");
        renderCollections();
        renderCollectionsBrowser();
    } catch (err) {
        toast(err.message || "Erreur chargement collections", "error");
    }
}

async function loadArticles() {
    try {
        const filteredParams = new URLSearchParams();
        if (state.filters.q) filteredParams.set("q", state.filters.q);
        if (state.filters.collection) filteredParams.set("collection", String(state.filters.collection));
        if (state.filters.status) filteredParams.set("status", state.filters.status);

        const facetParams = new URLSearchParams();
        if (state.filters.q) facetParams.set("q", state.filters.q);
        if (state.filters.collection) facetParams.set("collection", String(state.filters.collection));

        const filteredUrl = filteredParams.toString() ? `/api/articles?${filteredParams}` : "/api/articles";
        const facetUrl = facetParams.toString() ? `/api/articles?${facetParams}` : "/api/articles";

        const [filteredArticles, facetArticles] = await Promise.all([
            fetchJson(filteredUrl),
            fetchJson(facetUrl),
        ]);

        state.articles = applyYearRangeFilter(filteredArticles, state.filters.yearRange);
        state.facetArticles = facetArticles;
        dropInvalidSelections();
        renderAll();
    } catch (err) {
        toast(err.message || "Erreur chargement articles", "error");
    }
}

async function loadCollectionViewArticles(collectionId = state.collectionView.selectedCollectionId) {
    if (!collectionId) return;

    try {
        const params = new URLSearchParams();
        params.set("collection", String(collectionId));
        if (state.filters.q) params.set("q", state.filters.q);

        state.collectionView.articles = await fetchJson(`/api/articles?${params}`);
        dropInvalidSelections();
        renderCollectionArticleGrid();
    } catch (err) {
        toast(err.message || "Erreur chargement de la collection", "error");
    }
}

function renderAll() {
    applyViewMode();
    renderCollections();
    renderStatusFilters();
    renderYearFilters();
    renderGrid();
    renderCollectionArticleGrid();
    renderCollectionsBrowser();
    renderHeaderInfo();
}

function setViewMode(mode) {
    state.viewMode = mode;
    applyViewMode();

    if (mode === "collections") {
        renderCollectionsBrowser();
        if (state.collectionView.selectedCollectionId) {
            loadCollectionViewArticles();
        }
    }

    renderCollections();
}

function applyViewMode() {
    const isArticlesView = state.viewMode === "articles";

    dom.articlesViewBtn.classList.toggle("active", isArticlesView);
    dom.collectionsViewBtn.classList.toggle("active", !isArticlesView);
    dom.articlesViewSection.style.display = isArticlesView ? "block" : "none";
    dom.collectionsViewSection.style.display = isArticlesView ? "none" : "block";
    dom.statusFilterGroup.style.display = isArticlesView ? "block" : "none";
    dom.yearFilterGroup.style.display = isArticlesView ? "block" : "none";
}

function renderHeaderInfo() {
    const count = state.articles.length;
    dom.resultCount.textContent = `${count} article${count > 1 ? "s" : ""}`;
    dom.bulkBibtexBtn.textContent =
        state.selectedIds.size > 0
            ? `Exporter BibTeX sélection (${state.selectedIds.size})`
            : "Exporter BibTeX sélection";

    const parts = [];
    if (state.filters.collection) {
        const col = state.collections.find((c) => c.id === state.filters.collection);
        if (col) parts.push(`collection: ${col.name}`);
    }
    if (state.filters.status) {
        parts.push(`statut: ${statusLabels[state.filters.status] || state.filters.status}`);
    }
    if (state.filters.yearRange) {
        parts.push(`annees: ${state.filters.yearRange.label}`);
    }
    dom.activeFilterLabel.textContent = parts.length ? parts.join(" | ") : "Tous les articles";
}

function renderCollections() {
    dom.collectionList.innerHTML = "";
    const isCollectionView = state.viewMode === "collections";
    const allLabel = isCollectionView ? "Toutes les collections" : "Toutes";
    const allActive = isCollectionView
        ? state.collectionView.selectedCollectionId === null
        : state.filters.collection === null;
    const allCount = isCollectionView ? state.collections.length : state.articles.length;

    const allItem = buildSidebarItem(allLabel, allActive, allCount, () => {
        if (isCollectionView) {
            closeCollectionDetail();
            return;
        }
        state.filters.collection = null;
        loadArticles();
    });
    dom.collectionList.appendChild(allItem);

    state.collections.forEach((col) => {
        const count = isCollectionView
            ? col.article_count
            : state.articles.filter((a) => (a.collection_ids || []).includes(col.id)).length;
        const active = isCollectionView
            ? state.collectionView.selectedCollectionId === col.id
            : state.filters.collection === col.id;

        const item = buildSidebarItem(col.name, active, count, () => {
            if (isCollectionView) {
                openCollectionDetail(col.id);
                return;
            }

            state.filters.collection = col.id;
            loadArticles();
        });
        dom.collectionList.appendChild(item);
    });

    renderCollectionChecklist();
}

function renderCollectionsBrowser() {
    if (state.viewMode !== "collections") return;

    const selectedCollectionId = state.collectionView.selectedCollectionId;
    dom.collectionsBrowser.style.display = selectedCollectionId ? "none" : "block";
    dom.collectionDetailView.style.display = selectedCollectionId ? "block" : "none";

    if (selectedCollectionId) {
        const current = state.collections.find((col) => col.id === selectedCollectionId);
        dom.collectionDetailTitle.textContent = current?.name || "Collection";

        const metaParts = [];
        if (current?.description) metaParts.push(current.description);
        if (typeof current?.article_count === "number") {
            metaParts.push(`${current.article_count} article${current.article_count > 1 ? "s" : ""}`);
        }
        dom.collectionDetailMeta.textContent = metaParts.join(" | ");
        return;
    }

    const q = state.filters.q.toLowerCase();
    const visibleCollections = state.collections.filter((collection) => {
        if (!q) return true;
        const haystack = `${collection.name} ${collection.description || ""}`.toLowerCase();
        return haystack.includes(q);
    });

    dom.collectionsGrid.innerHTML = "";
    dom.collectionsEmptyState.style.display = visibleCollections.length ? "none" : "block";

    visibleCollections.forEach((collection) => {
        const card = document.createElement("article");
        card.className = "collection-card";

        const title = document.createElement("h3");
        title.textContent = collection.name;
        card.appendChild(title);

        const desc = document.createElement("p");
        desc.className = "muted";
        desc.textContent = collection.description || "Aucune description";
        card.appendChild(desc);

        const footer = document.createElement("div");
        footer.className = "collection-card-footer";

        const count = document.createElement("span");
        count.className = "count-badge";
        count.textContent = `${collection.article_count} article${collection.article_count > 1 ? "s" : ""}`;
        footer.appendChild(count);

        const openBtn = actionBtn("Ouvrir", "btn-primary", () => openCollectionDetail(collection.id));
        footer.appendChild(openBtn);

        card.addEventListener("click", () => openCollectionDetail(collection.id));
        card.appendChild(footer);

        dom.collectionsGrid.appendChild(card);
    });
}

function openCollectionDetail(collectionId) {
    state.collectionView.selectedCollectionId = collectionId;
    state.collectionView.articles = [];
    renderCollections();
    renderCollectionsBrowser();
    renderCollectionArticleGrid();
    loadCollectionViewArticles(collectionId);
}

function closeCollectionDetail() {
    state.collectionView.selectedCollectionId = null;
    state.collectionView.articles = [];
    renderCollections();
    renderCollectionsBrowser();
}

function renderStatusFilters() {
    const source = applyYearRangeFilter(state.facetArticles, state.filters.yearRange);
    const values = [
        ["to_read", "A lire"],
        ["reading", "En cours"],
        ["read", "Lu"],
        ["to_reread", "A relire"],
    ];

    dom.statusList.innerHTML = "";
    const all = buildSidebarItem("Tous", state.filters.status === null, source.length, () => {
        state.filters.status = null;
        loadArticles();
    });
    dom.statusList.appendChild(all);

    values.forEach(([value, label]) => {
        const count = source.filter((a) => a.reading_status === value).length;
        const item = buildSidebarItem(label, state.filters.status === value, count, () => {
            state.filters.status = value;
            loadArticles();
        });
        dom.statusList.appendChild(item);
    });
}

function renderYearFilters() {
    const source = state.filters.status
        ? state.facetArticles.filter((a) => a.reading_status === state.filters.status)
        : state.facetArticles;
    dom.yearList.innerHTML = "";

    const all = buildSidebarItem("Toutes", state.filters.yearRange === null, source.length, () => {
        clearYearRangeFilter();
        loadArticles();
    });
    dom.yearList.appendChild(all);

    const buckets = buildDecadeBuckets(source);
    buckets.forEach((bucket) => {
        const item = buildSidebarItem(
            bucket.label,
            isDecadeFilterActive(bucket.start, bucket.end),
            bucket.count,
            () => {
                setYearRangeFilter(bucket.start, bucket.end, bucket.label, "decade");
                loadArticles();
            }
        );
        dom.yearList.appendChild(item);
    });

    renderYearRangeInputs();
}

function setYearRangeFilter(start, end, label, kind = "custom") {
    state.filters.yearRange = {
        start,
        end,
        label,
        kind,
    };
}

function clearYearRangeFilter() {
    state.filters.yearRange = null;
    renderYearRangeInputs();
}

function applyCustomYearRange() {
    const startRaw = dom.yearRangeStart ? dom.yearRangeStart.value.trim() : "";
    const endRaw = dom.yearRangeEnd ? dom.yearRangeEnd.value.trim() : "";

    if (!startRaw && !endRaw) {
        clearYearRangeFilter();
        loadArticles();
        return;
    }

    if (!startRaw || !endRaw) {
        toast("Saisissez une plage complete: annee debut et annee fin", "error");
        return;
    }

    let start = Number(startRaw);
    let end = Number(endRaw);
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
        toast("Les annees doivent etre des nombres entiers", "error");
        return;
    }

    if (start > end) {
        const tmp = start;
        start = end;
        end = tmp;
    }

    setYearRangeFilter(start, end, `${start}-${end}`, "custom");
    loadArticles();
}

function applyYearRangeFilter(articles, range) {
    if (!range) return articles;
    return articles.filter((article) => {
        if (typeof article.year !== "number") return false;
        return article.year >= range.start && article.year <= range.end;
    });
}

function buildDecadeBuckets(articles) {
    const counts = new Map();
    articles.forEach((article) => {
        if (typeof article.year !== "number") return;
        const start = Math.floor(article.year / 10) * 10;
        counts.set(start, (counts.get(start) || 0) + 1);
    });

    return [...counts.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([start, count]) => ({
            start,
            end: start + 9,
            label: `${start}-${start + 9}`,
            count,
        }));
}

function isDecadeFilterActive(start, end) {
    const range = state.filters.yearRange;
    return Boolean(range && range.kind === "decade" && range.start === start && range.end === end);
}

function renderYearRangeInputs() {
    if (!dom.yearRangeStart || !dom.yearRangeEnd) return;
    if (!state.filters.yearRange) {
        dom.yearRangeStart.value = "";
        dom.yearRangeEnd.value = "";
        return;
    }

    dom.yearRangeStart.value = String(state.filters.yearRange.start);
    dom.yearRangeEnd.value = String(state.filters.yearRange.end);
}

function buildSidebarItem(label, active, count, onClick) {
    const li = document.createElement("li");
    if (active) li.classList.add("active");
    const title = document.createElement("span");
    title.textContent = label;
    const c = document.createElement("span");
    c.className = "count";
    c.textContent = String(count ?? 0);
    li.appendChild(title);
    li.appendChild(c);
    li.addEventListener("click", onClick);
    return li;
}

function renderGrid() {
    closeQuickActionMenu();
    dom.articleGrid.innerHTML = "";

    if (state.articles.length === 0) {
        dom.emptyState.style.display = "block";
        return;
    }
    dom.emptyState.style.display = "none";

    state.articles.forEach((article) => {
        dom.articleGrid.appendChild(buildArticleCard(article));
    });
}

function renderCollectionArticleGrid() {
    closeQuickActionMenu();
    if (state.viewMode !== "collections" || !state.collectionView.selectedCollectionId) {
        dom.collectionArticleGrid.innerHTML = "";
        dom.collectionArticlesEmptyState.style.display = "none";
        return;
    }

    dom.collectionArticleGrid.innerHTML = "";

    if (state.collectionView.articles.length === 0) {
        dom.collectionArticlesEmptyState.style.display = "block";
        return;
    }

    dom.collectionArticlesEmptyState.style.display = "none";
    state.collectionView.articles.forEach((article) => {
        dom.collectionArticleGrid.appendChild(buildArticleCard(article));
    });
}

function buildArticleCard(article) {
    const card = document.createElement("article");
    card.className = "article-card";
    if (state.selectedIds.has(article.id)) card.classList.add("selected");

    const select = document.createElement("button");
    select.className = "select-toggle";
    select.type = "button";
    select.title = "Selectionner";
    select.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSelected(article.id);
        card.classList.toggle("selected", state.selectedIds.has(article.id));
        renderHeaderInfo();
    });
    card.appendChild(select);

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = article.title || "Sans titre";
    card.appendChild(title);

    const authors = document.createElement("div");
    authors.className = "authors";
    authors.textContent = (article.authors || []).join(", ") || "Auteur inconnu";
    card.appendChild(authors);

    const meta = document.createElement("div");
    meta.className = "meta";
    const yearBadge = badge(article.year ? String(article.year) : "n.d.");
    const statusBadge = badge(statusLabels[article.reading_status] || "statut n/a");
    meta.appendChild(yearBadge);
    meta.appendChild(statusBadge);
    if (article.discipline) meta.appendChild(badge(article.discipline));
    if (article.arxiv_id) meta.appendChild(badge(`arXiv ${article.arxiv_id}`));
    card.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "actions";

    const rowPrimary = document.createElement("div");
    rowPrimary.className = "actions-row";

    rowPrimary.appendChild(actionBtn("Lire", "btn-primary", () => {
        window.location.href = `/read/${article.id}`;
    }));

    rowPrimary.appendChild(quickActionBtn(
        "Statut",
        "is-status",
        (button) => openQuickActionMenu(button, "status", article.id)
    ));

    rowPrimary.appendChild(quickActionBtn(
        "Collections",
        "is-collections",
        (button) => openQuickActionMenu(button, "collections", article.id)
    ));

    actions.appendChild(rowPrimary);

    const rowReference = document.createElement("div");
    rowReference.className = "actions-row";

    rowReference.appendChild(actionBtn("BibTeX", "btn-secondary", () => {
        window.location.href = `/api/articles/${article.id}/bibtex`;
    }));

    if (article.arxiv_id && window.ARXIVISUAL_TEMPLATE) {
        rowReference.appendChild(actionBtn("arxivisual", "btn-secondary", () => {
            const url = window.ARXIVISUAL_TEMPLATE.replace("{id}", article.arxiv_id);
            window.open(url, "_blank", "noopener,noreferrer");
        }));
    }

    actions.appendChild(rowReference);

    const rowAdmin = document.createElement("div");
    rowAdmin.className = "actions-row";

    rowAdmin.appendChild(actionBtn("Editer", "btn-secondary", () => {
        openEditModal(article);
    }));

    rowAdmin.appendChild(actionBtn("Supprimer", "btn-danger", () => {
        state.deletingArticleId = article.id;
        dom.deleteLabel.textContent = article.title || "(sans titre)";
        openModal(dom.deleteModal);
    }));

    actions.appendChild(rowAdmin);

    card.appendChild(actions);
    card.addEventListener("dblclick", () => {
        window.location.href = `/read/${article.id}`;
    });

    return card;
}

function badge(text) {
    const span = document.createElement("span");
    span.className = "badge";
    span.textContent = text;
    return span;
}

function actionBtn(label, cls, onClick) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm ${cls}`;
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", (event) => {
        event.stopPropagation();
        onClick();
    });
    return btn;
}

function quickActionBtn(label, variantClass, onClick) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm btn-secondary quick-action-trigger ${variantClass || ""}`.trim();
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", (event) => {
        event.stopPropagation();
        onClick(btn);
    });
    return btn;
}

function openQuickActionMenu(anchor, type, articleId) {
    if (!dom.quickActionMenu) return;

    const alreadyOpen =
        dom.quickActionMenu.style.display !== "none" &&
        state.quickMenu.type === type &&
        state.quickMenu.articleId === articleId;

    if (alreadyOpen) {
        closeQuickActionMenu();
        return;
    }

    state.quickMenu.type = type;
    state.quickMenu.articleId = articleId;
    renderQuickActionMenu();
    dom.quickActionMenu.style.display = "block";
    positionQuickActionMenu(anchor);
}

function closeQuickActionMenu() {
    if (!dom.quickActionMenu) return;
    dom.quickActionMenu.style.display = "none";
    dom.quickActionMenu.innerHTML = "";
    state.quickMenu.type = null;
    state.quickMenu.articleId = null;
}

function positionQuickActionMenu(anchor) {
    if (!dom.quickActionMenu) return;
    const rect = anchor.getBoundingClientRect();
    const menu = dom.quickActionMenu;
    const top = rect.bottom + 8;
    const maxLeft = window.innerWidth - menu.offsetWidth - 12;
    const left = Math.min(rect.left, maxLeft);
    menu.style.top = `${Math.max(12, top)}px`;
    menu.style.left = `${Math.max(12, left)}px`;
}

function getArticleById(articleId) {
    return (
        state.articles.find((article) => article.id === articleId) ||
        state.collectionView.articles.find((article) => article.id === articleId) ||
        null
    );
}

function renderQuickActionMenu() {
    if (!dom.quickActionMenu || !state.quickMenu.type || !state.quickMenu.articleId) return;

    const article = getArticleById(state.quickMenu.articleId);
    if (!article) {
        closeQuickActionMenu();
        return;
    }

    dom.quickActionMenu.innerHTML = "";

    const title = document.createElement("div");
    title.className = "quick-menu-title";
    title.textContent = state.quickMenu.type === "status" ? "Changer le statut" : "Collections";
    dom.quickActionMenu.appendChild(title);

    if (state.quickMenu.type === "status") {
        statusOptions.forEach((status) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `quick-menu-item ${article.reading_status === status ? "active" : ""}`.trim();
            button.textContent = statusLabels[status] || status;
            button.addEventListener("click", async (event) => {
                event.stopPropagation();
                await setArticleStatusQuick(article.id, status);
            });
            dom.quickActionMenu.appendChild(button);
        });
        return;
    }

    if (!state.collections.length) {
        const empty = document.createElement("div");
        empty.className = "quick-menu-empty";
        empty.textContent = "Aucune collection";
        dom.quickActionMenu.appendChild(empty);
        return;
    }

    const assigned = new Set(article.collection_ids || []);
    state.collections.forEach((collection) => {
        const isAssigned = assigned.has(collection.id);
        const button = document.createElement("button");
        button.type = "button";
        button.className = `quick-menu-item ${isAssigned ? "active" : ""}`.trim();
        button.textContent = `${isAssigned ? "✓ " : ""}${collection.name}`;
        button.addEventListener("click", async (event) => {
            event.stopPropagation();
            await toggleArticleCollectionQuick(article.id, collection.id, isAssigned);
        });
        dom.quickActionMenu.appendChild(button);
    });
}

async function setArticleStatusQuick(articleId, readingStatus) {
    try {
        const response = await fetch(`/api/articles/${articleId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reading_status: readingStatus }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Mise a jour du statut impossible");
        }

        closeQuickActionMenu();
        toast("Statut mis a jour", "success");
        await refresh();
    } catch (err) {
        toast(err.message || "Mise a jour du statut impossible", "error");
    }
}

async function toggleArticleCollectionQuick(articleId, collectionId, isAssigned) {
    try {
        const response = await fetch(
            isAssigned
                ? `/api/collections/${collectionId}/articles/${articleId}`
                : `/api/collections/${collectionId}/articles`,
            isAssigned
                ? { method: "DELETE" }
                : {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ article_id: articleId }),
                }
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Mise a jour des collections impossible");
        }

        closeQuickActionMenu();
        toast(isAssigned ? "Retire de la collection" : "Ajoute a la collection", "success");
        await refresh();
    } catch (err) {
        toast(err.message || "Mise a jour des collections impossible", "error");
    }
}

function toggleSelected(id) {
    if (state.selectedIds.has(id)) {
        state.selectedIds.delete(id);
    } else {
        state.selectedIds.add(id);
    }
}

function dropInvalidSelections() {
    const valid = new Set([
        ...state.articles.map((a) => a.id),
        ...state.collectionView.articles.map((a) => a.id),
    ]);
    for (const id of [...state.selectedIds]) {
        if (!valid.has(id)) state.selectedIds.delete(id);
    }
}

async function uploadArticle() {
    const file = dom.uploadFile.files[0];
    const arxiv = dom.uploadArxiv.value.trim();

    if (!file && !arxiv) {
        toast("Selectionnez un PDF ou renseignez une URL/ID arXiv", "error");
        return;
    }

    const form = new FormData();
    if (file) {
        form.append("file", file);
    }
    if (arxiv) {
        form.append("arxiv", arxiv);
    }

    try {
        const response = await fetch("/api/articles", { method: "POST", body: form });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.error || "Echec du televersement");
        }

        closeModal(dom.uploadModal);
        dom.uploadFile.value = "";
        dom.uploadArxiv.value = "";
        toast("Article ajoute", "success");
        await refresh();
    } catch (err) {
        toast(err.message || "Echec du televersement", "error");
    }
}

function openEditModal(article) {
    state.editingArticleId = article.id;
    dom.editTitle.value = article.title || "";
    dom.editAuthors.value = (article.authors || []).join(", ");
    dom.editAbstract.value = article.abstract || "";
    dom.editYear.value = article.year || "";
    dom.editStatus.value = article.reading_status || "to_read";
    dom.editDiscipline.value = article.discipline || "";
    dom.editDoi.value = article.doi || "";
    dom.editJournal.value = article.journal || "";
    dom.editVenue.value = article.venue || "";
    dom.editKeywords.value = (article.keywords || []).join(", ");
    dom.editArxiv.value = article.arxiv_id || "";
    renderCollectionChecklist(article.collection_ids || []);
    openModal(dom.editModal);
}

function renderCollectionChecklist(selectedIds = []) {
    dom.editCollections.innerHTML = "";
    if (!state.collections.length) {
        const p = document.createElement("p");
        p.className = "muted";
        p.textContent = "Aucune collection";
        dom.editCollections.appendChild(p);
        return;
    }

    state.collections.forEach((collection) => {
        const label = document.createElement("label");
        label.className = "checkbox-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = String(collection.id);
        checkbox.checked = selectedIds.includes(collection.id);

        const text = document.createElement("span");
        text.textContent = collection.name;

        label.appendChild(checkbox);
        label.appendChild(text);
        dom.editCollections.appendChild(label);
    });
}

async function saveArticleEdits() {
    if (!state.editingArticleId) return;

    const payload = {
        title: dom.editTitle.value.trim(),
        authors: splitList(dom.editAuthors.value),
        abstract: dom.editAbstract.value.trim() || null,
        year: dom.editYear.value ? Number(dom.editYear.value) : null,
        reading_status: dom.editStatus.value,
        discipline: dom.editDiscipline.value.trim() || null,
        doi: dom.editDoi.value.trim() || null,
        journal: dom.editJournal.value.trim() || null,
        venue: dom.editVenue.value.trim() || null,
        keywords: splitList(dom.editKeywords.value),
        collection_ids: getSelectedCollectionIds(),
    };

    try {
        const response = await fetch(`/api/articles/${state.editingArticleId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Echec mise a jour");
        }
        closeModal(dom.editModal);
        toast("Metadonnees mises a jour", "success");
        await refresh();
    } catch (err) {
        toast(err.message || "Echec mise a jour", "error");
    }
}

async function refetchArxivMetadata() {
    if (!state.editingArticleId) return;
    const arxiv = dom.editArxiv.value.trim();
    if (!arxiv) {
        toast("Renseignez un ID ou URL arXiv", "error");
        return;
    }

    try {
        const response = await fetch(`/api/articles/${state.editingArticleId}/fetch-arxiv`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ arxiv }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Echec re-fetch arXiv");
        }
        toast("Metadonnees arXiv mises a jour", "success");
        openEditModal(data);
        await refresh();
    } catch (err) {
        toast(err.message || "Echec re-fetch arXiv", "error");
    }
}

async function confirmDeleteArticle() {
    if (!state.deletingArticleId) return;
    try {
        const response = await fetch(`/api/articles/${state.deletingArticleId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Suppression impossible");
        }
        closeModal(dom.deleteModal);
        state.deletingArticleId = null;
        toast("Article supprime", "success");
        await refresh();
    } catch (err) {
        toast(err.message || "Suppression impossible", "error");
    }
}

async function exportBulkBibtex() {
    if (state.selectedIds.size === 0) {
        toast("Selectionnez au moins un article", "error");
        return;
    }

    try {
        const response = await fetch("/api/articles/bibtex-bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [...state.selectedIds] }),
        });

        if (!response.ok) {
            const payload = await response.json();
            throw new Error(payload.error || "Export BibTeX impossible");
        }

        await downloadBlob(response, "library.bib");
        toast("Export BibTeX termine", "success");
    } catch (err) {
        toast(err.message || "Export BibTeX impossible", "error");
    }
}

async function createCollection() {
    const name = dom.newCollectionName.value.trim();
    if (!name) {
        toast("Nom de collection requis", "error");
        return;
    }

    const description = dom.newCollectionDescription.value.trim();

    try {
        const response = await fetch("/api/collections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Creation impossible");
        }

        dom.newCollectionName.value = "";
        dom.newCollectionDescription.value = "";
        toast("Collection creee", "success");
        await refresh();
        if (state.editingArticleId) {
            const current = state.articles.find((a) => a.id === state.editingArticleId);
            if (current) renderCollectionChecklist(current.collection_ids || []);
        }
    } catch (err) {
        toast(err.message || "Creation impossible", "error");
    }
}

function getSelectedCollectionIds() {
    const ids = [];
    dom.editCollections.querySelectorAll("input[type='checkbox']").forEach((box) => {
        if (box.checked) ids.push(Number(box.value));
    });
    return ids;
}

function splitList(value) {
    return value
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
}

function openModal(el) {
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
}

function closeModal(el) {
    el.classList.remove("open");
    el.setAttribute("aria-hidden", "true");
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Erreur API");
    }
    return data;
}

async function downloadBlob(response, fallbackName) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;

    const contentDisposition = response.headers.get("Content-Disposition") || "";
    const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
    anchor.download = fileNameMatch ? fileNameMatch[1] : fallbackName;
    anchor.click();
    URL.revokeObjectURL(url);
}

function toast(message, type = "success") {
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.textContent = message;
    document.body.appendChild(node);
    requestAnimationFrame(() => node.classList.add("show"));
    setTimeout(() => {
        node.classList.remove("show");
        setTimeout(() => node.remove(), 200);
    }, 2600);
}
