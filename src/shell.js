import "@fontsource/barlow-condensed/400.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./styles.css";
import { legacyDestination } from "./navigation/legacy-aliases.js";

export function redirectLegacyRoot() {
  if (document.body.dataset.page !== "index") return false;
  const fragment = decodeURIComponent(window.location.hash.slice(1));
  const destination = legacyDestination(fragment);
  if (!destination || fragment === "top") return false;
  window.location.replace(new URL(destination, window.location.href));
  return true;
}

export function compactSourceLists(root = document) {
  const parents = new Set(
    [...root.querySelectorAll("a.evidence-link")]
      .map((link) => link.parentElement)
      .filter(Boolean)
  );
  for (const parent of parents) {
    if (parent.closest(".source-disclosure")) continue;
    const links = [...parent.children].filter((child) => child.matches("a.evidence-link"));
    if (links.length < 2) continue;
    const details = document.createElement("details");
    details.className = "source-disclosure";
    const summary = document.createElement("summary");
    summary.innerHTML = `<span>Sources</span><small>${links.length.toLocaleString()} references</small>`;
    const list = document.createElement("div");
    list.className = "source-disclosure-list";
    parent.insertBefore(details, links[0]);
    details.append(summary, list);
    links.forEach((link) => list.append(link));
  }
}

export function initShell() {
  document.documentElement.classList.add("js");
  const button = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-navigation");
  if (button && navigation) {
    button.hidden = false;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      navigation.dataset.open = String(open);
    });
  }
  document.querySelectorAll("details.communications-menu a[aria-current='page']").forEach((link) => {
    link.closest("details")?.setAttribute("open", "");
  });
  const masthead = document.querySelector(".page-masthead");
  const principal = document.querySelector("main > section.section[id]");
  if (masthead && principal) {
    const sections = [principal, ...principal.querySelectorAll(":scope > section[id]")]
      .map((section) => {
        const labelledBy = section.getAttribute("aria-labelledby");
        const heading = labelledBy ? document.getElementById(labelledBy) : section.querySelector(":scope > header h2, :scope > header h3");
        return heading ? { id: section.id, label: heading.textContent.trim() } : null;
      })
      .filter(Boolean);
    if (sections.length > 1) {
      const contents = document.createElement("nav");
      contents.className = "local-contents";
      contents.setAttribute("aria-label", "On this page");
      contents.innerHTML = `<span>On this page</span>${sections.map(({ id, label }) => `<a href="#${encodeURIComponent(id)}">${label}</a>`).join("")}`;
      masthead.after(contents);
    }
  }
  compactSourceLists();
  document.addEventListener("click", async (event) => {
    const link = event.target.closest("a.source-tag, a.evidence-link");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const { openCitationPreview } = await import("./citations/preview.js");
    openCitationPreview(link);
  });
}

export function initStaticPage() {
  if (redirectLegacyRoot()) return;
  initShell();
}
