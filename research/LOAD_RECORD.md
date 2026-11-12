# Measured load and planning record

Updated: 2026-11-11

## Data classes

The atlas keeps four load classes separate:

1. measured or reported actual peaks;
2. short-term operating forecasts;
3. planning forecasts from capital applications;
4. interrupted load and event-energy records.

## 2013 to 2014 winter peaks

Newfoundland Power reported an actual winter peak demand of 1,398,465 kW and an Avalon Peninsula actual winter peak demand of 863,868 kW. The response does not state that the two peaks were coincident. The atlas therefore shows them as two separate winter records and does not calculate an Avalon share of the Newfoundland Power peak.

Source: PUB-NP-239, physical PDF p. 1.

## 2020 Nostradamus data-import failure

At midnight on 2019-12-31, scheduled tasks were deleted. Nostradamus stopped importing actual-load data until 2020-01-03. The annual report states that the executable-file error prevented the forecast from updating correctly.

| Date | Forecast peak reported to the Board | Actual reported peak | Absolute error | Error as reported |
| --- | ---: | ---: | ---: | ---: |
| 2020-01-02 | 1,135 MW | 1,282 MW | 147 MW | 11.5% of actual peak |
| 2020-01-03 | 1,165 MW | 1,295 MW | 130 MW | 10.0% of actual peak |

The report also provides hourly-series values. On 2020-01-02, the hourly forecast predicted a 1,134 MW peak at 18:00. The actual hourly peak was 1,279 MW at 17:00. At the time of the actual peak, the total load forecast was 844 MW, which the report describes as a 34.0 percent underestimate. These hourly values are not substituted for the five-minute peaks reported to the Board.

Source: Accuracy of Nostradamus Load Forecasting, 2020 Annual Report, physical PDF pp. 13 to 14, report pp. 7 to 8.

## 2024 forecast summary

The 2024 annual report's total-average row gives a 902 MW actual monthly utility peak average, an 895 MW forecast average, and a 20 MW average absolute error. The atlas uses the table values directly.

Source: Short-Term Load Forecasting Accuracy for 2024, physical PDF p. 119.

## 2026 transformer planning forecast

The 2027 Power Transformer Listing gives each transformer's MVA rating and 2026 forecast. The following ratios are calculated as:

`forecast ratio = 2026 forecast MVA / listed MVA rating x 100%`

| Transformer | Listed rating | 2026 forecast | Calculation | Ratio |
| --- | ---: | ---: | ---: | ---: |
| GIL-T1 | 6.67 MVA | 7.11 MVA | 7.11 / 6.67 x 100 | 106.6% |
| HOW-T3 | 1.00 MVA | 1.04 MVA | 1.04 / 1.00 x 100 | 104.0% |
| WAL-T1 | 20.00 MVA | 20.74 MVA | 20.74 / 20.00 x 100 | 103.7% |
| ISL-T1 | 4.00 MVA | 3.94 MVA | 3.94 / 4.00 x 100 | 98.5% |
| MOL-T1 | 25.00 MVA | 24.09 MVA | 24.09 / 25.00 x 100 | 96.4% |
| GAM-T1 | 6.67 MVA | 6.42 MVA | 6.42 / 6.67 x 100 | 96.3% |
| MOL-T2 | 25.00 MVA | 23.70 MVA | 23.70 / 25.00 x 100 | 94.8% |
| PAS-T1 | 13.30 MVA | 12.46 MVA | 12.46 / 13.30 x 100 | 93.7% |

The derived register contains 140 rows with a positive listed rating and a numeric 2026 forecast. The table above contains the eight highest calculated ratios. Three rows exceed 100 percent. These are planning ratios, not measured peaks or findings that protection or emergency ratings were exceeded.

Source: 2027 Capital Budget Application, Power Transformer Listing, physical PDF pp. 547 to 551. Derived data: `research/derived/np-2027-transformer-register.json`.

## Corrected station labels

The King's Bridge 43.7 MVA value and Ridge Road 34.7 MVA value are five-year forecast maximum peaks. Earlier atlas labels omitted the word `forecast`. The station records now identify both values as forecasts.

Sources:

- 2026 Capital Budget Application, physical PDF pp. 74 and 431, King's Bridge.
- 2027 Capital Budget Application, physical PDF p. 515, Ridge Road.
