function spread(index, count, left = 170, right = 950) {
  if (count <= 1) return (left + right) / 2;
  return left + ((right - left) * index) / (count - 1);
}

function circuitLink(circuit, body, escapeHtml) {
  if (circuit.link === false) return body;
  const label = escapeHtml(`${circuit.label} to ${circuit.destination}`);
  if (circuit.destinationCode) {
    return `<a href="#hydro-terminal-browser" data-hydro-terminal-record="${escapeHtml(circuit.destinationCode)}" aria-label="Open ${label}">${body}</a>`;
  }
  return `<a href="#island-backbone" data-island-circuit="${escapeHtml(circuit.label)}" aria-label="Locate ${label} on the island backbone">${body}</a>`;
}

function transformerSymbol(transformer, index, count, buses, escapeHtml) {
  const from = buses.find((bus) => bus.id === transformer.from);
  const to = buses.find((bus) => bus.id === transformer.to);
  if (!from || !to) return "";
  const x = spread(index, count, 300, 820);
  const middle = (from.y + to.y) / 2;
  return `<g class="terminal-transformer" role="img" aria-label="${escapeHtml(`${transformer.label}, ${transformer.rating}`)}">
    <line x1="${x}" y1="${from.y}" x2="${x}" y2="${middle - 28}" />
    <circle cx="${x}" cy="${middle - 13}" r="20" />
    <circle cx="${x}" cy="${middle + 13}" r="20" />
    <line x1="${x}" y1="${middle + 28}" x2="${x}" y2="${to.y}" />
    <text class="terminal-device-name" x="${x}" y="${middle - 72}">${escapeHtml(transformer.label)}</text>
    <text class="terminal-device-rating" x="${x}" y="${middle - 52}">${escapeHtml(transformer.rating)}</text>
  </g>`;
}

function circuitSymbol(circuit, index, count, bus, direction, escapeHtml) {
  const x = spread(index, count);
  const lineEnd = bus.y + direction * 68;
  const labelY = bus.y + direction * 88;
  const destinationY = bus.y + direction * 108;
  const body = `<g class="terminal-circuit">
    <line x1="${x}" y1="${bus.y}" x2="${x}" y2="${lineEnd}" />
    <text class="terminal-circuit-id" x="${x}" y="${labelY}">${escapeHtml(circuit.label)}</text>
    <text class="terminal-circuit-destination" x="${x}" y="${destinationY}">${escapeHtml(circuit.destination)}</text>
  </g>`;
  return circuitLink(circuit, body, escapeHtml);
}

function accessorySymbol(accessory, index, count, bus, type, escapeHtml) {
  const fourShuntPositions = [190, 390, 730, 930];
  const x = type === "shunt" && count === 4
    ? fourShuntPositions[index]
    : spread(index, count, 190, 930);
  const top = bus.y + 34;
  if (type === "generator") {
    return `<g class="terminal-accessory" role="img" aria-label="${escapeHtml(`${accessory.label}, ${accessory.rating}`)}">
      <line x1="${x}" y1="${bus.y}" x2="${x}" y2="${top + 13}" />
      <circle cx="${x}" cy="${top + 42}" r="28" />
      <text class="terminal-accessory-symbol" x="${x}" y="${top + 49}">G</text>
      <text class="terminal-device-name" x="${x}" y="${top + 87}">${escapeHtml(accessory.label)}</text>
      <text class="terminal-device-rating" x="${x}" y="${top + 106}">${escapeHtml(accessory.rating)}</text>
    </g>`;
  }
  return `<g class="terminal-accessory" role="img" aria-label="${escapeHtml(`${accessory.label}, ${accessory.rating}`)}">
    <line x1="${x}" y1="${bus.y}" x2="${x}" y2="${top + 16}" />
    <line x1="${x - 22}" y1="${top + 16}" x2="${x + 22}" y2="${top + 16}" />
    <line x1="${x - 22}" y1="${top + 28}" x2="${x + 22}" y2="${top + 28}" />
    <line x1="${x}" y1="${top + 28}" x2="${x}" y2="${top + 53}" />
    <line x1="${x - 18}" y1="${top + 53}" x2="${x + 18}" y2="${top + 53}" />
    <line x1="${x - 12}" y1="${top + 61}" x2="${x + 12}" y2="${top + 61}" />
    <line x1="${x - 6}" y1="${top + 69}" x2="${x + 6}" y2="${top + 69}" />
    <text class="terminal-device-name" x="${x}" y="${top + 94}">${escapeHtml(accessory.label)}</text>
    <text class="terminal-device-rating" x="${x}" y="${top + 113}">${escapeHtml(accessory.rating)}</text>
  </g>`;
}

export function renderTerminalDiagram(diagram, escapeHtml) {
  if (!diagram) return "";
  const busGap = 210;
  const buses = diagram.buses.map((bus, index) => ({ ...bus, y: 165 + index * busGap }));
  const lastBus = buses.at(-1);
  const circuitsByBus = new Map(buses.map((bus) => [bus.id, diagram.circuits.filter((circuit) => circuit.bus === bus.id)]));
  const hasBottomDevices = (diagram.generators?.length || 0) + (diagram.shunts?.length || 0) > 0;
  const height = lastBus.y + (hasBottomDevices ? 180 : 135);

  const busMarkup = buses.map((bus) => `
    <g class="terminal-bus voltage-${escapeHtml(bus.voltage.replace(/[^0-9]/g, ""))}">
      <line x1="120" y1="${bus.y}" x2="1000" y2="${bus.y}" />
      <text x="560" y="${bus.y - 17}">${escapeHtml(`${bus.voltage} / ${bus.label}`)}</text>
    </g>`).join("");

  const circuitMarkup = buses.map((bus, busIndex) => {
    const circuits = circuitsByBus.get(bus.id) || [];
    const direction = busIndex === 0 ? -1 : 1;
    return circuits.map((circuit, index) => circuitSymbol(circuit, index, circuits.length, bus, direction, escapeHtml)).join("");
  }).join("");

  const transformerMarkup = diagram.transformers.map((transformer, index) => transformerSymbol(transformer, index, diagram.transformers.length, buses, escapeHtml)).join("");
  const generators = diagram.generators || [];
  const shunts = diagram.shunts || [];
  const generatorMarkup = generators.map((generator, index) => accessorySymbol(generator, index, generators.length, buses.find((bus) => bus.id === generator.bus) || lastBus, "generator", escapeHtml)).join("");
  const shuntMarkup = shunts.map((shunt, index) => accessorySymbol(shunt, index, shunts.length, buses.find((bus) => bus.id === shunt.bus) || lastBus, "shunt", escapeHtml)).join("");

  return `<section class="terminal-diagram-block" aria-label="${escapeHtml(diagram.label)}">
    <div class="terminal-diagram-scroll">
      <svg class="terminal-diagram" viewBox="0 0 1120 ${height}" role="img" aria-label="${escapeHtml(diagram.label)}">
        ${busMarkup}${circuitMarkup}${transformerMarkup}${generatorMarkup}${shuntMarkup}
      </svg>
    </div>
    <p class="terminal-diagram-caption">${escapeHtml(diagram.label.toUpperCase())}</p>
  </section>`;
}
