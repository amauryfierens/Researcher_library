import { copyCitation, truncate } from "./annotations.js";

const article = window.ARTICLE_DATA;
const READER_PANEL_STORAGE_KEY = "readerPanelOpen";

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
    views: new Map(),
};

const dom = {
    readerContainer: document.querySelector(".reader-container"),
    readerMain: document.getElementById("readerMain"),
    readerPanel: document.getElementById("readerPanel"),
    pdfViewport: document.getElementById("pdfViewport"),
    pdfViewer: document.getElementById("pdfViewer"),
    pageInfo: document.getElementById("pageInfo"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    zoomDown: document.getElementById("zoomDown"),
    zoomUp: document.getElementById("zoomUp"),
    togglePanelBtn: document.getElementById("togglePanelBtn"),
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
    restorePanelPreference();
    applyPanelVisibility();
    bindEvents();
    await loadAnnotations();
    await loadPdf();
}

function bindEvents() {
    dom.prevBtn.addEventListener("click", () => goToPage(state.pageNumber - 1));
    dom.nextBtn.addEventListener("click", () => goToPage(state.pageNumber + 1));
    dom.zoomDown.addEventListener("click", () => { void setZoom(state.zoom - 0.1); });
    dom.zoomUp.addEventListener("click", () => { void setZoom(state.zoom + 0.1); });
    dom.togglePanelBtn.addEventListener("click", togglePanelVisibility);

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
    dom.readerPanel.style.display = state.panelOpen ? "block" : "none";
    dom.togglePanelBtn.textContent = state.panelOpen ? "Masquer panneau" : "Afficher panneau";
    dom.togglePanelBtn.setAttribute("aria-expanded", state.panelOpen ? "true" : "false");
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
        toast("Erreur chargement PDF", "error");
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
        toast(err.message || "Erreur chargement annotations", "error");
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
    dom.saveHighlightBtn.textContent = isEdit ? "Mettre a jour" : "Surligner";

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
    dom.saveHighlightBtn.textContent = "Surligner";
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
        toast("Citation copiée", "success");
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
            toast("Highlight mis a jour", "success");
        } catch (err) {
            toast(err.message || "Erreur mise a jour highlight", "error");
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
        toast(noteBody ? "Highlight et note ajoutés" : "Highlight ajouté", "success");
    } catch (err) {
        toast(err.message || "Erreur ajout highlight", "error");
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
        toast("Le texte de la note est requis", "error");
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
            toast("Note ajoutée", "success");
        } else {
            await fetchJson(`/api/notes/${state.pendingNote.note.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body }),
            });
            toast("Note mise à jour", "success");
        }

        closeNotePopover();
        await loadAnnotations();
    } catch (err) {
        toast(err.message || "Erreur note", "error");
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
        toast("Note supprimée", "success");
    } catch (err) {
        toast(err.message || "Erreur suppression note", "error");
    }
}

async function deleteHighlight(id) {
    try {
        await fetchJson(`/api/highlights/${id}`, { method: "DELETE" });
        await loadAnnotations();
        toast("Highlight supprimé", "success");
    } catch (err) {
        toast(err.message || "Erreur suppression highlight", "error");
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
                node.title = highlight.note || highlight.text_content || "Highlight";
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
        dom.highlightsList.appendChild(emptyListItem("Aucun highlight"));
        return;
    }

    state.highlights.forEach((highlight) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="meta">
                <span><span class="swatch" style="background:${colorToHex(highlight.color)}"></span>Page ${highlight.page_number}</span>
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
        dom.notesList.appendChild(emptyListItem("Aucune note"));
        return;
    }

    state.notes.forEach((note) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="meta">
                <span>Page ${note.page_number}</span>
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
        dom.pageInfo.textContent = `Page ${state.pageNumber} / ${state.totalPages}`;
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
        throw new Error(data.error || "Erreur API");
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
