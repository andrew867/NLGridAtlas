import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { sources, timeline } from "../src/data.js";
import workItems from "../docs/work-items.json" with { type: "json" };

const eventBySource = (sourceId) => timeline.find((entry) => entry.sourceId === sourceId);

test("1852 operating record retains first messages and repair cost", () => {
  const event = eventBySource("mun-courier-1853-1852-telegraph-report");
  assert.ok(event);
  assert.equal(event.date, "1852-03-08");
  assert.match(event.body, /Brigus on March 8/);
  assert.match(event.body, /Harbor Grace on March 10/);
  assert.match(event.body, /£53 10s 4d/);
  assert.match(event.body, /excluding travel/);
});

test("1852 planning record does not imply completed Cape Ray work", () => {
  const event = eventBySource("mun-times-1852-telegraph-plan");
  assert.ok(event);
  assert.equal(event.status, "proposed");
  assert.match(event.body, /about fifteen months/);
  assert.match(event.body, /possible labour force of 1,000 men/);
  assert.match(event.body, /not completed work/);
});

test("1852 statutes retain capital, routes and road dimensions", () => {
  const company = eventBySource("mun-statutes-1852-telegraph-company");
  const protection = eventBySource("mun-statutes-1852-telegraph-protection");
  assert.ok(company);
  assert.ok(protection);
  assert.equal(company.status, "verified");
  assert.equal(protection.status, "verified");
  assert.match(company.body, /£100,000 in 1,000 shares of £100/);
  assert.match(company.body, /Cape Ray and Trepassey/);
  assert.match(company.body, /at least four feet wide/);
  assert.match(company.body, /at least eight feet wide/);
  assert.match(company.body, /at least twelve feet wide/);
  assert.match(company.body, /£1,500 for each 100 miles/);
  assert.match(protection.body, /station houses, watch houses, posts, rails, wire, machines, machinery/);
  assert.match(protection.body, /no more than one year with hard labour/);
});

test("1852 cable records separate contracts, failed attempt and completion", () => {
  const contract = eventBySource("mun-public-ledger-1852-submarine-contract");
  const attempt = eventBySource("mun-times-1852-cable-attempt");
  const completion = eventBySource("mun-times-1852-cable-completion");
  assert.ok(contract);
  assert.ok(attempt);
  assert.ok(completion);
  assert.equal(contract.status, "proposed");
  assert.match(contract.body, /Cape Tormentine/);
  assert.match(contract.body, /Cape Ray and East Point/);
  assert.match(attempt.body, /screw propeller contacted the cable vessel's chain/);
  assert.match(attempt.body, /returned to Charlottetown/);
  assert.equal(completion.date, "1852-11-22");
  assert.match(completion.body, /eleven hours/);
  assert.match(completion.body, /immediate test/);
  assert.match(completion.body, /return date remains unresolved/);
});

test("1852 damage reward retains its evidentiary limit", () => {
  const event = eventBySource("mun-courier-1852-telegraph-damage-reward");
  assert.ok(event);
  assert.match(event.body, /£20/);
  assert.match(event.body, /wires, posts or insulators/);
  assert.match(event.body, /does not identify the damage location or incident date/);
});

test("1852 source locators retain pages and evidence states", () => {
  const expected = new Map([
    ["mun-courier-1853-1852-telegraph-report", ["physical PDF p. 2", "reported"]],
    ["mun-times-1852-telegraph-plan", ["physical PDF p. 2", "reported"]],
    ["mun-statutes-1852-telegraph-company", ["physical PDF pp. 37 to 42, Chapter 6", "verified"]],
    ["mun-statutes-1852-telegraph-protection", ["physical PDF p. 46, Chapter 7", "verified"]],
    ["mun-public-ledger-1852-submarine-contract", ["physical PDF p. 2", "reported"]],
    ["mun-courier-1852-telegraph-damage-reward", ["physical PDF p. 3", "reported"]],
    ["mun-times-1852-cable-attempt", ["physical PDF p. 2", "reported"]],
    ["mun-times-1852-cable-completion", ["physical PDF p. 2", "reported"]]
  ]);
  for (const [sourceId, [pages, status]] of expected) {
    const source = sources.find((entry) => entry.id === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.pages, pages);
    assert.equal(source.status, status);
  }
});

test("1852 research record retains source hashes and date conflict", () => {
  const record = fs.readFileSync(new URL("../research/NP_1852_SYSTEM_RECORD.md", import.meta.url), "utf8");
  for (const hash of [
    "3eac52bdc2ff8c160c87f4270a2c61c4d32d933dc071c8bc47bbb540e99524ec",
    "5e6df2a915f2e9e39c14286649e01d3679c4d20474c25256d189346fbcc0ab43",
    "44f1a50fd0df9ed6396d8551a16b06dcc8dfd18ce06968f871564749eaa840b1",
    "41694a57aec0c58baeb9ee734064dc51b65a2b6d7f42660c7f954ab84149ecf4",
    "e43a6349725d102cd8f9396264edd7da2b0c593d37bd3aedfd2bdd84f699ccc6",
    "f11ddf9402a90993a19a56a3b25e034b2be6af222a25f1d29918919e9f8139d9",
    "d3d80cc507156841fe9879189e62a507c7c236ef5d63ab34d289e01c1b46c5a5"
  ]) {
    assert.match(record, new RegExp(hash));
  }
  assert.match(record, /November 4/);
  assert.match(record, /November 22/);
  assert.match(record, /return date remains unresolved/);
});

test("1852 work item is complete", () => {
  const item = workItems.work_items.find((entry) => entry.id === "NPREG-176");
  assert.ok(item);
  assert.equal(item.status, "done");
  assert.deepEqual(item.dependencies, ["NPREG-175"]);
  assert.deepEqual(item.completion_evidence, ["research/NP_1852_SYSTEM_RECORD.md", "src/data.js", "tests/np-1852-system.test.js"]);
});
