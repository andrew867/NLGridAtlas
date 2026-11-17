import { expect, test } from "@playwright/test";

const pages = [
  "index.html",
  "network.html",
  "stations.html",
  "transmission.html",
  "loads.html",
  "history.html",
  "telephone.html",
  "telecom.html",
  "sources.html"
];

for (const entry of pages) {
  test(`${entry} loads as a direct static request`, async ({ page }) => {
    const response = await page.goto(entry);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
  });
}

test("station route restores selection and browser history", async ({ page }) => {
  await page.goto("stations.html?collection=np&station=HWD&view=equipment#station-record");
  await expect(page.locator("#station-profile h4")).toContainText("Hardwoods");
  await page.locator('[data-station-profile="KEN"]').click();
  await expect(page).toHaveURL(/station=KEN/);
  await expect(page.locator("#station-profile h4")).toContainText("Kenmount");
  await page.goBack();
  await expect(page).toHaveURL(/station=HWD/);
  await expect(page.locator("#station-profile h4")).toContainText("Hardwoods");
  await page.goForward();
  await expect(page.locator("#station-profile h4")).toContainText("Kenmount");
});

test("diagram component selection is addressable and restored", async ({ page }) => {
  await page.goto("stations.html?component=opd%3Aopd-t1#network");
  await expect(page.locator('[data-component="opd-t1"]')).toHaveClass(/selected/);
  await page.locator('[data-component="opd-t2"]').click();
  await expect(page).toHaveURL(/component=opd%3Aopd-t2/);
  await page.reload();
  await expect(page.locator('[data-component="opd-t2"]')).toHaveClass(/selected/);
});

test("unknown station and source routes remain explicit", async ({ page }) => {
  await page.goto("stations.html?collection=np&station=NO_SUCH_STATION&view=equipment#station-record");
  await expect(page.locator("#station-profile .route-message")).toContainText("Station not found");
  await page.goto("sources.html?source=NO_SUCH_SOURCE#source-record");
  await expect(page.locator("#source-route-message")).toContainText("was not found");
});

test("a direct source route reveals a record outside the first catalogue page", async ({ page }) => {
  await page.goto("sources.html?source=mun-enl-telephone-history#source-mun-enl-telephone-history");
  await expect(page.locator("#source-mun-enl-telephone-history")).toBeVisible();
  await expect(page.locator("#source-mun-enl-telephone-history h2, #source-mun-enl-telephone-history h3").first()).toBeVisible();
});

test("source filters and sort restore from the URL", async ({ page }) => {
  await page.goto("sources.html?organization=Newfoundland+Power&period=2020-2029&sort=year&pageSize=50#evidence");
  await expect(page.locator("#source-organization")).toHaveValue("Newfoundland Power");
  await expect(page.locator("#source-period")).toHaveValue("2020-2029");
  await expect(page.locator("#source-sort")).toHaveValue("year");
  await expect(page.locator("#source-page-size")).toHaveValue("50");
  await expect(page.locator("#source-result-count")).toContainText(/of \d+ sources/);
  const organizations = await page.locator("#source-list > .source-record:visible").evaluateAll((records) => records.map((record) => record.dataset.organization));
  expect(new Set(organizations)).toEqual(new Set(["Newfoundland Power"]));
});

test("citation preview opens without changing the route and Escape restores focus", async ({ page }, testInfo) => {
  await page.goto("telephone.html");
  const trigger = page.locator("a[data-source-id]").first();
  await trigger.scrollIntoViewIfNeeded();
  const before = page.url();
  await trigger.click();
  const preview = page.locator(".citation-preview");
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute("role", "dialog");
  if (testInfo.project.name.includes("mobile")) await expect(preview).toHaveAttribute("aria-modal", "true");
  await page.keyboard.press("Escape");
  await expect(preview).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(page.url()).toBe(before);
});

test("navigation and citation dialog expose named semantic roles", async ({ page }, testInfo) => {
  await page.goto("telephone.html");
  if (testInfo.project.name.includes("mobile")) await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  const trigger = page.locator("a[data-source-id]").first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveAttribute("aria-labelledby", "citation-preview-title");
  await expect(page.locator("#citation-preview-title")).not.toBeEmpty();
});

test("reduced-motion preference retains readable page layout", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("telephone.html");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.locator("main h1")).toBeVisible();
});

test("network selections preserve the reading position", async ({ page }) => {
  await page.goto("network.html");
  const node = page.locator("#geographic-network [data-geographic-station]").last();
  await expect(node).toBeVisible();
  await node.evaluate((element) => {
    element.scrollIntoView({ behavior: "instant", block: "center" });
    element.focus({ preventScroll: true });
  });
  const before = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("Enter");
  const after = await page.evaluate(() => window.scrollY);
  expect(Math.abs(after - before)).toBeLessThan(3);
  await expect(page.locator("#geographic-map-detail")).not.toBeEmpty();
});

test("legacy index fragments redirect to their owned page", async ({ page }) => {
  await page.goto("index.html#substations");
  await expect(page).toHaveURL(/stations\.html\?collection=np/);
});

test("small-screen navigation is an accessible disclosure", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobile project only");
  await page.goto("index.html");
  const menu = page.getByRole("button", { name: "Menu" });
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#site-navigation")).toBeVisible();
});

for (const entry of pages) {
  test(`${entry} has no document-level horizontal overflow`, async ({ page }) => {
    await page.goto(entry);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
