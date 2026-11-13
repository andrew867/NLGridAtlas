import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { islandTerminalRecords, sources, stationProfiles, timeline } from "../src/data.js";

const status = JSON.parse(
  await readFile(new URL("../research/derived/avalon-ct-october-2026-status.json", import.meta.url), "utf8")
);

test("Avalon CT October 2026 record retains exact dates, budget and source hash", () => {
  assert.equal(status.source.sha256, "d8319822fcb6e019b15901e8514c61d0a4a8071bc04e0f0eaa9affb571e8f3cf");
  assert.equal(status.reported_milestones.np_38l_39l_relocation_complete, "2026-07-31");
  assert.equal(status.reported_milestones.transformer_contract_award_milestone, "2026-03-20");
  assert.equal(status.reported_milestones.hitachi_agreement_executed, "2026-03-26");
  assert.equal(status.forecast.commercial_operation_date, "2030-03-07");

  const budget = status.approved_early_execution_budget_cad;
  assert.equal(budget.initial + budget.additional + budget.phase_ii_additional, budget.total);
  assert.equal(budget.total, 95411000);
});

test("Avalon CT status is connected to the source, terminal, timeline and Holyrood history", () => {
  const source = sources.find(({ id }) => id === "nlh-2026-avalon-ct-october-update");
  assert.ok(source);
  assert.equal(source.status, "reported");
  assert.match(source.pages, /3 to 8 and 11/);

  const terminal = islandTerminalRecords.find(({ code }) => code === "HRDGT2");
  const terminalFacts = terminal.facts.flat().join(" ");
  assert.match(terminalFacts, /38L and 39L relocations on July 31, 2026/);
  assert.match(terminalFacts, /three 13\.8 kV, 50 MW/);
  assert.match(terminalFacts, /50\/66\.6\/83\.3 MVA/);
  assert.match(terminalFacts, /Holyrood Bus 8/);
  assert.match(terminalFacts, /redacted in full/);
  assert.match(terminalFacts, /\$95\.411 million/);
  assert.match(terminalFacts, /March 7, 2030/);
  assert.equal(terminal.status, "proposed");

  const event = timeline.find(({ sourceId }) => sourceId === "nlh-2026-avalon-ct-october-update");
  assert.equal(event.date, "2026-07-31");
  assert.equal(event.status, "reported");

  const holyrood = stationProfiles.find(({ code }) => code === "HOL");
  const relocation = holyrood.historyRecords.find(({ label }) => label === "2026 REPORTED LINE RELOCATION COMPLETION");
  assert.ok(relocation);
  assert.match(relocation.facts.flat().join(" "), /38L and 39L relocated.*July 31, 2026/);
});
