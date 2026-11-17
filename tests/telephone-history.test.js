import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { telephoneSources, telephoneTimeline } from "../src/telephone-data.js";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const research = fs.readFileSync(new URL("../research/TELEPHONE_SYSTEM_HISTORY.md", import.meta.url), "utf8");

test("telephone chronology references registered sources", () => {
  const sourceIds = new Set(telephoneSources.map((source) => source.id));
  assert.equal(sourceIds.size, telephoneSources.length);
  assert.ok(telephoneSources.length >= 14);
  assert.ok(telephoneTimeline.length >= 15);
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

test("digital exchange conflict remains explicit", () => {
  const event = telephoneTimeline.find((entry) => entry.date === "1979" && /DMS-10/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /Springdale/);
  assert.match(event.body, /Nain/);
  assert.match(event.body, /exact commissioning order is not established/);
  assert.match(research, /Exact commissioning dates are still needed/);
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
