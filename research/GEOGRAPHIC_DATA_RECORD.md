# Geographic data record

Updated: 2026-11-11

## Historical transmission-line geometry

The route dataset comes from the Government of Newfoundland and Labrador GeoAtlas, Canvec Transmission Lines, MapServer layer 16:

`https://dnrmaps.gov.nl.ca/arcgis/rest/services/GeoAtlas/Map_Layers/MapServer/16`

The build script requests the complete layer in WGS 84 coordinates, then retains features that intersect this Newfoundland island selection envelope:

| Boundary | Coordinate |
| --- | ---: |
| West | -59.7 degrees longitude |
| South | 46.45 degrees latitude |
| East | -52.4 degrees longitude |
| North | 51.0 degrees latitude |

The full layer contains 671 features. The island selection contains 588 features. The selected records have validation years from 1979 through 1991. The layer does not give Hydro or Newfoundland Power circuit designations. It is a historical geographic reference, not a current utility as-built record.

Generated file: `research/derived/gnl-canvec-newfoundland-transmission-lines.geojson`

## Station coordinates

The station register uses published OpenStreetMap station-boundary ways. The build script calculates a polygon centroid from each boundary's nodes. The coordinates are for map placement. They do not establish circuit topology, equipment ownership, voltage, or operating state.

| Atlas record | Source object | Latitude | Longitude |
| --- | --- | ---: | ---: |
| Oxen Pond Terminal Station | `way/113031677` | 47.573357 | -52.755719 |
| Hardwoods Terminal Station | `way/252505650` | 47.524408 | -52.847219 |
| Holyrood Terminal Station | `way/229936554` | 47.450633 | -53.097952 |
| Soldiers Pond Terminal Station | `way/1293515683` | 47.417784 | -52.980346 |
| Western Avalon Terminal Station | `way/132014003` | 47.516489 | -53.684638 |
| Ridge Road Substation | `way/260768602` | 47.590700 | -52.728902 |
| Virginia Waters Substation | `way/381389667` | 47.614864 | -52.703014 |
| Goulds Substation | `way/775556178` | 47.485401 | -52.766512 |

Each register entry preserves the direct OpenStreetMap page, API URL, object version, object timestamp, retrieval date, and published tags. OpenStreetMap data is available under ODbL 1.0.

Generated file: `research/derived/station-coordinate-register.json`

## Rebuild

Run `npm run build:geodata`. The script downloads the two source datasets and rewrites both derived files. A failed or missing station boundary stops the build instead of substituting an estimated coordinate.
