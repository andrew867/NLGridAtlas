import assert from "node:assert/strict";
import test from "node:test";
import { components, sources, staticClaims, stationProfiles, timeline } from "../src/data.js";

const stationText = (code) => JSON.stringify(stationProfiles.find((candidate) => candidate.code === code));

test("1960 record does not invent a demand value", () => {
  assert.equal(timeline.some((entry) => entry.date === "1960" && entry.category === "load"), false);
});

test("Molloy's Lane construction and switchgear failure remain distinct", () => {
  const event = timeline.find((entry) => entry.date === "1960" && /Molloy's Lane Substation/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /66 kV transmission and 12\.5 kV distribution/);
  assert.match(event.body, /early-1970s switchgear failure.*foundation, walls and roof/);
  assert.match(stationText("MOL"), /1960 CONTROL BUILDING.*EARLY-1970S SWITCHGEAR FAILURE/);
});

test("Ridge Road construction conflict is not flattened", () => {
  const event = timeline.find((entry) => entry.date === "1960 or 1963");
  assert.ok(event);
  assert.equal(event.status, "unresolved");
  assert.match(event.body, /2027 capital filing.*1960.*2007 capital filing.*1963/);
  assert.match(stationText("RRD"), /1960 \/ 1963 CONSTRUCTION-DATE CONFLICT/);
  const stamp = timeline.find((entry) => entry.date === "1963" && /Stamp's Lane Substation/.test(entry.title));
  assert.ok(stamp);
  assert.doesNotMatch(stamp.title, /Ridge Road/);
});

test("1960 line records retain topology and conductor detail", () => {
  const event = timeline.find((entry) => entry.date === "1960" && /Robinsons 403L tap/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /4\.0 km.*403L.*46 single-pole structures.*1\/0 ACSR/);
  assert.match(event.body, /5\.4 km, 4\.16 kV.*Ranger Bight Road pump house.*communications tower/);
  assert.match(stationText("ROB"), /Original construction.*1960.*46 single-pole structures.*1\/0 ACSR/);
});

test("Heart's Content record separates published capacity values", () => {
  const event = timeline.find((entry) => entry.date === "1960" && /replacement Heart's Content/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /2\.4 MW.*2,370 kW.*46\.9 m/);
  assert.match(event.body, /English Electric.*Bruce Peebles.*remotely controlled from New Chelsea/);
  assert.match(stationText("HCT"), /1960 REPLACEMENT PLANT.*2\.4 MW.*2,370 kW/);
});

test("Holyrood T6 date remains a manufacturing record", () => {
  const record = components["hrd-t6"];
  assert.ok(record);
  assert.match(record.summary, /manufactured T6 in 1960.*not a Holyrood in-service date/);
  assert.match(JSON.stringify(record.data), /25\/33\.3\/41\.7 MVA.*2009 oil results/);
  const event = timeline.find((entry) => entry.date === "1960 manufacture");
  assert.match(event.body, /date applies to manufacture.*does not state.*entered service/);
});

test("Bishop's Falls record identifies the operational use", () => {
  const event = timeline.find((entry) => entry.date === "1960" && /Bishop's Falls diesel shop/.test(entry.title));
  assert.ok(event);
  assert.match(event.body, /40 by 60 feet.*diesel-generator maintenance.*critical spares/);
});

test("1960 system claim retains exact source pages", () => {
  const claim = staticClaims.find((candidate) => candidate.id === "np-1960-system-record");
  assert.ok(claim);
  assert.equal(claim.status, "unresolved");
  assert.equal(claim.sources.length, 9);
  assert.equal(sources.find((source) => source.id === "np-1960-ridge-road")?.pages, "physical PDF pp. 105 and 511");
  assert.equal(sources.find((source) => source.id === "np-1960-403l-rob")?.pages, "physical PDF p. 394");
  assert.equal(sources.find((source) => source.id === "nlh-1960-makkovik-l1")?.pages, "physical PDF p. 232");
  assert.equal(sources.find((source) => source.id === "nlh-1960-holyrood-t6")?.pages, "physical PDF pp. 699 to 700");
  assert.equal(sources.find((source) => source.id === "nlh-1960-bishops-falls-shop")?.pages, "physical PDF pp. 640 to 641");
});
