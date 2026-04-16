const LANG_STORAGE_KEY = "siteLang";
const SUPPORTED_LANGS = new Set(["fr", "en"]);

const translations = {
    fr: {
        appLogo: "Research Library",
        libraryPageTitle: "Bibliothèque scientifique",
        searchPlaceholder: "Rechercher (titre, auteurs, DOI, arXiv, texte intégral)...",
        viewArticles: "Vue articles",
        viewCollections: "Vue collections",
        addArticle: "Ajouter un article",
        exportSelected: "Exporter BibTeX sélection",
        resetFilters: "Réinitialiser filtres",
        collections: "Collections",
        newCollection: "Nouvelle collection",
        newCollectionOptionalDescription: "Description (optionnel)",
        create: "Créer",
        readingStatus: "Statut de lecture",
        years: "Années",
        yearFrom: "De",
        yearTo: "A",
        apply: "Appliquer",
        clear: "Effacer",
        allArticles: "Tous les articles",
        noArticles: "Aucun article",
        emptyArticlesHint: "Ajoutez un PDF et, optionnellement, une URL/ID arXiv pour auto-remplir les métadonnées.",
        noCollections: "Aucune collection",
        noCollectionsHint: "Créez une collection depuis la barre latérale pour organiser votre bibliothèque.",
        backToCollections: "Retour aux collections",
        collectionDefaultTitle: "Collection",
        noArticleInCollection: "Aucun article dans cette collection",
        noArticleInCollectionHint: "Ajoutez des articles à cette collection via l'édition d'un article.",
        uploadArticleTitle: "Ajouter un article",
        uploadPdfLabel: "Fichier PDF (optionnel)",
        uploadArxivLabel: "URL/ID arXiv (optionnel)",
        uploadArxivHint: "Sans PDF, l'application télécharge automatiquement le PDF depuis arXiv et remplit les métadonnées bibliographiques.",
        cancel: "Annuler",
        editArticle: "Modifier l'article",
        title: "Titre",
        authorsCsv: "Auteurs (séparés par virgule)",
        abstract: "Résumé",
        year: "Année",
        status: "Statut",
        discipline: "Discipline",
        doi: "DOI",
        journal: "Journal",
        venue: "Venue",
        keywordsCsv: "Mots-clés (séparés par virgule)",
        arxivRefetch: "arXiv ID/URL (pour re-fetch)",
        refetchArxiv: "Re-fetch arXiv",
        save: "Enregistrer",
        deleteConfirmTitle: "Supprimer cet article ?",
        delete: "Supprimer",
        read: "Lire",
        edit: "Editer",
        open: "Ouvrir",
        select: "Selectionner",
        unknownAuthor: "Auteur inconnu",
        untitled: "Sans titre",
        statusNA: "statut n/a",
        statusToRead: "A lire",
        statusReading: "En cours",
        statusRead: "Lu",
        statusReread: "A relire",
        all: "Tous",
        allFeminine: "Toutes",
        allCollectionsLabel: "Toutes les collections",
        noDescription: "Aucune description",
        chooseStatus: "Changer le statut",
        noCollectionAvailable: "Aucune collection",
        resultLabelArticle: "article",
        resultLabelArticles: "articles",
        filteredCollection: "collection",
        filteredStatus: "statut",
        filteredYears: "annees",
        toastLoadCollectionsError: "Erreur chargement collections",
        toastLoadArticlesError: "Erreur chargement articles",
        toastLoadCollectionArticlesError: "Erreur chargement de la collection",
        toastYearRangeIncomplete: "Saisissez une plage complete: annee debut et annee fin",
        toastYearRangeInvalid: "Les annees doivent etre des nombres entiers",
        toastStatusUpdateFailed: "Mise a jour du statut impossible",
        toastStatusUpdated: "Statut mis a jour",
        toastCollectionsUpdateFailed: "Mise a jour des collections impossible",
        toastCollectionRemoved: "Retire de la collection",
        toastCollectionAdded: "Ajoute a la collection",
        toastUploadNeedInput: "Selectionnez un PDF ou renseignez une URL/ID arXiv",
        toastUploadFailed: "Echec du televersement",
        toastUploadSuccess: "Article ajoute",
        toastArxivRequired: "Renseignez un ID ou URL arXiv",
        toastArxivRefetchFailed: "Echec re-fetch arXiv",
        toastArxivRefetchSuccess: "Metadonnees arXiv mises a jour",
        toastUpdateFailed: "Echec mise a jour",
        toastUpdateSuccess: "Metadonnees mises a jour",
        toastDeleteFailed: "Suppression impossible",
        toastDeleteSuccess: "Article supprime",
        toastNeedSelection: "Selectionnez au moins un article",
        toastExportFailed: "Export BibTeX impossible",
        toastExportSuccess: "Export BibTeX termine",
        toastCollectionNameRequired: "Nom de collection requis",
        toastCollectionCreateFailed: "Creation impossible",
        toastCollectionCreateSuccess: "Collection creee",
        apiError: "Erreur API",
    },
    en: {
        appLogo: "Research Library",
        libraryPageTitle: "Scientific library",
        searchPlaceholder: "Search (title, authors, DOI, arXiv, full text)...",
        viewArticles: "Articles view",
        viewCollections: "Collections view",
        addArticle: "Add article",
        exportSelected: "Export selected BibTeX",
        resetFilters: "Reset filters",
        collections: "Collections",
        newCollection: "New collection",
        newCollectionOptionalDescription: "Description (optional)",
        create: "Create",
        readingStatus: "Reading status",
        years: "Years",
        yearFrom: "From",
        yearTo: "To",
        apply: "Apply",
        clear: "Clear",
        allArticles: "All articles",
        noArticles: "No articles",
        emptyArticlesHint: "Add a PDF and optionally an arXiv URL/ID to auto-fill metadata.",
        noCollections: "No collections",
        noCollectionsHint: "Create a collection from the sidebar to organize your library.",
        backToCollections: "Back to collections",
        collectionDefaultTitle: "Collection",
        noArticleInCollection: "No articles in this collection",
        noArticleInCollectionHint: "Add articles to this collection using article editing.",
        uploadArticleTitle: "Add article",
        uploadPdfLabel: "PDF file (optional)",
        uploadArxivLabel: "arXiv URL/ID (optional)",
        uploadArxivHint: "Without a PDF, the app automatically downloads the PDF from arXiv and fills bibliographic metadata.",
        cancel: "Cancel",
        editArticle: "Edit article",
        title: "Title",
        authorsCsv: "Authors (comma-separated)",
        abstract: "Abstract",
        year: "Year",
        status: "Status",
        discipline: "Discipline",
        doi: "DOI",
        journal: "Journal",
        venue: "Venue",
        keywordsCsv: "Keywords (comma-separated)",
        arxivRefetch: "arXiv ID/URL (for re-fetch)",
        refetchArxiv: "Re-fetch arXiv",
        save: "Save",
        deleteConfirmTitle: "Delete this article?",
        delete: "Delete",
        read: "Read",
        edit: "Edit",
        open: "Open",
        select: "Select",
        unknownAuthor: "Unknown author",
        untitled: "Untitled",
        statusNA: "status n/a",
        statusToRead: "To read",
        statusReading: "Reading",
        statusRead: "Read",
        statusReread: "To reread",
        all: "All",
        allFeminine: "All",
        allCollectionsLabel: "All collections",
        noDescription: "No description",
        chooseStatus: "Change status",
        noCollectionAvailable: "No collections",
        resultLabelArticle: "article",
        resultLabelArticles: "articles",
        filteredCollection: "collection",
        filteredStatus: "status",
        filteredYears: "years",
        toastLoadCollectionsError: "Error loading collections",
        toastLoadArticlesError: "Error loading articles",
        toastLoadCollectionArticlesError: "Error loading collection articles",
        toastYearRangeIncomplete: "Please provide a complete range: start year and end year",
        toastYearRangeInvalid: "Years must be integer numbers",
        toastStatusUpdateFailed: "Unable to update status",
        toastStatusUpdated: "Status updated",
        toastCollectionsUpdateFailed: "Unable to update collections",
        toastCollectionRemoved: "Removed from collection",
        toastCollectionAdded: "Added to collection",
        toastUploadNeedInput: "Select a PDF or provide an arXiv URL/ID",
        toastUploadFailed: "Upload failed",
        toastUploadSuccess: "Article added",
        toastArxivRequired: "Provide an arXiv ID or URL",
        toastArxivRefetchFailed: "arXiv re-fetch failed",
        toastArxivRefetchSuccess: "arXiv metadata updated",
        toastUpdateFailed: "Update failed",
        toastUpdateSuccess: "Metadata updated",
        toastDeleteFailed: "Delete failed",
        toastDeleteSuccess: "Article deleted",
        toastNeedSelection: "Select at least one article",
        toastExportFailed: "BibTeX export failed",
        toastExportSuccess: "BibTeX export completed",
        toastCollectionNameRequired: "Collection name is required",
        toastCollectionCreateFailed: "Unable to create collection",
        toastCollectionCreateSuccess: "Collection created",
        apiError: "API error",
    },
};

function getStoredLanguage() {
    try {
        const value = localStorage.getItem(LANG_STORAGE_KEY);
        return SUPPORTED_LANGS.has(value) ? value : "fr";
    } catch {
        return "fr";
    }
}

const currentLanguage = getStoredLanguage();

function t(key, fallback = "") {
    return translations[currentLanguage][key] ?? fallback;
}

const statusLabels = {
    to_read: t("statusToRead", "To read"),
    reading: t("statusReading", "Reading"),
    read: t("statusRead", "Read"),
    to_reread: t("statusReread", "To reread"),
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
    langFrBtn: document.getElementById("langFrBtn"),
    langEnBtn: document.getElementById("langEnBtn"),
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
    applyStaticTranslations();
    highlightActiveLanguage();
    initQuickActionMenu();
    bindEvents();
    applyViewMode();
    refresh();
}

function setLanguage(lang) {
    if (!SUPPORTED_LANGS.has(lang)) return;
    try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
        // Ignore storage failures and still reload.
    }
    window.location.reload();
}

function highlightActiveLanguage() {
    if (dom.langFrBtn) dom.langFrBtn.classList.toggle("active", currentLanguage === "fr");
    if (dom.langEnBtn) dom.langEnBtn.classList.toggle("active", currentLanguage === "en");
}

function applyStaticTranslations() {
    document.documentElement.lang = currentLanguage;
    document.title = t("libraryPageTitle", document.title);

    const appLogo = document.querySelector(".app-logo");
    if (appLogo) appLogo.textContent = t("appLogo", "Research Library");

    dom.searchInput.placeholder = t("searchPlaceholder", dom.searchInput.placeholder);
    dom.articlesViewBtn.textContent = t("viewArticles", dom.articlesViewBtn.textContent);
    dom.collectionsViewBtn.textContent = t("viewCollections", dom.collectionsViewBtn.textContent);
    dom.uploadBtn.textContent = t("addArticle", dom.uploadBtn.textContent);
    dom.bulkBibtexBtn.textContent = t("exportSelected", dom.bulkBibtexBtn.textContent);
    dom.clearFiltersBtn.textContent = t("resetFilters", dom.clearFiltersBtn.textContent);
    dom.createCollectionBtn.textContent = t("create", dom.createCollectionBtn.textContent);
    dom.newCollectionName.placeholder = t("newCollection", dom.newCollectionName.placeholder);
    dom.newCollectionDescription.placeholder = t(
        "newCollectionOptionalDescription",
        dom.newCollectionDescription.placeholder
    );
    dom.applyYearRangeBtn.textContent = t("apply", dom.applyYearRangeBtn.textContent);
    dom.clearYearRangeBtn.textContent = t("clear", dom.clearYearRangeBtn.textContent);
    dom.yearRangeStart.placeholder = t("yearFrom", dom.yearRangeStart.placeholder);
    dom.yearRangeEnd.placeholder = t("yearTo", dom.yearRangeEnd.placeholder);

    const statusTitle = document.querySelector("#statusFilterGroup h3");
    if (statusTitle) statusTitle.textContent = t("readingStatus", statusTitle.textContent);
    const yearsTitle = document.querySelector("#yearFilterGroup h3");
    if (yearsTitle) yearsTitle.textContent = t("years", yearsTitle.textContent);
    const collectionsTitle = document.querySelector(".sidebar h3");
    if (collectionsTitle) collectionsTitle.textContent = t("collections", collectionsTitle.textContent);
    if (dom.backToCollectionsBtn) {
        dom.backToCollectionsBtn.textContent = t("backToCollections", dom.backToCollectionsBtn.textContent);
    }

    const emptyStateTitle = document.querySelector("#emptyState h2");
    if (emptyStateTitle) emptyStateTitle.textContent = t("noArticles", emptyStateTitle.textContent);
    const emptyStateHint = document.querySelector("#emptyState p");
    if (emptyStateHint) emptyStateHint.textContent = t("emptyArticlesHint", emptyStateHint.textContent);

    const collectionsEmptyTitle = document.querySelector("#collectionsEmptyState h2");
    if (collectionsEmptyTitle) collectionsEmptyTitle.textContent = t("noCollections", collectionsEmptyTitle.textContent);
    const collectionsEmptyHint = document.querySelector("#collectionsEmptyState p");
    if (collectionsEmptyHint) collectionsEmptyHint.textContent = t("noCollectionsHint", collectionsEmptyHint.textContent);

    const collectionArticlesEmptyTitle = document.querySelector("#collectionArticlesEmptyState h2");
    if (collectionArticlesEmptyTitle) {
        collectionArticlesEmptyTitle.textContent = t("noArticleInCollection", collectionArticlesEmptyTitle.textContent);
    }
    const collectionArticlesEmptyHint = document.querySelector("#collectionArticlesEmptyState p");
    if (collectionArticlesEmptyHint) {
        collectionArticlesEmptyHint.textContent = t(
            "noArticleInCollectionHint",
            collectionArticlesEmptyHint.textContent
        );
    }

    const uploadModalTitle = document.querySelector("#uploadModal h2");
    if (uploadModalTitle) uploadModalTitle.textContent = t("uploadArticleTitle", uploadModalTitle.textContent);
    const editModalTitle = document.querySelector("#editModal h2");
    if (editModalTitle) editModalTitle.textContent = t("editArticle", editModalTitle.textContent);
    const deleteModalTitle = document.querySelector("#deleteModal h2");
    if (deleteModalTitle) deleteModalTitle.textContent = t("deleteConfirmTitle", deleteModalTitle.textContent);

    const uploadFileLabel = document.querySelector("label[for='uploadFile']");
    if (uploadFileLabel) uploadFileLabel.textContent = t("uploadPdfLabel", uploadFileLabel.textContent);
    const uploadArxivLabel = document.querySelector("label[for='uploadArxiv']");
    if (uploadArxivLabel) uploadArxivLabel.textContent = t("uploadArxivLabel", uploadArxivLabel.textContent);
    const uploadHint = document.querySelector("#uploadArxiv + p");
    if (uploadHint) uploadHint.textContent = t("uploadArxivHint", uploadHint.textContent);

    const labelMap = [
        ["editTitle", "title"],
        ["editAuthors", "authorsCsv"],
        ["editAbstract", "abstract"],
        ["editYear", "year"],
        ["editStatus", "status"],
        ["editDiscipline", "discipline"],
        ["editDoi", "doi"],
        ["editJournal", "journal"],
        ["editVenue", "venue"],
        ["editKeywords", "keywordsCsv"],
        ["editArxiv", "arxivRefetch"],
    ];
    labelMap.forEach(([forId, key]) => {
        const label = document.querySelector(`label[for='${forId}']`);
        if (label) label.textContent = t(key, label.textContent);
    });

    dom.refetchArxivBtn.textContent = t("refetchArxiv", dom.refetchArxivBtn.textContent);
    dom.cancelUploadBtn.textContent = t("cancel", dom.cancelUploadBtn.textContent);
    dom.confirmUploadBtn.textContent = t("addArticle", dom.confirmUploadBtn.textContent);
    dom.cancelEditBtn.textContent = t("cancel", dom.cancelEditBtn.textContent);
    dom.saveEditBtn.textContent = t("save", dom.saveEditBtn.textContent);
    dom.cancelDeleteBtn.textContent = t("cancel", dom.cancelDeleteBtn.textContent);
    dom.confirmDeleteBtn.textContent = t("delete", dom.confirmDeleteBtn.textContent);

    const editCollectionsLabel = dom.editCollections?.closest(".form-row")?.querySelector("label");
    if (editCollectionsLabel) {
        editCollectionsLabel.textContent = t("collections", editCollectionsLabel.textContent);
    }

    const statusSelect = dom.editStatus;
    if (statusSelect && statusSelect.options.length >= 4) {
        statusSelect.options[0].text = t("statusToRead", statusSelect.options[0].text);
        statusSelect.options[1].text = t("statusReading", statusSelect.options[1].text);
        statusSelect.options[2].text = t("statusRead", statusSelect.options[2].text);
        statusSelect.options[3].text = t("statusReread", statusSelect.options[3].text);
    }

    dom.activeFilterLabel.textContent = t("allArticles", dom.activeFilterLabel.textContent);
}

function bindEvents() {
    let searchTimer;

    if (dom.langFrBtn) dom.langFrBtn.addEventListener("click", () => setLanguage("fr"));
    if (dom.langEnBtn) dom.langEnBtn.addEventListener("click", () => setLanguage("en"));

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
        toast(err.message || t("toastLoadCollectionsError", "Error loading collections"), "error");
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
        toast(err.message || t("toastLoadArticlesError", "Error loading articles"), "error");
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
        toast(err.message || t("toastLoadCollectionArticlesError", "Error loading collection articles"), "error");
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
    dom.resultCount.textContent = `${count} ${count > 1 ? t("resultLabelArticles", "articles") : t("resultLabelArticle", "article")}`;
    dom.bulkBibtexBtn.textContent =
        state.selectedIds.size > 0
            ? `${t("exportSelected", "Export selected BibTeX")} (${state.selectedIds.size})`
            : t("exportSelected", "Export selected BibTeX");

    const parts = [];
    if (state.filters.collection) {
        const col = state.collections.find((c) => c.id === state.filters.collection);
        if (col) parts.push(`${t("filteredCollection", "collection")}: ${col.name}`);
    }
    if (state.filters.status) {
        parts.push(`${t("filteredStatus", "status")}: ${statusLabels[state.filters.status] || state.filters.status}`);
    }
    if (state.filters.yearRange) {
        parts.push(`${t("filteredYears", "years")}: ${state.filters.yearRange.label}`);
    }
    dom.activeFilterLabel.textContent = parts.length ? parts.join(" | ") : t("allArticles", "All articles");
}

function renderCollections() {
    dom.collectionList.innerHTML = "";
    const isCollectionView = state.viewMode === "collections";
    const allLabel = isCollectionView ? t("allCollectionsLabel", "All collections") : t("allFeminine", "All");
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
        dom.collectionDetailTitle.textContent = current?.name || t("collectionDefaultTitle", "Collection");

        const metaParts = [];
        if (current?.description) metaParts.push(current.description);
        if (typeof current?.article_count === "number") {
            metaParts.push(`${current.article_count} ${current.article_count > 1 ? t("resultLabelArticles", "articles") : t("resultLabelArticle", "article")}`);
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
        desc.textContent = collection.description || t("noDescription", "No description");
        card.appendChild(desc);

        const footer = document.createElement("div");
        footer.className = "collection-card-footer";

        const count = document.createElement("span");
        count.className = "count-badge";
        count.textContent = `${collection.article_count} ${collection.article_count > 1 ? t("resultLabelArticles", "articles") : t("resultLabelArticle", "article")}`;
        footer.appendChild(count);

        const openBtn = actionBtn(t("open", "Open"), "btn-primary", () => openCollectionDetail(collection.id));
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
        ["to_read", t("statusToRead", "To read")],
        ["reading", t("statusReading", "Reading")],
        ["read", t("statusRead", "Read")],
        ["to_reread", t("statusReread", "To reread")],
    ];

    dom.statusList.innerHTML = "";
    const all = buildSidebarItem(t("all", "All"), state.filters.status === null, source.length, () => {
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

    const all = buildSidebarItem(t("allFeminine", "All"), state.filters.yearRange === null, source.length, () => {
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
        toast(t("toastYearRangeIncomplete", "Please provide a complete range: start year and end year"), "error");
        return;
    }

    let start = Number(startRaw);
    let end = Number(endRaw);
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
        toast(t("toastYearRangeInvalid", "Years must be integer numbers"), "error");
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
    select.title = t("select", "Select");
    select.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSelected(article.id);
        card.classList.toggle("selected", state.selectedIds.has(article.id));
        renderHeaderInfo();
    });
    card.appendChild(select);

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = article.title || t("untitled", "Untitled");
    card.appendChild(title);

    const authors = document.createElement("div");
    authors.className = "authors";
    authors.textContent = (article.authors || []).join(", ") || t("unknownAuthor", "Unknown author");
    card.appendChild(authors);

    const meta = document.createElement("div");
    meta.className = "meta";
    const yearBadge = badge(article.year ? String(article.year) : "n.d.");
    const statusBadge = badge(statusLabels[article.reading_status] || t("statusNA", "status n/a"));
    meta.appendChild(yearBadge);
    meta.appendChild(statusBadge);
    if (article.discipline) meta.appendChild(badge(article.discipline));
    if (article.arxiv_id) meta.appendChild(badge(`arXiv ${article.arxiv_id}`));
    card.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "actions";

    const rowPrimary = document.createElement("div");
    rowPrimary.className = "actions-row";

    rowPrimary.appendChild(actionBtn(t("read", "Read"), "btn-primary", () => {
        window.location.href = `/read/${article.id}`;
    }));

    rowPrimary.appendChild(quickActionBtn(
        t("status", "Status"),
        "is-status",
        (button) => openQuickActionMenu(button, "status", article.id)
    ));

    rowPrimary.appendChild(quickActionBtn(
        t("collections", "Collections"),
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

    rowAdmin.appendChild(actionBtn(t("edit", "Edit"), "btn-secondary", () => {
        openEditModal(article);
    }));

    rowAdmin.appendChild(actionBtn(t("delete", "Delete"), "btn-danger", () => {
        state.deletingArticleId = article.id;
        dom.deleteLabel.textContent = article.title || `(${t("untitled", "Untitled")})`;
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
    title.textContent = state.quickMenu.type === "status" ? t("chooseStatus", "Change status") : t("collections", "Collections");
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
        empty.textContent = t("noCollectionAvailable", "No collections");
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
            throw new Error(data.error || t("toastStatusUpdateFailed", "Unable to update status"));
        }

        closeQuickActionMenu();
        toast(t("toastStatusUpdated", "Status updated"), "success");
        await refresh();
    } catch (err) {
        toast(err.message || t("toastStatusUpdateFailed", "Unable to update status"), "error");
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
            throw new Error(data.error || t("toastCollectionsUpdateFailed", "Unable to update collections"));
        }

        closeQuickActionMenu();
        toast(isAssigned ? t("toastCollectionRemoved", "Removed from collection") : t("toastCollectionAdded", "Added to collection"), "success");
        await refresh();
    } catch (err) {
        toast(err.message || t("toastCollectionsUpdateFailed", "Unable to update collections"), "error");
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
        toast(t("toastUploadNeedInput", "Select a PDF or provide an arXiv URL/ID"), "error");
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
            throw new Error(payload.error || t("toastUploadFailed", "Upload failed"));
        }

        closeModal(dom.uploadModal);
        dom.uploadFile.value = "";
        dom.uploadArxiv.value = "";
        toast(t("toastUploadSuccess", "Article added"), "success");
        await refresh();
    } catch (err) {
        toast(err.message || t("toastUploadFailed", "Upload failed"), "error");
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
        p.textContent = t("noCollectionAvailable", "No collections");
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
            throw new Error(data.error || t("toastUpdateFailed", "Update failed"));
        }
        closeModal(dom.editModal);
        toast(t("toastUpdateSuccess", "Metadata updated"), "success");
        await refresh();
    } catch (err) {
        toast(err.message || t("toastUpdateFailed", "Update failed"), "error");
    }
}

async function refetchArxivMetadata() {
    if (!state.editingArticleId) return;
    const arxiv = dom.editArxiv.value.trim();
    if (!arxiv) {
        toast(t("toastArxivRequired", "Provide an arXiv ID or URL"), "error");
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
            throw new Error(data.error || t("toastArxivRefetchFailed", "arXiv re-fetch failed"));
        }
        toast(t("toastArxivRefetchSuccess", "arXiv metadata updated"), "success");
        openEditModal(data);
        await refresh();
    } catch (err) {
        toast(err.message || t("toastArxivRefetchFailed", "arXiv re-fetch failed"), "error");
    }
}

async function confirmDeleteArticle() {
    if (!state.deletingArticleId) return;
    try {
        const response = await fetch(`/api/articles/${state.deletingArticleId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error(t("toastDeleteFailed", "Delete failed"));
        }
        closeModal(dom.deleteModal);
        state.deletingArticleId = null;
        toast(t("toastDeleteSuccess", "Article deleted"), "success");
        await refresh();
    } catch (err) {
        toast(err.message || t("toastDeleteFailed", "Delete failed"), "error");
    }
}

async function exportBulkBibtex() {
    if (state.selectedIds.size === 0) {
        toast(t("toastNeedSelection", "Select at least one article"), "error");
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
            throw new Error(payload.error || t("toastExportFailed", "BibTeX export failed"));
        }

        await downloadBlob(response, "library.bib");
        toast(t("toastExportSuccess", "BibTeX export completed"), "success");
    } catch (err) {
        toast(err.message || t("toastExportFailed", "BibTeX export failed"), "error");
    }
}

async function createCollection() {
    const name = dom.newCollectionName.value.trim();
    if (!name) {
        toast(t("toastCollectionNameRequired", "Collection name is required"), "error");
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
            throw new Error(data.error || t("toastCollectionCreateFailed", "Unable to create collection"));
        }

        dom.newCollectionName.value = "";
        dom.newCollectionDescription.value = "";
        toast(t("toastCollectionCreateSuccess", "Collection created"), "success");
        await refresh();
        if (state.editingArticleId) {
            const current = state.articles.find((a) => a.id === state.editingArticleId);
            if (current) renderCollectionChecklist(current.collection_ids || []);
        }
    } catch (err) {
        toast(err.message || t("toastCollectionCreateFailed", "Unable to create collection"), "error");
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
        throw new Error(data.error || t("apiError", "API error"));
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
