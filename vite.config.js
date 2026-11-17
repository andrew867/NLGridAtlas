import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        network: resolve(import.meta.dirname, "network.html"),
        stations: resolve(import.meta.dirname, "stations.html"),
        transmission: resolve(import.meta.dirname, "transmission.html"),
        loads: resolve(import.meta.dirname, "loads.html"),
        history: resolve(import.meta.dirname, "history.html"),
        telephone: resolve(import.meta.dirname, "telephone.html"),
        telecom: resolve(import.meta.dirname, "telecom.html"),
        sources: resolve(import.meta.dirname, "sources.html")
      }
    }
  }
});

