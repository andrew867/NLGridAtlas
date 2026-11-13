import test from "node:test";
import assert from "node:assert/strict";
import { islandTerminalRecords, sources, timeline } from "../src/data.js";

test("Bay d'Espoir GSU history keeps equipment, repair and project states separate", () => {
  const station = islandTerminalRecords.find(({ code }) => code === "BDE");
  const facts = station.facts.flat().join(" ");

  assert.match(facts, /T1 and T2, 1966; T3, 1967; T4, 1968; T5, 2009; T6, 1969; T7, 2016/);
  assert.match(facts, /T5 failed in July 2022.*T6 after its July 2023 failure.*October 2023/);
  assert.match(facts, /T6S.*full spare for Bay d'Espoir T1 to T6 and Granite Canal T1/);
  assert.match(facts, /\$12,324,025.*December 2028/);
  assert.match(facts, /T3.*Insulation deterioration.*potential action/i);

  assert.ok(station.sources.some(({ sourceId }) => sourceId === "nlh-2023-spare-gsu"));
  assert.ok(station.sources.some(({ sourceId }) => sourceId === "nlh-2025-spare-gsu-update"));
  assert.ok(station.sources.some(({ sourceId }) => sourceId === "pub-2025-spare-gsu-order"));
});

test("Bay d'Espoir GSU sources and approval timeline retain exact evidence states", () => {
  const update = sources.find(({ id }) => id === "nlh-2025-spare-gsu-update");
  const order = sources.find(({ id }) => id === "pub-2025-spare-gsu-order");
  const approval = timeline.find(({ sourceId }) => sourceId === "pub-2025-spare-gsu-order");

  assert.equal(update.status, "reported");
  assert.equal(update.pages, "physical PDF pp. 5 to 7");
  assert.equal(order.status, "verified");
  assert.equal(order.pages, "physical PDF pp. 1 to 3");
  assert.equal(approval.date, "2025-02-04");
  assert.equal(approval.status, "verified");
  assert.match(approval.body, /approved a revised \$12,324,025 budget/);
  assert.match(approval.body, /not an installed unit/);
});
