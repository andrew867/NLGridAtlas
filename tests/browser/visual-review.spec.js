import { mkdir } from "node:fs/promises";
import path from "node:path";
import { test } from "@playwright/test";

test("capture the post-refactor viewport matrix", async ({ page }, testInfo) => {
  test.skip(process.env.VISUAL_REVIEW !== "1" || testInfo.project.name !== "chromium", "Run explicitly for visual review evidence");
  test.setTimeout(120_000);
  const output = path.resolve("output", "ux-refactor", "after");
  await mkdir(output, { recursive: true });
  const allViewports = [
    ["phone", 390, 844],
    ["tablet", 768, 1024],
    ["desktop", 1440, 1000],
    ["wide", 1920, 1200]
  ];
  const viewports = process.env.VISUAL_SIZE ? allViewports.filter(([name]) => name === process.env.VISUAL_SIZE) : allViewports;
  const views = [
    ["home", "index.html", "main"],
    ["network", "network.html#geographic-network", "#geographic-network"],
    ["station-np", "stations.html?collection=np&station=HWD&view=equipment#station-record", "#station-profile"],
    ["station-hydro", "stations.html?collection=hydro&station=SUN&view=one-line#station-record", "#hydro-terminal-record"],
    ["loads", "loads.html", "#loads"],
    ["telephone", "telephone.html", "#telephone"],
    ["radio", "telecom.html", "#telecom"],
    ["sources", "sources.html?source=np-2027-loop-study#source-np-2027-loop-study", "#source-np-2027-loop-study"]
  ];
  for (const [viewport, width, height] of viewports) {
    await page.setViewportSize({ width, height });
    for (const [name, url, selector] of views) {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const subject = page.locator(selector);
      await subject.waitFor({ state: "visible" });
      if (name !== "home") await subject.scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `${viewport}-${name}.png`), fullPage: false });
    }
  }
});
