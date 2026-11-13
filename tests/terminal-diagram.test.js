import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { islandTerminalRecords } from "../src/data.js";
import { renderTerminalDiagram } from "../src/terminal-diagram.js";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

test("every major island record has a sourced connection diagram", () => {
  for (const record of islandTerminalRecords) {
    assert.ok(record.diagram, `${record.code} requires a diagram`);
    assert.ok(record.diagram.buses.length > 0, `${record.code} requires a bus`);
    assert.ok(record.diagram.label, `${record.code} requires an as-of label`);
    const busIds = new Set(record.diagram.buses.map((bus) => bus.id));
    for (const transformer of record.diagram.transformers) {
      assert.ok(busIds.has(transformer.from), `${record.code} ${transformer.label} has an unknown source bus`);
      assert.ok(busIds.has(transformer.to), `${record.code} ${transformer.label} has an unknown destination bus`);
    }
    for (const circuit of record.diagram.circuits) {
      assert.ok(busIds.has(circuit.bus), `${record.code} ${circuit.label} has an unknown bus`);
    }
  }
});

test("terminal diagrams link documented routes to the opposite station or island view", () => {
  const sunnyside = islandTerminalRecords.find((record) => record.code === "SUN");
  const html = renderTerminalDiagram(sunnyside.diagram, escapeHtml);
  assert.match(html, /data-hydro-terminal-record="BDE"/);
  assert.match(html, /data-hydro-terminal-record="CBC"/);
  assert.match(html, /data-island-circuit="TL203"/);
  assert.match(html, /75\/100\/125 MVA/);
});

test("Come By Chance renders four filed capacitor banks", () => {
  const comeByChance = islandTerminalRecords.find((record) => record.code === "CBC");
  assert.equal(comeByChance.diagram.shunts.length, 4);
  assert.ok(comeByChance.diagram.shunts.every((bank) => bank.rating === "38.35 MVAR"));
  assert.equal(comeByChance.diagram.buses[0].segments.length, 2);
  assert.equal(comeByChance.diagram.buses[0].tie.label, "B1B2 tie");
  assert.equal(comeByChance.diagram.buses[1].tie.label, "52-3 N.O.");
  assert.equal(comeByChance.diagram.buses[1].tie.open, true);
  assert.ok(comeByChance.facts.some(([, value]) => /cancelled/.test(value) && /\$0/.test(value)));
  assert.ok(comeByChance.facts.some(([, value]) => /planned for Q4 2026/.test(value) && /Braya schedule confirmation/.test(value)));
  const html = renderTerminalDiagram(comeByChance.diagram, escapeHtml);
  assert.match(html, /C1/);
  assert.match(html, /C4/);
  assert.match(html, /class="terminal-bus-tie"/);
  assert.match(html, />B1B2 tie</);
  assert.match(html, /terminal-bus-tie terminal-bus-tie-open/);
  assert.match(html, />52-3 N\.O\.</);
  assert.match(html, /data-hydro-terminal-record="WAV"/);
});

test("Stony Brook renders the filed split bus and B1 ring section", () => {
  const stonyBrook = islandTerminalRecords.find((record) => record.code === "STB");
  assert.ok(stonyBrook);
  assert.equal(stonyBrook.diagram.buses[0].tie.label, "B1B2 N.C.");
  assert.deepEqual(stonyBrook.diagram.buses[0].segments.map(({ label }) => label), ["B2", "B1"]);
  assert.deepEqual(stonyBrook.diagram.rings[0].breakers.map(({ label }) => label), ["B1L31", "L05L31", "L05L35", "B1L35"]);
  assert.deepEqual(stonyBrook.diagram.rings[0].circuits.map(({ label }) => label), ["TL231", "TL205", "TL235"]);
  assert.ok(stonyBrook.sources.some((source) => source.sourceId === "nlh-terminal-risk-2017" && source.pages.includes("42")));
  const html = renderTerminalDiagram(stonyBrook.diagram, escapeHtml);
  assert.match(html, /class="terminal-ring voltage-230"/);
  assert.match(html, />B1B2 N\.C\.</);
  assert.match(html, />B1L31</);
  assert.match(html, />L05L31</);
  assert.match(html, />L05L35</);
  assert.match(html, />B1L35</);
  assert.match(html, /data-hydro-terminal-record="GFC"/);
});

test("Buchans renders the filed five-breaker ring and 66 kV line breakers", () => {
  const buchans = islandTerminalRecords.find((record) => record.code === "BUC");
  assert.ok(buchans);
  assert.deepEqual(buchans.diagram.rings[0].breakers.map(({ label }) => label), ["B1L05", "L05L33", "L32L33", "L28L32", "B1L28"]);
  assert.deepEqual(buchans.diagram.rings[0].circuits.map(({ label }) => label), ["TL205", "TL233", "TL232", "TL228"]);
  assert.deepEqual(buchans.diagram.circuits.map(({ label, breaker }) => [label, breaker]), [["TL264", "B2L64"], ["TL280", "B2L80"]]);
  assert.ok(buchans.sources.some((source) => source.sourceId === "nlh-buchans-storm-2013" && source.pages.includes("150")));
  assert.ok(buchans.sources.some((source) => source.sourceId === "nlh-terminal-risk-2017" && source.pages.includes("9")));
  const html = renderTerminalDiagram(buchans.diagram, escapeHtml);
  assert.match(html, /class="terminal-ring voltage-230"/);
  assert.match(html, />B1L05</);
  assert.match(html, />L05L33</);
  assert.match(html, />L32L33</);
  assert.match(html, />L28L32</);
  assert.match(html, />B1L28</);
  assert.match(html, />B2L64</);
  assert.match(html, />B2L80</);
  assert.match(html, /data-hydro-terminal-record="BBK"/);
  assert.match(html, /data-hydro-terminal-record="MAS"/);
});

test("Deer Lake renders the filed 230 kV, 138 kV ring and 66 kV breaker records", () => {
  const deerLake = islandTerminalRecords.find((record) => record.code === "DLK");
  assert.ok(deerLake);
  assert.deepEqual(deerLake.diagram.transformers.map(({ label, rating }) => [label, rating]), [
    ["T2", "45/60/75 MVA"],
    ["T1", "25/33.3/41.7 MVA"]
  ]);
  assert.deepEqual(deerLake.diagram.circuits.map(({ label, breaker }) => [label, breaker || null]), [
    ["TL247", "B3L47"],
    ["TL248", "B3L48"],
    ["TL226", "B2L26"],
    ["TL225", "B2L25"]
  ]);
  assert.deepEqual(deerLake.diagram.rings[0].breakers.map(({ label }) => label), ["B1L39", "L39T2", "L45T2", "B1L45"]);
  assert.deepEqual(deerLake.diagram.rings[0].circuits.map(({ label }) => label), ["TL239", "TL245"]);
  assert.equal(deerLake.diagram.transformers[0].toY, deerLake.diagram.rings[0].y);
  assert.ok(deerLake.sources.some((source) => source.sourceId === "nlh-system-design-2015" && source.pages.includes("4")));
  assert.ok(deerLake.sources.some((source) => source.sourceId === "nlh-deer-lake-ring-breakers-2015" && source.pages.includes("37")));
  assert.ok(deerLake.sources.some((source) => source.sourceId === "nlh-deer-lake-event-2013" && source.pages.includes("191")));
  assert.ok(deerLake.sources.some((source) => source.sourceId === "nlh-deer-lake-operating-2014" && source.pages.includes("770")));
  const html = renderTerminalDiagram(deerLake.diagram, escapeHtml);
  assert.match(html, /class="terminal-ring voltage-138"/);
  assert.match(html, /class="terminal-line-breaker"/);
  assert.match(html, />B3L47</);
  assert.match(html, />B3L48</);
  assert.match(html, />B1L39</);
  assert.match(html, />L39T2</);
  assert.match(html, />L45T2</);
  assert.match(html, />B1L45</);
  assert.match(html, />B2L26</);
  assert.match(html, />B2L25</);
  assert.match(html, /data-hydro-terminal-record="CAT"/);
  assert.match(html, /data-hydro-terminal-record="BRH"/);
  assert.match(html, /data-hydro-terminal-record="HOW"/);
  assert.match(html, /data-hydro-terminal-record="DLP"/);
});

test("Massey Drive renders the filed split buses, ties and terminal breakers", () => {
  const masseyDrive = islandTerminalRecords.find((record) => record.code === "MAS");
  assert.ok(masseyDrive);
  assert.deepEqual(masseyDrive.diagram.buses[0].segments.map(({ label }) => label), ["B1 / 230 kV", "B5 / 230 kV"]);
  assert.deepEqual(masseyDrive.diagram.buses[0].ties.map(({ label }) => label), ["B1B5 N.C."]);
  assert.deepEqual(masseyDrive.diagram.buses[1].segments.map(({ label }) => label), ["B4 / CUSTOMER / 66 kV", "B2 / NP / 66 kV", "B3 / NP / 66 kV"]);
  assert.deepEqual(masseyDrive.diagram.buses[1].ties.map(({ label, open }) => [label, open || false]), [["B2B4-1 N.O.", true], ["B2B3-1", false]]);
  assert.deepEqual(masseyDrive.diagram.transformers.map(({ label, toBreaker }) => [label, toBreaker]), [["T1", "B4T1"], ["T2", "B2T2"], ["T3", "B3T3"]]);
  assert.deepEqual(masseyDrive.diagram.circuits.slice(0, 3).map(({ label, breaker }) => [label, breaker]), [["TL248", "B1L48"], ["TL228", "B1L28"], ["TL211", "B5L11"]]);
  assert.ok(masseyDrive.sources.some((source) => source.sourceId === "nlh-terminal-risk-2017" && source.pages.includes("28")));
  assert.ok(masseyDrive.sources.some((source) => source.sourceId === "nlh-massey-industrial-2018" && source.pages.includes("7")));
  const html = renderTerminalDiagram(masseyDrive.diagram, escapeHtml);
  assert.match(html, />B1B5 N\.C\.</);
  assert.match(html, />B2B4-1 N\.O\.</);
  assert.match(html, />B2B3-1</);
  assert.match(html, />B1L48</);
  assert.match(html, />B1L28</);
  assert.match(html, />B5L11</);
  assert.match(html, />B4T1</);
  assert.match(html, />B2T2</);
  assert.match(html, />B3T3</);
  assert.match(html, /data-hydro-terminal-record="DLP"/);
});

test("Stephenville renders the filed circuit switcher and three-breaker 66 kV ring", () => {
  const stephenville = islandTerminalRecords.find((record) => record.code === "STV");
  assert.ok(stephenville);
  assert.deepEqual(stephenville.diagram.rings[0].breakers.map(({ label }) => label), ["L405T4", "B2T3", "B2L405"]);
  assert.deepEqual(stephenville.diagram.rings[0].circuits.map(({ label }) => label), ["405L"]);
  assert.equal(stephenville.diagram.transformers.find(({ label }) => label === "T3").toY, 365);
  const html = renderTerminalDiagram(stephenville.diagram, escapeHtml);
  assert.match(html, />B1L09 CS</);
  assert.match(html, />L405T4</);
  assert.match(html, />B2T3</);
  assert.match(html, />B2L405</);
  assert.match(html, /data-hydro-terminal-record="HAR"/);
  assert.match(html, /y2="365"/);
});

test("Bottom Brook renders the four-rung breaker-and-one-half yard and separate Station 1", () => {
  const bottomBrook = islandTerminalRecords.find((record) => record.code === "BBK");
  assert.ok(bottomBrook);
  assert.equal(bottomBrook.diagram.diameters.length, 4);
  assert.deepEqual(bottomBrook.diagram.diameters.flatMap(({ breakers }) => breakers.map(({ label }) => label)), ["B5B54", "B44B54", "B4B44", "B5B53", "B43B53", "B4B43", "B5B52", "B42B52", "B4B42", "B5B51", "B41B51", "B4B41"]);
  assert.deepEqual(bottomBrook.diagram.diameters.flatMap(({ connections }) => connections.map(({ label }) => label)), ["TL211", "T1", "TL233", "T3", "TL269", "Line 2", "Line 1", "TL209"]);
  assert.equal(bottomBrook.additionalDiagrams.length, 1);
  assert.deepEqual(bottomBrook.additionalDiagrams[0].circuits.map(({ label, breaker }) => [label, breaker]), [["TL214", "B2L14"], ["TL250", "B3L50"], ["400L", "B6L400"]]);
  const ts2 = renderTerminalDiagram(bottomBrook.diagram, escapeHtml);
  const ts1 = renderTerminalDiagram(bottomBrook.additionalDiagrams[0], escapeHtml);
  assert.match(ts2, /class="terminal-diameter/);
  assert.match(ts2, />B41B51</);
  assert.match(ts2, /data-hydro-terminal-record="STV"/);
  assert.match(ts1, />B2B3 N\.O\.</);
  assert.match(ts1, />B2L14</);
  assert.match(ts1, />B3L50</);
  assert.match(ts1, />B6L400</);
});

test("Bay d'Espoir separates the individual unit terminals from the Station 2 buses", () => {
  const bayDEspoir = islandTerminalRecords.find((record) => record.code === "BDE");
  assert.equal(bayDEspoir.diagram.buses[1].kind, "terminals");
  assert.deepEqual(bayDEspoir.diagram.buses[1].segments.map(({ x }) => x), [200, 380, 560, 740]);
  assert.deepEqual(bayDEspoir.diagram.transformers.map(({ label }) => label), ["T1 to T3", "T4", "T5 and T6", "T7", "T10", "T12", "T11"]);
  assert.deepEqual(bayDEspoir.diagram.generators.map(({ label }) => label), ["G1 to G3", "G4", "G5 and G6", "G7"]);
  assert.ok(bayDEspoir.diagram.circuits.some(({ label, destination }) => label === "TL220" && /Barachois/.test(destination)));
  const html = renderTerminalDiagram(bayDEspoir.diagram, escapeHtml);
  assert.match(html, /terminal-bus-terminals/);
  assert.match(html, /x1="162" y1="375" x2="238" y2="375"/);
  assert.match(html, /circle cx="990"/);
  assert.match(html, /data-hydro-terminal-record="USL"/);
});

test("Soldiers Pond separates converter poles from synchronous condensers", () => {
  const soldiersPond = islandTerminalRecords.find((record) => record.code === "SDP");
  const html = renderTerminalDiagram(soldiersPond.diagram, escapeHtml);
  assert.match(html, /class="terminal-converter"/);
  assert.match(html, />LCC</);
  assert.match(html, />Pole 1</);
  assert.match(html, />SC1</);
  assert.match(html, />SC</);
  assert.match(html, /175 MVAr/);
  assert.doesNotMatch(html, /terminal-transformer/);
});

test("proposed Avalon CT terminal retains the July 2026 interconnection distances", () => {
  const avalonCt = islandTerminalRecords.find((record) => record.code === "HRDGT2");
  assert.equal(avalonCt.status, "proposed");
  assert.deepEqual(avalonCt.diagram.circuits.map(({ label, destination }) => [label, destination]), [
    ["TL218", "Oxen Pond, 37 km"],
    ["Bus extension", "Holyrood, 0.5 km"]
  ]);
  assert.equal(avalonCt.diagram.transformers[0].rating, "13.8/230 kV");
  assert.equal(avalonCt.diagram.generators[0].rating, "150 MW nominal");
  assert.ok(avalonCt.sources.every((source) => source.pages));
});

test("four hydro generating stations have individual sourced records", () => {
  const expected = {
    USL: { name: "Upper Salmon Generating Station", rating: "84 MW", circuits: ["TL234", "TL263"] },
    GRC: { name: "Granite Canal Generating Station", rating: "40 MW", circuits: ["TL270"] },
    CAT: { name: "Cat Arm Generating Station", rating: "127 MW", circuits: ["TL247"] },
    HLA: { name: "Hinds Lake Generating Station", rating: "75 MW", circuits: ["TL243"] }
  };

  for (const [code, recordExpected] of Object.entries(expected)) {
    const record = islandTerminalRecords.find((entry) => entry.code === code);
    assert.ok(record, `${code} requires an individual record`);
    assert.equal(record.name, recordExpected.name);
    assert.equal(record.diagram.generators[0].rating, recordExpected.rating);
    assert.deepEqual(record.diagram.circuits.map((circuit) => circuit.label), recordExpected.circuits);
    assert.ok(record.sources.every((source) => source.pages), `${code} requires page-level sources`);
  }
});

test("Cat Arm TL247 opens the documented Deer Lake endpoint", () => {
  const catArm = islandTerminalRecords.find((record) => record.code === "CAT");
  const html = renderTerminalDiagram(catArm.diagram, escapeHtml);
  assert.match(html, /data-hydro-terminal-record="DLK"/);
  assert.match(html, /Deer Lake/);
});

test("Grand Falls Frequency Converter has a distinct TL235 terminal record", () => {
  const converter = islandTerminalRecords.find((record) => record.code === "GFC");
  assert.ok(converter);
  assert.equal(converter.name, "Grand Falls Frequency Converter");
  assert.deepEqual(converter.diagram.circuits, [
    { label: "TL235", destination: "Stony Brook", bus: "b1", destinationCode: "STB" }
  ]);
  assert.match(converter.facts.flat().join(" "), /0\.620 km.*322\.2 MVA.*86\.1 MVA.*64\.3 MVA/);
  assert.ok(converter.sources.every((source) => source.pages));
});

test("Deer Lake Power separates the 60 Hz generating group from the frequency converter", () => {
  const dlp = islandTerminalRecords.find((record) => record.code === "DLP");
  assert.ok(dlp);
  assert.deepEqual(dlp.diagram.generators, [{ label: "DLPG1-7", rating: "81.1 MW", bus: "b1" }]);
  assert.deepEqual(dlp.diagram.circuits.map(({ label, destination, destinationCode }) => ({ label, destination, destinationCode })), [
    { label: "L1", destination: "Massey Drive", destinationCode: "MAS" },
    { label: "TL225", destination: "Deer Lake", destinationCode: "DLK" }
  ]);
  assert.match(dlp.facts.flat().join(" "), /frequency converter.*separately.*18\.0 MW/i);
  assert.ok(dlp.sources.some((source) => source.sourceId === "nlh-dlp-assets-2018" && source.pages.includes("23")));
  assert.ok(dlp.sources.some((source) => source.sourceId === "nlh-near-term-generation-2017" && source.pages.includes("61")));
});

test("Great Northern Peninsula generation records separate current backup from retired sites", () => {
  const stAnthony = islandTerminalRecords.find((record) => record.code === "SAD");
  assert.ok(stAnthony);
  assert.deepEqual(stAnthony.diagram.generators, [{ label: "Diesel plant", rating: "9.7 MW", bus: "b1" }]);
  assert.deepEqual(stAnthony.diagram.circuits, [{ label: "TL261", destination: "St. Anthony Airport", bus: "b1", destinationCode: "SAA" }]);
  assert.match(stAnthony.facts.flat().join(" "), /8,850 kW.*850 kW mobile/i);
  assert.ok(stAnthony.sources.some((source) => source.sourceId === "nlh-planning-2024" && source.pages.includes("42")));

  const roddickton = islandTerminalRecords.find((record) => record.code === "RWC");
  assert.ok(roddickton);
  assert.deepEqual(roddickton.diagram.generators.map(({ label, rating }) => ({ label, rating })), [
    { label: "Woodchip", rating: "5,000 kW" },
    { label: "Diesel plant", rating: "2,350 kW" },
    { label: "Mini-hydro", rating: "425 kW" }
  ]);
  assert.match(roddickton.facts.flat().join(" "), /450 kW black-start.*850 kW mobile/i);
  assert.match(roddickton.facts.flat().join(" "), /abandonments.*relocated to St\. Anthony/i);
  assert.ok(roddickton.sources.some((source) => source.sourceId === "pub-roddickton-generation-2004" && source.pages.includes("11")));

  const airport = islandTerminalRecords.find((record) => record.code === "SAA");
  assert.ok(airport.diagram.circuits.some((circuit) => circuit.label === "TL257" && circuit.destinationCode === "RWC"));
  assert.ok(airport.diagram.circuits.some((circuit) => circuit.label === "TL261" && circuit.destinationCode === "SAD"));
});

test("plant-assignment records cite physical PDF page 80", () => {
  for (const code of ["USL", "GRC", "CAT", "HLA"]) {
    const record = islandTerminalRecords.find((entry) => entry.code === code);
    const systemSource = record.sources.find((source) => source.sourceId === "gra-2013-v2");
    assert.equal(systemSource.pages, "physical PDF p. 80");
  }
});

test("Newfoundland Power circuit links open the station browser", () => {
  const diagram = {
    label: "Station link test",
    buses: [{ id: "b1", label: "bus", voltage: "66 kV" }],
    transformers: [],
    circuits: [{ label: "15L", destination: "Stamp's Lane", bus: "b1", stationCode: "SLA" }]
  };
  const html = renderTerminalDiagram(diagram, escapeHtml);
  assert.match(html, /href="#station-browser"/);
  assert.match(html, /data-station-record="SLA"/);
});

test("station-profile destination codes open the station browser", () => {
  const diagram = {
    label: "Princeton Pond switching point",
    buses: [{ id: "b1", label: "bus 1", voltage: "138 kV" }],
    transformers: [],
    circuits: [{ label: "123L", destination: "Catalina", destinationCode: "CAT", bus: "b1" }]
  };
  const html = renderTerminalDiagram(diagram, escapeHtml, "station");
  assert.match(html, /data-station-record="CAT"/);
  assert.doesNotMatch(html, /data-hydro-terminal-record="CAT"/);
});

test("diagram text masks conductor strokes", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(css, /\.terminal-diagram text\s*\{[^}]*paint-order:\s*stroke fill/s);
  assert.match(css, /\.terminal-diagram text\s*\{[^}]*stroke-width:\s*8px/s);
});

test("bus labels do not repeat their voltage", () => {
  const markup = renderTerminalDiagram({
    label: "bus label test",
    buses: [
      { id: "b1", label: "66 kV bus", voltage: "66 kV" },
      { id: "b2", label: "bus", voltage: "25 kV" }
    ],
    transformers: [],
    circuits: []
  }, escapeHtml, "station");
  assert.match(markup, />66 kV bus<\/text>/);
  assert.match(markup, />25 kV bus<\/text>/);
  assert.doesNotMatch(markup, /66 kV \/ 66 kV bus/);
});

test("transformers spanning an intermediate bus render a crossing break", async () => {
  const diagram = {
    label: "Three-bus crossing test",
    buses: [{ id: "b1", label: "high", voltage: "138 kV" }, { id: "b2", label: "middle", voltage: "66 kV" }, { id: "b3", label: "low", voltage: "12.5 kV" }],
    transformers: [{ label: "T1", rating: "25 MVA", from: "b1", to: "b3" }],
    circuits: []
  };
  const html = renderTerminalDiagram(diagram, escapeHtml, "station");
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(html, /class="terminal-bus-crossing-mask"[^>]*y="365"/);
  assert.match(html, /circle cx="560" cy="257" r="20"/);
  assert.match(css, /\.terminal-bus-crossing-mask\s*\{[^}]*fill:/s);
});

test("western and northern rural station records retain filed transformation and routes", () => {
  const expected = {
    BRH: ["138/66 kV", ["TL239", "TL259", "TL226"]],
    PBR: ["138/66 kV", ["TL259", "TL241", "TL262"]],
    PLP: ["138/12.5 kV", ["TL241", "TL244"]],
    BRC: ["138/12.5 kV", ["TL244", "TL256"]],
    SAA: ["138/69 kV", ["TL256", "TL257", "TL257B", "TL261"]],
    HAW: ["5/6.7 MVA", ["TL221"]],
    HOW: ["7.5/10/12.5 MVA", ["TL245", "TL243", "TL224", "TL251"]],
    SBR: ["138/25 kV", ["TL222", "TL222"]],
    DOY: ["138/66 kV", ["TL214", "TL215"]],
    GRB: ["138/25 kV", ["TL250"]],
    EHW: ["69/25 kV", ["TL220", "TL220"]]
  };

  for (const [code, [transformerDisplay, circuits]] of Object.entries(expected)) {
    const record = islandTerminalRecords.find((entry) => entry.code === code);
    assert.ok(record, `${code} requires an individual record`);
    assert.equal(record.diagram.transformers[0].rating, transformerDisplay);
    assert.deepEqual(record.diagram.circuits.map((circuit) => circuit.label), circuits);
    assert.ok(record.sources.every((source) => source.pages), `${code} requires page-level sources`);
  }
});

test("Hawke's Bay record separates station transformation, backup generation and restoration use", () => {
  const hawkesBay = islandTerminalRecords.find((record) => record.code === "HAW");
  assert.ok(hawkesBay);
  assert.deepEqual(hawkesBay.diagram.transformers.map(({ label, rating }) => ({ label, rating })), [
    { label: "T1", rating: "5/6.7 MVA" },
    { label: "T2", rating: "2.5/3.3 MVA" }
  ]);
  assert.match(hawkesBay.facts.flat().join(" "), /two 2\.5 MW diesel units; 5 MW total/i);
  assert.match(hawkesBay.facts.flat().join(" "), /6\.34 MW transformer peak.*15 MVA mobile transformer/i);
  assert.match(hawkesBay.facts.flat().join(" "), /open both Hawke's Bay feeders.*diesel online/i);
  assert.ok(hawkesBay.sources.some((source) => source.sourceId === "nlh-gnp-reliability-2026" && source.pages.includes("15 to 16")));
  assert.ok(hawkesBay.sources.some((source) => source.sourceId === "nlh-hawkes-diesel-2005" && source.pages.includes("102")));
  assert.ok(hawkesBay.sources.some((source) => source.sourceId === "nlh-gnp-operation-2011" && source.pages.includes("50 to 56")));
});
