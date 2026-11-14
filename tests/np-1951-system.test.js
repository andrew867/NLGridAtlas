import assert from "node:assert/strict";
import test from "node:test";
import { sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("Mobile retains its original 1951 plant and civil equipment", () => {
  const plant = timeline.find((entry) => entry.date === "1950 or 1951" && /Mobile hydro plant/.test(entry.title));
  const civil = timeline.find((entry) => entry.date === "1951" && /Mobile development civil works/.test(entry.title));
  assert.ok(plant);
  assert.ok(civil);
  assert.equal(plant.status, "unresolved");
  assert.match(plant.body, /2013 plant history dates powerhouse commissioning to 1950.*Later capital records date the plant and original 11\.0 MVA equipment to 1951/);
  assert.match(plant.body, /2026 filing also gives both 1950 and 1951 for MOP Substation.*2027 filing gives 1951/);
  assert.match(plant.body, /13,000 hp.*Canadian Westinghouse/);
  assert.match(civil.body, /diversion dam.*canals.*wood-stave and steel penstocks.*surge tank.*powerhouse/);
  assert.match(civil.body, /1,568 m.*454 m steel section.*1,114 m.*fibreglass/);
  assert.match(stationText("MOP"), /1951 ORIGINAL PLANT AND ELECTRICAL EQUIPMENT/);
  assert.match(stationText("MOP"), /1951 ORIGINAL CIVIL WORKS/);
  assert.match(stationText("MOP"), /1951 ORIGINAL STEEL PENSTOCK/);
});

test("MOP-T1 retains its station-specific rating and construction-year conflict", () => {
  const text = stationText("MOP");
  assert.match(text, /MOP-T1.*10 MVA.*66\/6\.9 kV/);
  assert.match(text, /2013 plant history gives 1950.*later plant and equipment records give 1951/);
  assert.match(text, /2026 project summary gives 1951.*Appendix E.*gives 1950.*2027 filing gives 1951/);
  assert.match(text, /Westinghouse.*installed at Mobile Plant in 1951/);
});

test("20L retains the 1951 line record", () => {
  const event = timeline.find((entry) => entry.date === "1951" && /20L connected/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /66 kV radial line.*20\.1 km.*H-frame/);
  assert.match(event.body, /more than 1,700 customers.*Morris.*Rocky Pond.*Horse Chops.*Cape Broyle/);
  assert.match(stationText("MOB"), /20\.1 km.*H-frame wood-pole construction.*built in 1951/);
});

test("Tors Cove retains the 1951 G3 addition", () => {
  const event = timeline.find((entry) => entry.date === "1951" && /Tors Cove added/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /2,780 kVA English Electric.*3,550 hp Francis/);
  assert.match(event.body, /2,500 kW at 90% power factor.*6\.5 MW/);
  assert.match(stationText("TCV"), /1951 G3 ADDITION/);
});

test("Horse Chops keeps manufacture separate from installation", () => {
  const event = timeline.find((entry) => entry.date === "1951" && /Horse Chops step-up transformer/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /Reliance Electric.*asset 200165.*8\.0 MVA.*6\.9 kV to 66 kV/);
  assert.match(event.body, /manufacturing year, not the installation date/);
});

test("1951 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1951-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 13);
  assert.equal(sources.find((source) => source.id === "np-1950-mobile-commissioning")?.pages, "physical PDF p. 136");
  assert.equal(sources.find((source) => source.id === "np-1951-mobile-generating-plant")?.pages, "physical PDF pp. 480, 483 to 484 and 489 to 490");
  assert.equal(sources.find((source) => source.id === "np-1951-mobile-civil")?.pages, "physical PDF p. 520");
  assert.equal(sources.find((source) => source.id === "np-1951-tors-cove-g3")?.pages, "physical PDF p. 206");
  assert.equal(sources.find((source) => source.id === "np-1951-property-record")?.pages, "physical PDF p. 138");
  assert.equal(sources.find((source) => source.id === "np-1951-red-cliff-sheds")?.pages, "physical PDF p. 215");
});
