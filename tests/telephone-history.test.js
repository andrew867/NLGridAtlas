import { readAtlasHtmlSync } from "./page-fixture.js";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { telephoneSources, telephoneTimeline } from "../src/telephone-data.js";

const html = readAtlasHtmlSync();
const research = fs.readFileSync(new URL("../research/TELEPHONE_SYSTEM_HISTORY.md", import.meta.url), "utf8");

test("telephone chronology references registered sources", () => {
  const sourceIds = new Set(telephoneSources.map((source) => source.id));
  assert.equal(sourceIds.size, telephoneSources.length);
  assert.ok(telephoneSources.length >= 22);
  assert.ok(telephoneTimeline.length >= 19);
  for (const event of telephoneTimeline) {
    assert.ok(sourceIds.has(event.sourceId), `missing telephone source ${event.sourceId}`);
    assert.equal(event.category, "telecom");
  }
});

test("1977 comparison retains the filed carrier values", () => {
  assert.match(html, /39,496/);
  assert.match(html, /105,736/);
  assert.match(html, /27,913/);
  assert.match(html, /1,836/);
  assert.match(html, /DDD availability<\/dt><dd>61%/);
  assert.match(html, /DDD availability<\/dt><dd>94\.6%/);
});

test("carrier succession remains split until the 1989 amalgamation", () => {
  assert.match(html, /Anglo-American Telegraph/);
  assert.match(html, /Canadian National Telecommunications/);
  assert.match(html, /Terra Nova Telecommunications/);
  assert.match(html, /Amalgamated January 1, 1989/);
  assert.match(research, /Two main systems expanded in parallel until 1988/);
});

test("1979 record separates the two carrier firsts", () => {
  const event = telephoneTimeline.find((entry) => entry.date === "1979" && /DMS-10/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /Springdale DMS-10 on April 25/);
  assert.match(event.body, /first DMS-10 was installed at Nain/);
  assert.match(research, /carrier-specific firsts/);
  assert.doesNotMatch(research, /Exact commissioning dates are still needed/);
});

test("digital conversion retains host, remote and transport evidence", () => {
  assert.match(html, /ST\. JOHN'S DMS-100/);
  assert.match(html, /TORBAY RLM/);
  assert.match(html, /GLOVERTOWN RSC/);
  assert.match(html, /GANDER DMS-100 \/ 200/);
  assert.match(html, /670 km/);
  assert.match(html, /15 microwave sites/);
  assert.match(research, /7\.2% of subscriber lines/);
  assert.match(research, /expected the figure to reach 13%/);
  assert.match(research, /1,000 lines with provision for 1,280/);
});

test("DMS remote classes remain technically distinct", () => {
  assert.match(html, />LCM</);
  assert.match(html, />RLM</);
  assert.match(html, />RLCM</);
  assert.match(html, />RSC</);
  assert.match(html, /DMS-1U \/ RCU/);
  assert.match(research, /two to five DS-1 facilities/);
  assert.match(research, /up to 640 line cards/);
  assert.match(research, /neither subscriber features nor recorded announcements/);
  assert.match(research, /switch local RSC-S lines to those trunks/);
  assert.match(research, /do not yet assign a DMS-1U or RCU to a named exchange/);
  assert.match(research, /final step-by-step or crossbar exchange/);
});

test("telephone sources retain exact physical page references", () => {
  assert.equal(
    telephoneSources.find((source) => source.id === "canada-nl-1977-telephone-study")?.pages,
    "physical PDF pp. 8 to 10, 20 to 28 and 109 to 121"
  );
  assert.equal(
    telephoneSources.find((source) => source.id === "gander-beacon-1979-springdale-digital")?.pages,
    "physical PDF p. 59"
  );
  assert.equal(
    telephoneSources.find((source) => source.id === "nl-board-trade-1923-telephones")?.pages,
    "physical PDF pp. 31 to 32, printed pp. 29 to 30"
  );
});

test("telephone records contain no em or en dashes", () => {
  const data = JSON.stringify({ telephoneSources, telephoneTimeline });
  assert.doesNotMatch(data, /[\u2013\u2014]/);
  assert.doesNotMatch(research, /[\u2013\u2014]/);
});
