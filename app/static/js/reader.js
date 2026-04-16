import { copyCitation, truncate } from "./annotations.js";

const article = window.ARTICLE_DATA;
const READER_PANEL_STORAGE_KEY = "readerPanelOpen";
const LANG_STORAGE_KEY = "siteLang";
const SUPPORTED_LANGS = new Set(["fr", "en"]);

const translations = {
    fr: {
        readerPageTitle: "Lecteur PDF",
        backToLibrary: "Retour bibliothèque",
        prev: "Précédent",
        next: "Suivant",
        hidePanel: "Masquer panneau",
        showPanel: "Afficher panneau",
        modeSelect: "Mode selection",
        modePan: "Mode deplacement",
        modeNote: "Mode note",
        exportMarkdown: "Export Markdown",
        viewOnArxivisual: "Voir sur arxivisual",
        highlights: "Highlights",
        notes: "Notes",
        optionalNote: "Note (optionnel)",
        yourNote: "Votre note...",
        cite: "Citer",
        delete: "Supprimer",
        cancel: "Annuler",
        save: "Enregistrer",
        highlight: "Surligner",
        update: "Mettre a jour",
        unknownAuthor: "Auteur inconnu",
        page: "Page",
        copiedCitation: "Citation copiée",
        toastPdfLoadError: "Erreur chargement PDF",
        toastAnnotationsLoadError: "Erreur chargement annotations",
        toastHighlightUpdateError: "Erreur mise a jour highlight",
        toastHighlightAddError: "Erreur ajout highlight",
        toastHighlightUpdated: "Highlight mis a jour",
        toastHighlightAdded: "Highlight ajouté",
        toastHighlightAndNoteAdded: "Highlight et note ajoutés",
        toastNoteRequired: "Le texte de la note est requis",
        toastNoteError: "Erreur note",
        toastNoteAdded: "Note ajoutée",
        toastNoteUpdated: "Note mise à jour",
        toastNoteDeleted: "Note supprimée",
        toastDeleteNoteError: "Erreur suppression note",
        toastDeleteHighlightError: "Erreur suppression highlight",
        toastHighlightDeleted: "Highlight supprimé",
        noHighlights: "Aucun highlight",
        noNotes: "Aucune note",
        apiError: "Erreur API",
        highlightFallbackTitle: "Highlight",
        colorYellow: "Jaune",
        colorGreen: "Vert",
        colorRed: "Rouge",
        colorBlue: "Bleu",
    },
    en: {
        readerPageTitle: "PDF Reader",
        backToLibrary: "Back to library",
        prev: "Previous",
        next: "Next",
        hidePanel: "Hide panel",
        showPanel: "Show panel",
        modeSelect: "Selection mode",
        modePan: "Pan mode",
        modeNote: "Note mode",
        exportMarkdown: "Export Markdown",
        viewOnArxivisual: "View on arxivisual",
        highlights: "Highlights",
        notes: "Notes",
        optionalNote: "Note (optional)",
        yourNote: "Your note...",
        cite: "Cite",
        delete: "Delete",
        cancel: "Cancel",
        save: "Save",
        highlight: "Highlight",
        update: "Update",
        unknownAuthor: "Unknown author",
        page: "Page",
        copiedCitation: "Citation copied",
        toastPdfLoadError: "Error loading PDF",
        toastAnnotationsLoadError: "Error loading annotations",
        toastHighlightUpdateError: "Error updating highlight",
        toastHighlightAddError: "Error adding highlight",
        toastHighlightUpdated: "Highlight updated",
        toastHighlightAdded: "Highlight added",
        toastHighlightAndNoteAdded: "Highlight and note added",
        toastNoteRequired: "Note text is required",
        toastNoteError: "Note error",
        toastNoteAdded: "Note added",
        toastNoteUpdated: "Note updated",
        toastNoteDeleted: "Note deleted",
        toastDeleteNoteError: "Error deleting note",
        toastDeleteHighlightError: "Error deleting highlight",
        toastHighlightDeleted: "Highlight deleted",
        noHighlights: "No highlights",
        noNotes: "No notes",
        apiError: "API error",
        highlightFallbackTitle: "Highlight",
        colorYellow: "Yellow",
        colorGreen: "Green",
        colorRed: "Red",
        colorBlue: "Blue",
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

let currentLanguage = getStoredLanguage();

function t(key, fallback = "") {
    return translations[currentLanguage][key] ?? fallback;
}

const state = {
    pdfjs: null,
    pdfViewerLib: null,
    pdfDoc: null,
    pdfViewer: null,
    eventBus: null,
    linkService: null,
    viewerEventsBound: false,
    pageNumber: 1,
    totalPages: 1,
    zoom: 1.0,
    highlights: [],
    notes: [],
    activeTab: "highlights",
    pendingSelection: null,
    pendingHighlightEdit: null,
    pendingNote: null,
    panelOpen: true,
    interactionMode: "select",
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    panScrollLeft: 0,
    panScrollTop: 0,
    views: new Map(),
};

const dom = {
    langFrBtn: document.getElementById("langFrBtn"),
    langEnBtn: document.getElementById("langEnBtn"),
    readerContainer: document.querySelector(".reader-container"),
    readerMain: document.getElementById("readerMain"),
    readerPanel: document.getElementById("readerPanel"),
    pdfViewport: document.getElementById("pdfViewport"),
    pdfViewer: document.getElementById("pdfViewer"),
    pageInfo: document.getElementById("pageInfo"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    selectModeBtn: document.getElementById("selectModeBtn"),
    panModeBtn: document.getElementById("panModeBtn"),
    noteModeBtn: document.getElementById("noteModeBtn"),
    zoomDown: document.getElementById("zoomDown"),
    zoomUp: document.getElementById("zoomUp"),
    panelDrawerToggle: document.getElementById("panelDrawerToggle"),
    zoomLabel: document.getElementById("zoomLabel"),
    pageSlider: document.getElementById("pageSlider"),
    exportMdBtn: document.getElementById("exportMdBtn"),

    tabHighlights: document.getElementById("tabHighlights"),
    tabNotes: document.getElementById("tabNotes"),
    highlightsList: document.getElementById("highlightsList"),
    notesList: document.getElementById("notesList"),

    hlPopover: document.getElementById("hlPopover"),
    hlNoteInput: document.getElementById("hlNoteInput"),
    saveHighlightBtn: document.getElementById("saveHighlightBtn"),
    deleteHighlightBtn: document.getElementById("deleteHighlightBtn"),
    cancelHighlightBtn: document.getElementById("cancelHighlightBtn"),
    citeBtn: document.getElementById("citeBtn"),
    colorButtons: Array.from(document.querySelectorAll(".color-btn")),

    notePopover: document.getElementById("notePopover"),
    noteBodyInput: document.getElementById("noteBodyInput"),
    saveNoteBtn: document.getElementById("saveNoteBtn"),
    cancelNoteBtn: document.getElementById("cancelNoteBtn"),
    deleteNoteBtn: document.getElementById("deleteNoteBtn"),
};

init();

async function init() {
    applyStaticTranslations();
    highlightActiveLanguage();
    restorePanelPreference();
    applyPanelVisibility();
    bindEvents();
    applyInteractionMode();
    await loadAnnotations();
    await loadPdf();
}

function setLanguage(lang) {
    if (!SUPPORTED_LANGS.has(lang) || lang === currentLanguage) return;
    currentLanguage = lang;
    try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
        // Ignore storage failures and still update UI in-memory.
    }

    highlightActiveLanguage();
    applyStaticTranslations();
    applyPanelVisibility();
    refreshPageUi();
    renderDashboard();
    refreshPopoverLabels();
}

function setInteractionMode(mode) {
    if (!["select", "pan", "note"].includes(mode) || mode === state.interactionMode) return;

    state.interactionMode = mode;
    state.isPanning = false;
    dom.pdfViewport.classList.remove("panning");

    if (mode !== "select") {
        clearSelectionUi();
    }
    if (mode !== "note") {
        closeNotePopover();
    }

    applyInteractionMode();
}

function applyInteractionMode() {
    const isSelect = state.interactionMode === "select";
    const isPan = state.interactionMode === "pan";
    const isNote = state.interactionMode === "note";

    dom.readerMain.classList.toggle("mode-select", isSelect);
    dom.readerMain.classList.toggle("mode-pan", isPan);
    dom.readerMain.classList.toggle("mode-note", isNote);

    if (dom.selectModeBtn) {
        dom.selectModeBtn.classList.toggle("active", isSelect);
        dom.selectModeBtn.setAttribute("aria-pressed", isSelect ? "true" : "false");
    }
    if (dom.panModeBtn) {
        dom.panModeBtn.classList.toggle("active", isPan);
        dom.panModeBtn.setAttribute("aria-pressed", isPan ? "true" : "false");
    }
    if (dom.noteModeBtn) {
        dom.noteModeBtn.classList.toggle("active", isNote);
        dom.noteModeBtn.setAttribute("aria-pressed", isNote ? "true" : "false");
    }
}

function refreshPopoverLabels() {
    if (dom.hlPopover.style.display !== "none") {
        dom.saveHighlightBtn.textContent = state.pendingHighlightEdit
            ? t("update", "Update")
            : t("highlight", "Highlight");
    }
}

function highlightActiveLanguage() {
    if (dom.langFrBtn) dom.langFrBtn.classList.toggle("active", currentLanguage === "fr");
    if (dom.langEnBtn) dom.langEnBtn.classList.toggle("active", currentLanguage === "en");
}

function applyStaticTranslations() {
    document.documentElement.lang = currentLanguage;
    document.title = `${article.title} - ${t("readerPageTitle", "PDF Reader")}`;

    const backLink = document.querySelector(".reader-header > a");
    if (backLink) backLink.textContent = t("backToLibrary", backLink.textContent);

    dom.prevBtn.textContent = t("prev", dom.prevBtn.textContent);
    dom.nextBtn.textContent = t("next", dom.nextBtn.textContent);

    if (dom.selectModeBtn) {
        const label = t("modeSelect", "Selection mode");
        dom.selectModeBtn.title = label;
        dom.selectModeBtn.setAttribute("aria-label", label);
    }
    if (dom.panModeBtn) {
        const label = t("modePan", "Pan mode");
        dom.panModeBtn.title = label;
        dom.panModeBtn.setAttribute("aria-label", label);
    }
    if (dom.noteModeBtn) {
        const label = t("modeNote", "Note mode");
        dom.noteModeBtn.title = label;
        dom.noteModeBtn.setAttribute("aria-label", label);
    }

    dom.exportMdBtn.textContent = t("exportMarkdown", dom.exportMdBtn.textContent);
    dom.tabHighlights.textContent = t("highlights", dom.tabHighlights.textContent);
    dom.tabNotes.textContent = t("notes", dom.tabNotes.textContent);
    dom.hlNoteInput.placeholder = t("optionalNote", dom.hlNoteInput.placeholder);
    dom.noteBodyInput.placeholder = t("yourNote", dom.noteBodyInput.placeholder);
    dom.citeBtn.textContent = t("cite", dom.citeBtn.textContent);
    dom.deleteHighlightBtn.textContent = t("delete", dom.deleteHighlightBtn.textContent);
    dom.cancelHighlightBtn.textContent = t("cancel", dom.cancelHighlightBtn.textContent);
    dom.saveHighlightBtn.textContent = t("highlight", dom.saveHighlightBtn.textContent);
    dom.deleteNoteBtn.textContent = t("delete", dom.deleteNoteBtn.textContent);
    dom.cancelNoteBtn.textContent = t("cancel", dom.cancelNoteBtn.textContent);
    dom.saveNoteBtn.textContent = t("save", dom.saveNoteBtn.textContent);

    const colorTitleKeys = ["colorYellow", "colorGreen", "colorRed", "colorBlue"];
    dom.colorButtons.forEach((button, index) => {
        const key = colorTitleKeys[index];
        if (key) button.title = t(key, button.title);
    });

    const arxivLink = document.querySelector(".reader-controls a[rel='noopener noreferrer']");
    if (arxivLink) arxivLink.textContent = t("viewOnArxivisual", arxivLink.textContent);

    const authorLine = document.querySelector(".reader-header .title small");
    if (authorLine && (!article.authors || !article.authors.length)) {
        const yearSuffix = article.year ? ` • ${article.year}` : "";
        authorLine.textContent = `${t("unknownAuthor", "Unknown author")}${yearSuffix}`;
    }
}

function bindEvents() {
    if (dom.langFrBtn) dom.langFrBtn.addEventListener("click", () => setLanguage("fr"));
    if (dom.langEnBtn) dom.langEnBtn.addEventListener("click", () => setLanguage("en"));

    dom.prevBtn.addEventListener("click", () => goToPage(state.pageNumber - 1));
    dom.nextBtn.addEventListener("click", () => goToPage(state.pageNumber + 1));
    if (dom.selectModeBtn) dom.selectModeBtn.addEventListener("click", () => setInteractionMode("select"));
    if (dom.panModeBtn) dom.panModeBtn.addEventListener("click", () => setInteractionMode("pan"));
    if (dom.noteModeBtn) dom.noteModeBtn.addEventListener("click", () => setInteractionMode("note"));
    dom.zoomDown.addEventListener("click", () => { void setZoom(state.zoom - 0.1); });
    dom.zoomUp.addEventListener("click", () => { void setZoom(state.zoom + 0.1); });
    if (dom.panelDrawerToggle) {
        dom.panelDrawerToggle.addEventListener("click", togglePanelVisibility);
    }

    if (dom.pageSlider) {
        dom.pageSlider.addEventListener("input", () => {
            goToPage(Number(dom.pageSlider.value));
        });
    }

    dom.exportMdBtn.addEventListener("click", () => {
        window.location.href = `/api/articles/${article.id}/annotations/export`;
    });

    dom.tabHighlights.addEventListener("click", () => setTab("highlights"));
    dom.tabNotes.addEventListener("click", () => setTab("notes"));

    dom.saveHighlightBtn.addEventListener("click", savePendingHighlight);
    dom.deleteHighlightBtn.addEventListener("click", deleteCurrentHighlight);
    dom.cancelHighlightBtn.addEventListener("click", clearSelectionUi);
    dom.citeBtn.addEventListener("click", citePendingSelection);

    dom.colorButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setActiveHighlightColor(button.dataset.color);
        });
    });
    if (dom.colorButtons[0]) dom.colorButtons[0].classList.add("active");

    dom.saveNoteBtn.addEventListener("click", saveNoteFromPopover);
    dom.cancelNoteBtn.addEventListener("click", closeNotePopover);
    dom.deleteNoteBtn.addEventListener("click", deleteCurrentNote);

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        if (
            dom.hlPopover.style.display !== "none" &&
            !dom.hlPopover.contains(target) &&
            !target.closest(".highlight") &&
            !target.closest(".pdf-text-layer") &&
            !target.closest(".textLayer")
        ) {
            clearSelectionUi();
        }

        if (
            dom.notePopover.style.display !== "none" &&
            !dom.notePopover.contains(target) &&
            !target.closest(".note-pin") &&
            !target.closest(".pdf-page") &&
            !target.closest(".page")
        ) {
            closeNotePopover();
        }
    });

    document.addEventListener("wheel", handleReaderWheelZoom, { passive: false });
    document.addEventListener("keydown", handleReaderKeydown);

    dom.pdfViewport.addEventListener("mousedown", handlePanStart);
    window.addEventListener("mousemove", handlePanMove);
    window.addEventListener("mouseup", handlePanEnd);
}

function handlePanStart(event) {
    if (state.interactionMode !== "pan") return;
    if (event.button !== 0) return;

    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest(".note-pin, .highlight, .hl-popover, .note-popover, button, input, textarea")) {
        return;
    }

    state.isPanning = true;
    state.panStartX = event.clientX;
    state.panStartY = event.clientY;
    state.panScrollLeft = dom.pdfViewport.scrollLeft;
    state.panScrollTop = dom.pdfViewport.scrollTop;
    dom.pdfViewport.classList.add("panning");
    event.preventDefault();
}

function handlePanMove(event) {
    if (!state.isPanning || state.interactionMode !== "pan") return;

    const dx = event.clientX - state.panStartX;
    const dy = event.clientY - state.panStartY;
    dom.pdfViewport.scrollLeft = state.panScrollLeft - dx;
    dom.pdfViewport.scrollTop = state.panScrollTop - dy;
}

function handlePanEnd() {
    if (!state.isPanning) return;
    state.isPanning = false;
    dom.pdfViewport.classList.remove("panning");
}

function restorePanelPreference() {
    try {
        const value = localStorage.getItem(READER_PANEL_STORAGE_KEY);
        if (value === "0") state.panelOpen = false;
        if (value === "1") state.panelOpen = true;
    } catch {
        state.panelOpen = true;
    }
}

function savePanelPreference() {
    try {
        localStorage.setItem(READER_PANEL_STORAGE_KEY, state.panelOpen ? "1" : "0");
    } catch {
        // Ignore storage write failures (private mode, blocked storage, etc.)
    }
}

function applyPanelVisibility() {
    dom.readerMain.classList.toggle("no-panel", !state.panelOpen);
    if (dom.panelDrawerToggle) {
        dom.panelDrawerToggle.textContent = state.panelOpen
            ? t("hidePanel", "Hide panel")
            : t("showPanel", "Show panel");
        dom.panelDrawerToggle.setAttribute("aria-expanded", state.panelOpen ? "true" : "false");
    }
}

function togglePanelVisibility() {
    state.panelOpen = !state.panelOpen;
    applyPanelVisibility();
    savePanelPreference();
}

function isEditableTarget(target) {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function hasZoomModifier(event) {
    return event.ctrlKey || event.metaKey;
}

function isEventInsideReader(target) {
    if (!(target instanceof Element)) return false;
    return dom.readerContainer ? dom.readerContainer.contains(target) : false;
}

function handleReaderWheelZoom(event) {
    if (!hasZoomModifier(event)) return;
    if (!isEventInsideReader(event.target)) return;

    // Override browser page zoom and apply reader PDF zoom instead.
    event.preventDefault();
    const step = event.deltaY > 0 ? -0.1 : 0.1;
    void setZoom(state.zoom + step);
}

function handleReaderKeydown(event) {
    const editable = isEditableTarget(event.target);

    if (hasZoomModifier(event) && isEventInsideReader(event.target)) {
        if (event.key === "+" || event.key === "=" || event.code === "NumpadAdd") {
            event.preventDefault();
            void setZoom(state.zoom + 0.1);
            return;
        }
        if (event.key === "-" || event.code === "NumpadSubtract") {
            event.preventDefault();
            void setZoom(state.zoom - 0.1);
            return;
        }
        if (event.key === "0" || event.code === "Digit0" || event.code === "Numpad0") {
            event.preventDefault();
            void setZoom(1.0);
            return;
        }
    }

    if (event.key === "Escape") {
        clearSelectionUi();
        closeNotePopover();
        return;
    }

    if (editable) return;

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPage(state.pageNumber - 1);
    }
    if (event.key === "ArrowRight") {
        event.preventDefault();
        goToPage(state.pageNumber + 1);
    }
}

async function loadPdf() {
    try {
        const pdfjsModule = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs");
        state.pdfjs = pdfjsModule;
        globalThis.pdfjsLib = pdfjsModule;

        const viewerModule = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf_viewer.mjs");
        state.pdfViewerLib = viewerModule;

        state.pdfjs.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

        state.eventBus = new state.pdfViewerLib.EventBus();
        state.linkService = new state.pdfViewerLib.PDFLinkService({
            eventBus: state.eventBus,
        });
        state.pdfViewer = new state.pdfViewerLib.PDFViewer({
            container: dom.pdfViewport,
            viewer: dom.pdfViewer,
            eventBus: state.eventBus,
            linkService: state.linkService,
            textLayerMode: 1,
            annotationMode: 0,
            removePageBorders: false,
        });
        state.linkService.setViewer(state.pdfViewer);
        bindPdfViewerEvents();

        const url = `/uploads/${article.filename}`;
        state.pdfDoc = await state.pdfjs.getDocument(url).promise;
        state.totalPages = state.pdfDoc.numPages;

        if (dom.pageSlider) {
            dom.pageSlider.max = String(state.totalPages);
            dom.pageSlider.value = String(state.pageNumber);
        }

        state.linkService.setDocument(state.pdfDoc, null);
        state.pdfViewer.setDocument(state.pdfDoc);

        await waitForViewerEvent("pagesinit");
        state.pdfViewer.currentScale = state.zoom;
        state.pdfViewer.currentPageNumber = state.pageNumber;

        refreshViewsFromViewer();
        renderAnnotationsOnAllPages();
        refreshPageUi();
    } catch (err) {
        console.error("PDF viewer initialization failed", err);
        toast(t("toastPdfLoadError", "Error loading PDF"), "error");
    }
}

function waitForViewerEvent(eventName) {
    return new Promise((resolve) => {
        const onEvent = (event) => {
            state.eventBus.off(eventName, onEvent);
            resolve(event);
        };
        state.eventBus.on(eventName, onEvent);
    });
}

function bindPdfViewerEvents() {
    if (state.viewerEventsBound || !state.eventBus) return;
    state.viewerEventsBound = true;

    state.eventBus.on("pagechanging", (event) => {
        state.pageNumber = event.pageNumber;
        refreshPageUi();
    });

    state.eventBus.on("scalechanging", (event) => {
        state.zoom = event.scale;
        refreshPageUi();
        requestAnimationFrame(() => {
            refreshViewsFromViewer();
            renderAnnotationsOnAllPages();
        });
    });

    state.eventBus.on("pagerendered", (event) => {
        refreshSinglePageView(event.pageNumber);
        renderAnnotationsOnPage(event.pageNumber);
    });

    state.eventBus.on("pagesloaded", () => {
        refreshViewsFromViewer();
        renderAnnotationsOnAllPages();
    });
}

function refreshViewsFromViewer() {
    if (!state.pdfViewer) return;

    state.views.clear();
    for (let pageNumber = 1; pageNumber <= state.totalPages; pageNumber += 1) {
        refreshSinglePageView(pageNumber);
    }
}

function refreshSinglePageView(pageNumber) {
    if (!state.pdfViewer) return;
    const pageView = state.pdfViewer.getPageView(pageNumber - 1);
    if (!pageView || !pageView.div || !pageView.viewport) return;

    const pageNode = pageView.div;
    const canvas = pageNode.querySelector("canvas");
    const textLayer = pageNode.querySelector(".textLayer");

    let annotLayer = pageNode.querySelector(".pdf-annot-layer");
    if (!annotLayer) {
        annotLayer = document.createElement("div");
        annotLayer.className = "pdf-annot-layer";
        pageNode.appendChild(annotLayer);
    }

    const previous = state.views.get(pageNumber);
    const view = {
        pageNumber,
        pageNode,
        canvas,
        textLayer,
        annotLayer,
        viewport: pageView.viewport,
        textContent: previous?.textContent || null,
    };
    state.views.set(pageNumber, view);

    if (!pageNode.dataset.readerBound) {
        pageNode.dataset.readerBound = "1";

        pageNode.addEventListener("mouseup", (event) => {
            if (state.interactionMode !== "select") return;
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            if (!target.closest(".textLayer")) return;

            const currentView = state.views.get(pageNumber);
            if (!currentView) return;
            setTimeout(() => captureSelection(event, currentView), 0);
        });

        pageNode.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;

            const currentView = state.views.get(pageNumber);
            if (!currentView) return;

            const pin = target.closest(".note-pin");
            if (pin) {
                const noteId = Number(pin.dataset.noteId);
                const note = state.notes.find((n) => n.id === noteId);
                if (note) {
                    openNotePopoverAt(event.clientX, event.clientY, {
                        mode: "edit",
                        note,
                    });
                }
                return;
            }

            const hl = target.closest(".highlight");
            if (hl) {
                const hid = Number(hl.dataset.highlightId);
                const highlight = state.highlights.find((h) => h.id === hid);
                if (highlight) {
                    openHighlightPopover(event.clientX, event.clientY, {
                        mode: "edit",
                        highlight,
                    });
                }
                return;
            }

            if (state.interactionMode === "pan") {
                return;
            }

            if (state.interactionMode === "select") {
                const selection = window.getSelection();
                if (selection && !selection.isCollapsed && selection.toString().trim()) {
                    return;
                }
                return;
            }

            if (state.interactionMode !== "note") {
                return;
            }

            const selection = window.getSelection();
            if (selection && !selection.isCollapsed && selection.toString().trim()) {
                return;
            }

            if (state.pendingSelection) return;

            const pageRect = currentView.pageNode.getBoundingClientRect();
            const x = (event.clientX - pageRect.left) / currentView.viewport.scale;
            const y = (event.clientY - pageRect.top) / currentView.viewport.scale;

            state.pageNumber = currentView.pageNumber;
            refreshPageUi();

            openNotePopoverAt(event.clientX, event.clientY, {
                mode: "create",
                note: {
                    page_number: currentView.pageNumber,
                    x,
                    y,
                    body: "",
                },
            });
        });
    }
}

async function loadAnnotations() {
    try {
        const [highlights, notes] = await Promise.all([
            fetchJson(`/api/articles/${article.id}/highlights`),
            fetchJson(`/api/articles/${article.id}/notes`),
        ]);
        state.highlights = Array.isArray(highlights) ? highlights : [];
        state.notes = Array.isArray(notes) ? notes : [];
        renderDashboard();
        renderAnnotationsOnAllPages();
    } catch (err) {
        toast(err.message || t("toastAnnotationsLoadError", "Error loading annotations"), "error");
    }
}

function captureSelection(event, view) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        clearSelectionUi();
        return;
    }

    const range = selection.getRangeAt(0);
    if (!view.pageNode.contains(range.commonAncestorContainer)) {
        clearSelectionUi();
        return;
    }

    const text = selection.toString().trim();
    if (!text) {
        clearSelectionUi();
        return;
    }

    const pageRect = view.pageNode.getBoundingClientRect();
    const rects = Array.from(range.getClientRects())
        .filter((r) => r.width > 1 && r.height > 1)
        .map((r) => ({
            x: (r.left - pageRect.left) / view.viewport.scale,
            y: (r.top - pageRect.top) / view.viewport.scale,
            w: r.width / view.viewport.scale,
            h: r.height / view.viewport.scale,
        }));

    if (rects.length === 0) {
        clearSelectionUi();
        return;
    }

    state.pendingSelection = {
        page_number: view.pageNumber,
        text_content: text,
        rects,
        color: getSelectedColor(),
        note: "",
    };

    state.pageNumber = view.pageNumber;
    refreshPageUi();

    showHighlightPopover(event.clientX, event.clientY);
}

function showHighlightPopover(clientX, clientY) {
    openHighlightPopover(clientX, clientY, {
        mode: "create",
        selection: state.pendingSelection,
    });
}

function openHighlightPopover(clientX, clientY, payload) {
    const isEdit = payload.mode === "edit";

    state.pendingHighlightEdit = isEdit ? payload.highlight : null;
    dom.hlPopover.style.display = "flex";
    dom.hlPopover.style.left = `${Math.max(12, clientX - 180)}px`;
    dom.hlPopover.style.top = `${Math.max(12, clientY - 64)}px`;
    dom.deleteHighlightBtn.style.display = isEdit ? "inline-flex" : "none";
    dom.citeBtn.style.display = isEdit ? "none" : "inline-flex";
    dom.saveHighlightBtn.textContent = isEdit ? t("update", "Update") : t("highlight", "Highlight");

    if (isEdit) {
        dom.hlNoteInput.value = payload.highlight.note || "";
        setActiveHighlightColor(payload.highlight.color || "yellow");
    } else {
        dom.hlNoteInput.value = "";
        setActiveHighlightColor((payload.selection && payload.selection.color) || getSelectedColor());
    }
}

function clearSelectionUi() {
    state.pendingSelection = null;
    state.pendingHighlightEdit = null;
    dom.hlPopover.style.display = "none";
    dom.deleteHighlightBtn.style.display = "none";
    dom.citeBtn.style.display = "inline-flex";
    dom.saveHighlightBtn.textContent = t("highlight", "Highlight");
    dom.hlNoteInput.value = "";
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
}

function setActiveHighlightColor(color) {
    const desired = color || "yellow";
    dom.colorButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.color === desired);
    });

    if (state.pendingSelection) {
        state.pendingSelection.color = desired;
    }
    if (state.pendingHighlightEdit) {
        state.pendingHighlightEdit.color = desired;
    }
}

function getSelectedColor() {
    const button = dom.colorButtons.find((b) => b.classList.contains("active"));
    return button ? button.dataset.color : "yellow";
}

async function citePendingSelection() {
    if (!state.pendingSelection) return;
    const result = await copyCitation(state.pendingSelection.text_content, article);
    if (result.ok) {
        toast(t("copiedCitation", "Citation copied"), "success");
    }
}

async function savePendingHighlight() {
    if (state.pendingHighlightEdit) {
        try {
            await fetchJson(`/api/highlights/${state.pendingHighlightEdit.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    color: getSelectedColor(),
                    note: dom.hlNoteInput.value.trim() || null,
                }),
            });
            clearSelectionUi();
            await loadAnnotations();
            toast(t("toastHighlightUpdated", "Highlight updated"), "success");
        } catch (err) {
            toast(err.message || t("toastHighlightUpdateError", "Error updating highlight"), "error");
        }
        return;
    }

    if (!state.pendingSelection) return;

    const noteBody = dom.hlNoteInput.value.trim();

    const payload = {
        page_number: state.pendingSelection.page_number,
        color: getSelectedColor(),
        text_content: state.pendingSelection.text_content,
        rects: state.pendingSelection.rects,
        note: null,
    };

    try {
        await fetchJson(`/api/articles/${article.id}/highlights`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (noteBody) {
            const firstRect = state.pendingSelection.rects && state.pendingSelection.rects[0];
            if (firstRect) {
                await fetchJson(`/api/articles/${article.id}/notes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        page_number: state.pendingSelection.page_number,
                        x: firstRect.x + (firstRect.w / 2),
                        y: firstRect.y,
                        body: noteBody,
                    }),
                });
            }
        }

        clearSelectionUi();
        await loadAnnotations();
        toast(
            noteBody
                ? t("toastHighlightAndNoteAdded", "Highlight and note added")
                : t("toastHighlightAdded", "Highlight added"),
            "success",
        );
    } catch (err) {
        toast(err.message || t("toastHighlightAddError", "Error adding highlight"), "error");
    }
}

async function deleteCurrentHighlight() {
    if (!state.pendingHighlightEdit) return;
    const highlightId = state.pendingHighlightEdit.id;
    clearSelectionUi();
    await deleteHighlight(highlightId);
}

function openNotePopoverAt(clientX, clientY, pendingNote) {
    state.pendingNote = pendingNote;
    dom.notePopover.style.display = "block";
    dom.notePopover.style.left = `${Math.max(12, clientX - 120)}px`;
    dom.notePopover.style.top = `${Math.max(12, clientY - 16)}px`;
    dom.noteBodyInput.value = pendingNote.note.body || "";
    dom.deleteNoteBtn.style.display = pendingNote.mode === "edit" ? "inline-flex" : "none";
}

function closeNotePopover() {
    state.pendingNote = null;
    dom.notePopover.style.display = "none";
    dom.noteBodyInput.value = "";
}

async function saveNoteFromPopover() {
    if (!state.pendingNote) return;

    const body = dom.noteBodyInput.value.trim();
    if (!body) {
        toast(t("toastNoteRequired", "Note text is required"), "error");
        return;
    }

    try {
        if (state.pendingNote.mode === "create") {
            const payload = {
                page_number: state.pendingNote.note.page_number,
                x: state.pendingNote.note.x,
                y: state.pendingNote.note.y,
                body,
            };
            await fetchJson(`/api/articles/${article.id}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            toast(t("toastNoteAdded", "Note added"), "success");
        } else {
            await fetchJson(`/api/notes/${state.pendingNote.note.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body }),
            });
            toast(t("toastNoteUpdated", "Note updated"), "success");
        }

        closeNotePopover();
        await loadAnnotations();
    } catch (err) {
        toast(err.message || t("toastNoteError", "Note error"), "error");
    }
}

async function deleteCurrentNote() {
    if (!state.pendingNote || state.pendingNote.mode !== "edit") return;
    try {
        await fetchJson(`/api/notes/${state.pendingNote.note.id}`, {
            method: "DELETE",
        });
        closeNotePopover();
        await loadAnnotations();
        toast(t("toastNoteDeleted", "Note deleted"), "success");
    } catch (err) {
        toast(err.message || t("toastDeleteNoteError", "Error deleting note"), "error");
    }
}

async function deleteHighlight(id) {
    try {
        await fetchJson(`/api/highlights/${id}`, { method: "DELETE" });
        await loadAnnotations();
        toast(t("toastHighlightDeleted", "Highlight deleted"), "success");
    } catch (err) {
        toast(err.message || t("toastDeleteHighlightError", "Error deleting highlight"), "error");
    }
}

function renderAnnotationsOnAllPages() {
    state.views.forEach((_, pageNumber) => renderAnnotationsOnPage(pageNumber));
}

function renderAnnotationsOnPage(pageNumber) {
    const view = state.views.get(pageNumber);
    if (!view) return;
    const layer = view.annotLayer;
    layer.innerHTML = "";

    const scale = view.viewport.scale;

    state.highlights
        .filter((h) => h.page_number === pageNumber)
        .forEach((highlight) => {
            (highlight.rects || []).forEach((r) => {
                const node = document.createElement("div");
                node.className = `highlight highlight-${highlight.color || "yellow"}`;
                node.dataset.highlightId = String(highlight.id);
                node.style.left = `${r.x * scale}px`;
                node.style.top = `${r.y * scale}px`;
                node.style.width = `${r.w * scale}px`;
                node.style.height = `${r.h * scale}px`;
                node.title = highlight.note || highlight.text_content || t("highlightFallbackTitle", "Highlight");
                layer.appendChild(node);
            });
        });

    state.notes
        .filter((n) => n.page_number === pageNumber)
        .forEach((note) => {
            const pin = document.createElement("button");
            pin.className = "note-pin";
            pin.type = "button";
            pin.textContent = "N";
            pin.dataset.noteId = String(note.id);
            pin.style.left = `${note.x * scale}px`;
            pin.style.top = `${note.y * scale}px`;
            pin.title = note.body;
            layer.appendChild(pin);
        });
}

function renderDashboard() {
    renderHighlightsList();
    renderNotesList();
}

function renderHighlightsList() {
    dom.highlightsList.innerHTML = "";

    if (!state.highlights.length) {
        dom.highlightsList.appendChild(emptyListItem(t("noHighlights", "No highlights")));
        return;
    }

    state.highlights.forEach((highlight) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="meta">
                <span><span class="swatch" style="background:${colorToHex(highlight.color)}"></span>${t("page", "Page")} ${highlight.page_number}</span>
                <span>${new Date(highlight.created_at).toLocaleDateString()}</span>
            </div>
            <div>${escapeHtml(truncate(highlight.text_content || "", 160))}</div>
        `;
        li.addEventListener("click", async () => {
            await goToPage(highlight.page_number);
            pulseHighlight(highlight.id);
        });
        dom.highlightsList.appendChild(li);
    });
}

function renderNotesList() {
    dom.notesList.innerHTML = "";

    if (!state.notes.length) {
        dom.notesList.appendChild(emptyListItem(t("noNotes", "No notes")));
        return;
    }

    state.notes.forEach((note) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="meta">
                <span>${t("page", "Page")} ${note.page_number}</span>
                <span>${new Date(note.created_at).toLocaleDateString()}</span>
            </div>
            <div>${escapeHtml(truncate(note.body || "", 160))}</div>
        `;
        li.addEventListener("click", async () => {
            await goToPage(note.page_number);
            pulseNote(note.id);
        });
        dom.notesList.appendChild(li);
    });
}

function emptyListItem(text) {
    const li = document.createElement("li");
    li.classList.add("muted");
    li.textContent = text;
    return li;
}

function setTab(tab) {
    state.activeTab = tab;
    dom.tabHighlights.classList.toggle("active", tab === "highlights");
    dom.tabNotes.classList.toggle("active", tab === "notes");
    dom.highlightsList.style.display = tab === "highlights" ? "flex" : "none";
    dom.notesList.style.display = tab === "notes" ? "flex" : "none";
}

function goToPage(pageNumber, smooth = true) {
    const clamped = Math.min(Math.max(1, pageNumber), state.totalPages);
    const wasSamePage = clamped === state.pageNumber;

    state.pageNumber = clamped;
    if (state.pdfViewer) {
        state.pdfViewer.currentPageNumber = clamped;
        refreshViewsFromViewer();
        renderAnnotationsOnAllPages();
        refreshPageUi();
        return;
    }

    if (wasSamePage && state.views.size) {
        scrollToPage(clamped, smooth);
        return;
    }
    refreshPageUi();
    scrollToPage(clamped, smooth);
}

async function setZoom(value) {
    const clamped = Math.min(Math.max(0.5, value), 3);
    if (Math.abs(clamped - state.zoom) < 0.001) return;

    state.zoom = clamped;
    if (state.pdfViewer) {
        state.pdfViewer.currentScale = clamped;
        refreshPageUi();
        return;
    }

    refreshPageUi();
}

function scrollToPage(pageNumber, smooth = true) {
    const view = state.views.get(pageNumber);
    if (!view) return;
    view.pageNode.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "center",
    });
}

function refreshPageUi() {
    if (dom.pageInfo) {
        dom.pageInfo.textContent = `${t("page", "Page")} ${state.pageNumber} / ${state.totalPages}`;
    }
    dom.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
    if (dom.pageSlider) {
        dom.pageSlider.value = String(state.pageNumber);
    }
}

function pulseHighlight(highlightId) {
    const nodes = dom.pdfViewport.querySelectorAll(`[data-highlight-id="${highlightId}"]`);
    nodes.forEach((node) => {
        node.classList.add("pulse");
        setTimeout(() => node.classList.remove("pulse"), 1300);
    });
}

function pulseNote(noteId) {
    const node = dom.pdfViewport.querySelector(`[data-note-id="${noteId}"]`);
    if (!node) return;
    node.classList.add("pulse");
    setTimeout(() => node.classList.remove("pulse"), 1300);
}

function colorToHex(color) {
    switch (color) {
    case "green":
        return "#50dc78";
    case "red":
        return "#ff5a64";
    case "blue":
        return "#3ea6ff";
    default:
        return "#ffd23c";
    }
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || t("apiError", "API error"));
    }
    return data;
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
    }, 2400);
}

function escapeHtml(input) {
    const text = document.createElement("div");
    text.textContent = input;
    return text.innerHTML;
}
