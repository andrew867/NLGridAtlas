# Great Northern Peninsula load record

IC-270 physical PDF pp. 5 to 7 reports monthly energy and peak demand for the Bear Cove and Plum Point systems from January 1992 through April 2001. The same table gives winter peak forecasts for 2001 and 2002.

## 2001 forecast comparison

The recorded values cover January through April, not the full year. The comparison uses the highest recorded monthly peak in those four months against the filed 2001 winter peak forecast.

| System | Highest recorded January to April peak | 2001 winter peak forecast | Difference | Difference as forecast percentage |
| --- | ---: | ---: | ---: | ---: |
| Bear Cove | 5,801 kW | 5,002 kW | +799 kW | +16.0% |
| Plum Point | 3,184 kW | 4,404 kW | -1,220 kW | -27.7% |

The percentage calculation is `(recorded peak - forecast) / forecast x 100`.

## Complete-year peak series

Only years with all twelve monthly kW entries are included.

| Year | Bear Cove peak | Plum Point peak |
| --- | ---: | ---: |
| 1992 | 6,931 kW | Not available |
| 1993 | 6,336 kW | Not available |
| 1994 | 5,760 kW | 4,026 kW |
| 1996 | 5,800 kW | 3,520 kW |
| 1997 | 5,652 kW | 3,368 kW |
| 1998 | 4,856 kW | 3,932 kW |
| 1999 | 4,808 kW | 4,224 kW |
| 2000 | Not available | 3,960 kW |

The extractor requires twelve non-null monthly peak entries before it publishes a yearly maximum. It therefore omits incomplete Bear Cove years 1995 and 2000, incomplete Plum Point years 1992, 1993, and 1995, and partial 2001 from this series.

## Reproduction

Run:

```powershell
python scripts/extract_ic270_loads.py "C:\src\misc\PUB\mirror\ARCHIVE\hyd01gra\filings\hydresp\Indust\IC 270.pdf"
```

The generated summary is stored in `research/derived/gnp-loads-2001.json`. The source SHA-256 is `7C025C2ADDFA4133B06649698AE41C2E67FA998BCE94363696659F784B5345E3`.
