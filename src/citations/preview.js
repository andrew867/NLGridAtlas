import { resolveCitation } from "./registry.js";

let active = null;

function sourceRecordUrl(source, citation) {
  if (!source) return linkFallback(citation);
  const url = new URL("./sources.html", window.location.href);
  url.searchParams.set("source", source.id);
  url.searchParams.set("ref", citation.id);
  url.searchParams.set("returnTo", `${window.location.pathname}${window.location.search}#${citation.contextId}`);
  url.hash = `source-${source.id}`;
  return url.href;
}

function linkFallback(citation) {
  return citation.source?.url || window.location.href;
}

function closePreview({ restoreFocus = true } = {}) {
  if (!active) return;
  const { panel, trigger, backdrop, modal, resizeHandler } = active;
  window.removeEventListener("resize", resizeHandler);
  panel.remove();
  backdrop?.remove();
  trigger.setAttribute("aria-expanded", "false");
  if (modal) document.querySelectorAll("body > :not(.citation-preview):not(.citation-backdrop)").forEach((element) => element.removeAttribute("inert"));
  active = null;
  if (restoreFocus && document.contains(trigger)) trigger.focus({ preventScroll: true });
}

function placeAnchored(panel, trigger) {
  const rect = trigger.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const margin = 12;
  let left = Math.min(window.innerWidth - panelRect.width - margin, Math.max(margin, rect.left));
  let top = rect.bottom + 8;
  if (top + panelRect.height > window.innerHeight - margin) top = Math.max(margin, rect.top - panelRect.height - 8);
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

export async function openCitationPreview(trigger) {
  const citation = resolveCitation(trigger);
  if (active) closePreview({ restoreFocus: false });
  const source = citation.source;
  const modal = window.matchMedia("(max-width: 680px), (max-height: 520px)").matches;
  const panel = document.createElement("section");
  panel.className = `citation-preview${modal ? " is-modal" : " is-anchored"}`;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", String(modal));
  panel.setAttribute("aria-labelledby", "citation-preview-title");
  const title = source?.title || "Source record not matched";
  const organization = source?.organization || "Organization not recorded";
  const year = source?.year ? ` / ${source.year}` : "";
  panel.innerHTML = `
    <button class="citation-close" type="button">Close</button>
    <p class="citation-kicker">${escapeHtml(`${organization}${year}`)}</p>
    <h2 id="citation-preview-title">${escapeHtml(title)}</h2>
    <p class="citation-locator">${escapeHtml(citation.locator || source?.pages || "Locator not recorded")}</p>
    <div class="citation-actions">
      <a href="${escapeAttribute(source?.url || citation.documentUrl || trigger.href)}" target="_blank" rel="noreferrer">Open document</a>
      <a href="${escapeAttribute(sourceRecordUrl(source, citation))}">Full source record</a>
    </div>`;
  let backdrop = null;
  if (modal) {
    backdrop = document.createElement("div");
    backdrop.className = "citation-backdrop";
    document.body.append(backdrop);
    document.querySelectorAll("body > :not(.citation-preview):not(.citation-backdrop)").forEach((element) => element.setAttribute("inert", ""));
  }
  document.body.append(panel);
  trigger.setAttribute("aria-expanded", "true");
  const resizeHandler = () => {
    if (active?.panel !== panel) return;
    const shouldBeModal = window.matchMedia("(max-width: 680px), (max-height: 520px)").matches;
    if (shouldBeModal !== modal) {
      closePreview({ restoreFocus: false });
      openCitationPreview(trigger);
      return;
    }
    if (!modal) placeAnchored(panel, trigger);
  };
  active = { panel, trigger, backdrop, modal, resizeHandler };
  if (!modal) placeAnchored(panel, trigger);
  panel.querySelector(".citation-close").focus({ preventScroll: true });
  panel.querySelector(".citation-close").addEventListener("click", () => closePreview());
  backdrop?.addEventListener("click", () => closePreview());
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closePreview();
    }
    if (modal && event.key === "Tab") trapFocus(event, panel);
  });
  window.addEventListener("resize", resizeHandler);
}

document.addEventListener("pointerdown", (event) => {
  if (!active || active.modal || active.panel.contains(event.target) || active.trigger.contains(event.target)) return;
  closePreview({ restoreFocus: false });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && active) closePreview();
});

function trapFocus(event, panel) {
  const controls = [...panel.querySelectorAll("a[href], button:not([disabled])")];
  if (!controls.length) return;
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
