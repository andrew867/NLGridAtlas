function spread(index, count, left = 170, right = 950) {
  if (count <= 1) return (left + right) / 2;
  return left + ((right - left) * index) / (count - 1);
}

function circuitLink(circuit, body, escapeHtml, linkTarget) {
  if (circuit.link === false) return body;
  const label = escapeHtml(`${circuit.label} to ${circuit.destination}`);
  if (circuit.stationCode) {
    return `<a href="#station-browser" data-station-record="${escapeHtml(circuit.stationCode)}" aria-label="Open ${label}">${body}</a>`;
  }
  if (circuit.destinationCode) {
    if (linkTarget === "station") {
      return `<a href="#station-browser" data-station-record="${escapeHtml(circuit.destinationCode)}" aria-label="Open ${label}">${body}</a>`;
    }
    return `<a href="#hydro-terminal-browser" data-hydro-terminal-record="${escapeHtml(circuit.destinationCode)}" aria-label="Open ${label}">${body}</a>`;
  }
  return `<a href="#island-backbone" data-island-circuit="${escapeHtml(circuit.label)}" aria-label="Locate ${label} on the island backbone">${body}</a>`;
}

function transformerSymbol(transformer, index, count, buses, escapeHtml) {
  const from = buses.find((bus) => bus.id === transformer.from);
  const to = buses.find((bus) => bus.id === transformer.to);
  if (!from || !to) return "";
  const fromY = transformer.fromY ?? from.y;
  const toY = transformer.toY ?? to.y;
  const x = transformer.x ?? (count === 2
    ? spread(index, count, 420, 700)
    : spread(index, count, 300, 820));
  const lowY = Math.min(fromY, toY);
  const highY = Math.max(fromY, toY);
  const intermediateBuses = buses
    .filter((bus) => bus.y > lowY && bus.y < highY)
    .sort((a, b) => Math.abs(a.y - fromY) - Math.abs(b.y - fromY));
  const middle = intermediateBuses.length
    ? (fromY + intermediateBuses[0].y) / 2
    : (fromY + toY) / 2;
  const crossingMasks = intermediateBuses
    .map((bus) => `<rect class="terminal-bus-crossing-mask" x="${x - 11}" y="${bus.y - 10}" width="22" height="20" />`)
    .join("");
  const toDirection = toY > fromY ? 1 : -1;
  const toBreakerY = toY - toDirection * 28;
  const toBreakerMarkup = transformer.toBreaker
    ? `<g class="terminal-line-breaker terminal-transformer-breaker">
      <rect x="${x - 7}" y="${toBreakerY - 11}" width="14" height="22" />
      <text x="${x + 18}" y="${toBreakerY + 4}" text-anchor="start">${escapeHtml(transformer.toBreaker)}</text>
    </g>`
    : "";
  return `<g class="terminal-transformer" role="img" aria-label="${escapeHtml(`${transformer.label}, ${transformer.rating}`)}">
    ${crossingMasks}
    <line x1="${x}" y1="${fromY}" x2="${x}" y2="${middle - 28}" />
    <circle cx="${x}" cy="${middle - 13}" r="20" />
    <circle cx="${x}" cy="${middle + 13}" r="20" />
    <line x1="${x}" y1="${middle + 28}" x2="${x}" y2="${toY}" />
    ${toBreakerMarkup}
    <text class="terminal-device-name" x="${x}" y="${middle - 82}">${escapeHtml(transformer.label)}</text>
    <text class="terminal-device-rating" x="${x}" y="${middle - 60}">${escapeHtml(transformer.rating)}</text>
  </g>`;
}

function circuitSymbol(circuit, index, count, bus, direction, escapeHtml, linkTarget) {
  const x = circuit.x ?? spread(index, count);
  const lineEnd = bus.y + direction * 68;
  const labelY = bus.y + direction * 88;
  const destinationY = bus.y + direction * 114;
  const breakerY = bus.y + direction * 32;
  const breakerMarkup = circuit.breaker
    ? `<g class="terminal-line-breaker">
      <rect x="${x - 7}" y="${breakerY - 11}" width="14" height="22" />
      <text x="${x + 18}" y="${breakerY + 4}" text-anchor="start">${escapeHtml(circuit.breaker)}</text>
    </g>`
    : "";
  const body = `<g class="terminal-circuit">
    <line x1="${x}" y1="${bus.y}" x2="${x}" y2="${lineEnd}" />
    ${breakerMarkup}
    <text class="terminal-circuit-id" x="${x}" y="${labelY}">${escapeHtml(circuit.label)}</text>
    <text class="terminal-circuit-destination" x="${x}" y="${destinationY}">${escapeHtml(circuit.destination)}</text>
  </g>`;
  return circuitLink(circuit, body, escapeHtml, linkTarget);
}

function breakerSymbol({ x, y, orientation = "horizontal", label }, escapeHtml) {
  const horizontal = orientation === "horizontal";
  const width = horizontal ? 22 : 14;
  const height = horizontal ? 14 : 22;
  const labelX = horizontal ? x : x + 18;
  const labelY = horizontal ? y - 13 : y + 4;
  const anchor = horizontal ? "middle" : "start";
  return `<g class="terminal-ring-breaker">
    <rect x="${x - width / 2}" y="${y - height / 2}" width="${width}" height="${height}" />
    <text x="${labelX}" y="${labelY}" text-anchor="${anchor}">${escapeHtml(label)}</text>
  </g>`;
}

function ringSymbol(ring, buses, escapeHtml, linkTarget) {
  const bus = buses.find((candidate) => candidate.id === ring.bus);
  if (!bus) return "";
  const topY = ring.y;
  const fromX = ring.fromX;
  const toX = ring.toX;
  const conductor = `<path d="M ${fromX} ${bus.y} V ${topY} H ${toX} V ${bus.y}" />`;
  const breakers = (ring.breakers || [])
    .map((breaker) => breakerSymbol({ ...breaker, y: breaker.y ?? topY }, escapeHtml))
    .join("");
  const circuits = (ring.circuits || []).map((circuit) => {
    const lineEnd = topY - 62;
    const body = `<g class="terminal-circuit terminal-ring-circuit">
      <line x1="${circuit.x}" y1="${topY}" x2="${circuit.x}" y2="${lineEnd}" />
      <text class="terminal-circuit-id" x="${circuit.x}" y="${lineEnd - 18}">${escapeHtml(circuit.label)}</text>
      <text class="terminal-circuit-destination" x="${circuit.x}" y="${lineEnd - 40}">${escapeHtml(circuit.destination)}</text>
    </g>`;
    return circuitLink(circuit, body, escapeHtml, linkTarget);
  }).join("");
  return `<g class="terminal-ring voltage-${escapeHtml(ring.voltage.replace(/[^0-9]/g, ""))}" role="img" aria-label="${escapeHtml(ring.label)}">
    ${conductor}${breakers}${circuits}
  </g>`;
}

function accessorySymbol(accessory, index, count, bus, type, escapeHtml) {
  const fourShuntPositions = [190, 390, 730, 930];
  const x = accessory.x ?? (type === "shunt" && count === 4
    ? fourShuntPositions[index]
    : spread(index, count, 190, 930));
  const top = bus.y + 34;
  if (type === "generator") {
    return `<g class="terminal-accessory" role="img" aria-label="${escapeHtml(`${accessory.label}, ${accessory.rating}`)}">
      <line x1="${x}" y1="${bus.y}" x2="${x}" y2="${top + 13}" />
      <circle cx="${x}" cy="${top + 42}" r="28" />
      <text class="terminal-accessory-symbol" x="${x}" y="${top + 49}">${escapeHtml(accessory.symbol || "G")}</text>
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

function converterSymbol(converter, index, count, bus, escapeHtml) {
  const x = converter.x ?? spread(index, count, 240, 470);
  const top = bus.y + 34;
  return `<g class="terminal-converter" role="img" aria-label="${escapeHtml(`${converter.label}, ${converter.technology}, ${converter.rating}`)}">
    <line x1="${x}" y1="${bus.y}" x2="${x}" y2="${top + 13}" />
    <rect x="${x - 55}" y="${top + 13}" width="110" height="58" />
    <text class="terminal-converter-symbol" x="${x}" y="${top + 38}">LCC</text>
    <text class="terminal-converter-type" x="${x}" y="${top + 58}">${escapeHtml(converter.technology)}</text>
    <text class="terminal-device-name" x="${x}" y="${top + 94}">${escapeHtml(converter.label)}</text>
    <text class="terminal-device-rating" x="${x}" y="${top + 113}">${escapeHtml(converter.rating)}</text>
  </g>`;
}

function busDisplayLabel(bus) {
  const voltage = bus.voltage.trim();
  const label = bus.label.trim();
  if (label.toLowerCase().includes(voltage.toLowerCase())) return label;
  if (label.toLowerCase() === "bus") return `${voltage} bus`;
  return `${voltage} / ${label}`;
}

export function renderTerminalDiagram(diagram, escapeHtml, linkTarget = "hydro-terminal") {
  if (!diagram) return "";
  const busGap = 210;
  const buses = diagram.buses.map((bus, index) => ({ ...bus, y: bus.y ?? 165 + index * busGap }));
  const lastBus = [...buses].sort((a, b) => a.y - b.y).at(-1);
  const circuitsByBus = new Map(buses.map((bus) => [bus.id, diagram.circuits.filter((circuit) => circuit.bus === bus.id)]));
  const hasBottomDevices = (diagram.generators?.length || 0) + (diagram.shunts?.length || 0) + (diagram.converters?.length || 0) > 0;
  const height = lastBus.y + (hasBottomDevices ? 180 : 135);

  const busMarkup = buses.map((bus) => {
    const lines = bus.segments?.length
      ? bus.segments.map(({ x, width = 76, label, labelOffset = 54 }) => `<line x1="${x - width / 2}" y1="${bus.y}" x2="${x + width / 2}" y2="${bus.y}" />${label ? `<text class="terminal-bus-segment-label" x="${x}" y="${bus.y + labelOffset}">${escapeHtml(label)}</text>` : ""}`).join("")
      : `<line x1="120" y1="${bus.y}" x2="1000" y2="${bus.y}" />`;
    const ties = bus.ties || (bus.tie ? [bus.tie] : []);
    const tieMarkup = ties.map((tie) => {
      const middle = (tie.fromX + tie.toX) / 2;
      const device = tie.open
        ? `<line class="terminal-bus-tie-blade" x1="${middle - 8}" y1="${bus.y}" x2="${middle + 7}" y2="${bus.y - 13}" />`
        : `<rect x="${middle - 7}" y="${bus.y - 9}" width="14" height="18" />`;
      return `<g class="terminal-bus-tie${tie.open ? " terminal-bus-tie-open" : ""}">
        <line x1="${tie.fromX}" y1="${bus.y}" x2="${middle - 8}" y2="${bus.y}" />
        ${device}
        <line x1="${middle + 8}" y1="${bus.y}" x2="${tie.toX}" y2="${bus.y}" />
        <text x="${middle}" y="${bus.y + (tie.labelOffset ?? 31)}">${escapeHtml(tie.label)}</text>
      </g>`;
    }).join("");
    return `
    <g class="terminal-bus terminal-bus-${escapeHtml(bus.kind || "bus")} voltage-${escapeHtml(bus.voltage.replace(/[^0-9]/g, ""))}">
      ${lines}${tieMarkup}
      ${bus.hideLabel ? "" : `<text x="${bus.labelX ?? 560}" y="${bus.y + (bus.labelOffset ?? -17)}">${escapeHtml(busDisplayLabel(bus))}</text>`}
    </g>`;
  }).join("");

  const circuitMarkup = buses.map((bus, busIndex) => {
    const circuits = circuitsByBus.get(bus.id) || [];
    const defaultDirection = busIndex === 0 ? -1 : 1;
    return circuits.map((circuit, index) => {
      const direction = circuit.direction === "up" ? -1 : circuit.direction === "down" ? 1 : defaultDirection;
      return circuitSymbol(circuit, index, circuits.length, bus, direction, escapeHtml, linkTarget);
    }).join("");
  }).join("");

  const transformerMarkup = diagram.transformers.map((transformer, index) => transformerSymbol(transformer, index, diagram.transformers.length, buses, escapeHtml)).join("");
  const ringMarkup = (diagram.rings || []).map((ring) => ringSymbol(ring, buses, escapeHtml, linkTarget)).join("");
  const generators = diagram.generators || [];
  const shunts = diagram.shunts || [];
  const converters = diagram.converters || [];
  const generatorMarkup = generators.map((generator, index) => accessorySymbol(generator, index, generators.length, buses.find((bus) => bus.id === generator.bus) || lastBus, "generator", escapeHtml)).join("");
  const shuntMarkup = shunts.map((shunt, index) => accessorySymbol(shunt, index, shunts.length, buses.find((bus) => bus.id === shunt.bus) || lastBus, "shunt", escapeHtml)).join("");
  const converterMarkup = converters.map((converter, index) => converterSymbol(converter, index, converters.length, buses.find((bus) => bus.id === converter.bus) || lastBus, escapeHtml)).join("");

  return `<section class="terminal-diagram-block" aria-label="${escapeHtml(diagram.label)}">
    <div class="terminal-diagram-scroll">
      <svg class="terminal-diagram" viewBox="0 0 1120 ${height}" role="img" aria-label="${escapeHtml(diagram.label)}">
        ${busMarkup}${ringMarkup}${circuitMarkup}${transformerMarkup}${converterMarkup}${generatorMarkup}${shuntMarkup}
      </svg>
    </div>
    <p class="terminal-diagram-caption">${escapeHtml(diagram.label.toUpperCase())}</p>
  </section>`;
}
