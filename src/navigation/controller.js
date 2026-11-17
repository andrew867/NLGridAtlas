import { parseRoute, serializeRoute, updateRoute } from "./state.js";

export function createNavigationController({ page, render, afterRender = null }) {
  let transitionId = 0;
  let parsed = parseRoute(window.location.href, page);

  async function apply(nextParsed, { history = "replace", focus = null, preserveScroll = false } = {}) {
    const id = ++transitionId;
    const scroll = preserveScroll ? { x: window.scrollX, y: window.scrollY } : null;
    const nextUrl = serializeRoute(nextParsed.state, window.location.href);
    const currentUrl = new URL(window.location.href);
    if (history !== "none" && nextUrl.href !== currentUrl.href) {
      const method = history === "push" ? "pushState" : "replaceState";
      window.history[method]({ route: nextParsed.state, scroll }, "", nextUrl);
    }
    await render(nextParsed);
    if (id !== transitionId) return;
    if (afterRender) await afterRender(nextParsed);
    if (scroll) {
      const root = document.documentElement;
      const scrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(scroll.x, scroll.y);
      root.style.scrollBehavior = scrollBehavior;
    }
    else if (nextParsed.state.fragment) {
      document.getElementById(nextParsed.state.fragment)?.scrollIntoView({ block: "start" });
    }
    if (focus) document.querySelector(focus)?.focus({ preventScroll: true });
    parsed = nextParsed;
  }

  function transition(patch, options = {}) {
    const state = updateRoute(parsed.state, patch);
    return apply({ ...parseRoute(serializeRoute(state, window.location.href), page), state }, { history: "push", ...options });
  }

  async function hydrate() {
    const canonical = parseRoute(window.location.href, page);
    await apply(canonical, { history: "replace" });
  }

  window.addEventListener("popstate", () => apply(parseRoute(window.location.href, page), { history: "none" }));
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) apply(parseRoute(window.location.href, page), { history: "none" });
  });

  return { hydrate, transition, getState: () => parsed.state };
}
