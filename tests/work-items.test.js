import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const register = JSON.parse(await readFile(new URL("../docs/work-items.json", import.meta.url), "utf8"));
const plan = await readFile(new URL("../docs/DEVELOPMENT_PLAN.md", import.meta.url), "utf8");

test("work register has unique controlled identifiers", () => {
  const ids = register.work_items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[A-Z]+-[0-9]{3}$/);
});

test("work items use controlled phase, priority, and status values", () => {
  for (const item of register.work_items) {
    assert.ok(register.phase_values.includes(item.phase), `${item.id} has an invalid phase`);
    assert.ok(register.priority_values.includes(item.priority), `${item.id} has an invalid priority`);
    assert.ok(register.status_values.includes(item.status), `${item.id} has an invalid status`);
    assert.ok(item.title.trim(), `${item.id} requires a title`);
    assert.ok(item.scope.trim(), `${item.id} requires scope`);
  }
});

test("work-item dependencies resolve", () => {
  const itemById = new Map(register.work_items.map((item) => [item.id, item]));
  for (const item of register.work_items) {
    for (const dependency of item.dependencies) {
      assert.ok(itemById.has(dependency), `${item.id} has unknown dependency ${dependency}`);
      assert.notEqual(dependency, item.id, `${item.id} cannot depend on itself`);
      assert.ok(itemById.get(dependency).phase <= item.phase, `${item.id} depends on later-phase item ${dependency}`);
    }
  }
});

test("blocked and done work items record evidence", () => {
  for (const item of register.work_items) {
    if (item.status === "blocked") assert.ok(item.blocker?.trim(), `${item.id} requires a blocker`);
    if (item.status === "done") assert.ok(item.completion_evidence.length, `${item.id} requires completion evidence`);
  }
});

test("every work item is scheduled in the development plan", () => {
  for (const item of register.work_items) {
    assert.match(plan, new RegExp(`(^|\\n)- ${item.id}(\\n|$)`), `${item.id} is missing from the phased plan`);
  }
});
