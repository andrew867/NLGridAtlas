export const fixedLegacyAliases = {
  main: "./index.html#main",
  top: "./index.html#top",
  handbook: "./network.html#handbook",
  network: "./stations.html?collection=hydro#network",
  substations: "./stations.html?collection=np#substations",
  transmission: "./transmission.html#transmission",
  timeline: "./history.html#timeline",
  loads: "./loads.html#loads",
  telephone: "./telephone.html#telephone",
  telecom: "./telecom.html#telecom",
  evidence: "./sources.html#evidence"
};

export function legacyDestination(fragment) {
  if (!fragment) return null;
  if (fixedLegacyAliases[fragment]) return fixedLegacyAliases[fragment];
  if (generatedLegacyAliases[fragment]) return generatedLegacyAliases[fragment];
  const station = /^station-([A-Za-z0-9_-]+)$/.exec(fragment);
  if (station) return `./network.html?networkStation=${encodeURIComponent(station[1].toUpperCase())}#np-network`;
  const terminal = /^terminal-([A-Za-z0-9_-]+)$/.exec(fragment);
  if (terminal) return `./stations.html?collection=hydro&station=${encodeURIComponent(terminal[1].toUpperCase())}&view=one-line#${encodeURIComponent(fragment)}`;
  const substation = /^substation-([A-Za-z0-9_-]+)$/.exec(fragment);
  if (substation) return `./stations.html?collection=np&station=${encodeURIComponent(substation[1].toUpperCase())}&view=one-line#${encodeURIComponent(fragment)}`;
  return null;
}
import { generatedLegacyAliases } from "./legacy-alias-map.js";
