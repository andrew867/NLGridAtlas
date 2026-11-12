param(
    [Parameter(Mandatory = $true)]
    [string]$Database,
    [Parameter(Mandatory = $true)]
    [string]$ExportCsv,
    [string]$ExportAudit = "research/derived/np-2018-tod-export-audit.json",
    [string]$Out = "research/derived/np-2018-tod-access-reconciliation.json"
)

$ErrorActionPreference = "Stop"
$table = "TOD Rate Study Load Data"
$driver = "Microsoft Access Driver (*.mdb, *.accdb)"
$export = Get-Content -LiteralPath $ExportAudit -Raw | ConvertFrom-Json
$databaseHash = (Get-FileHash -LiteralPath $Database -Algorithm SHA256).Hash.ToLowerInvariant()
$databaseBytes = (Get-Item -LiteralPath $Database).Length

$connection = [System.Data.Odbc.OdbcConnection]::new("Driver={$driver};Dbq=$Database;ReadOnly=1;")
$connection.Open()

function Invoke-Scalar([string]$Sql) {
    $command = $connection.CreateCommand()
    $command.CommandTimeout = 0
    $command.CommandText = $Sql
    return $command.ExecuteScalar()
}

try {
    $columns = @($connection.GetSchema("Columns") |
        Where-Object TABLE_NAME -eq $table |
        Sort-Object ORDINAL_POSITION |
        ForEach-Object { [ordered]@{ name = $_.COLUMN_NAME; type = $_.TYPE_NAME } })

    $totalRows = [int64](Invoke-Scalar "SELECT COUNT(*) FROM [$table]")
    $measurementRows = [int64](Invoke-Scalar "SELECT COUNT(*) FROM [$table] WHERE [RECORDER_ID] <> 'RECORDER ID'")
    $separatorRows = [int64](Invoke-Scalar "SELECT COUNT(*) FROM [$table] WHERE [RECORDER_ID] = 'RECORDER ID'")
    $recorderSeries = [int](Invoke-Scalar "SELECT COUNT(*) FROM (SELECT DISTINCT [RECORDER_ID] FROM [$table] WHERE [RECORDER_ID] <> 'RECORDER ID')")
    $firstKey = [int64](Invoke-Scalar "SELECT MIN([PrimaryKey]) FROM [$table]")
    $lastKey = [int64](Invoke-Scalar "SELECT MAX([PrimaryKey]) FROM [$table]")
    $firstDate = [int](Invoke-Scalar "SELECT MIN([DATE]) FROM [$table] WHERE [RECORDER_ID] <> 'RECORDER ID'")
    $lastDate = [int](Invoke-Scalar "SELECT MAX([DATE]) FROM [$table] WHERE [RECORDER_ID] <> 'RECORDER ID'")
    $minimumWatts = [double](Invoke-Scalar "SELECT MIN([WATTS]) FROM [$table] WHERE [RECORDER_ID] <> 'RECORDER ID'")
    $maximumWatts = [double](Invoke-Scalar "SELECT MAX([WATTS]) FROM [$table] WHERE [RECORDER_ID] <> 'RECORDER ID'")
    $zeroRows = [int64](Invoke-Scalar "SELECT COUNT(*) FROM [$table] WHERE [RECORDER_ID] <> 'RECORDER ID' AND [WATTS] = 0")

    $groupCommand = $connection.CreateCommand()
    $groupCommand.CommandTimeout = 0
    $groupCommand.CommandText = "SELECT [RECORDER_ID], COUNT(*) AS N FROM [$table] WHERE [RECORDER_ID] <> 'RECORDER ID' GROUP BY [RECORDER_ID]"
    $groupReader = $groupCommand.ExecuteReader()
    $recorderIds = @()
    $recorderCounts = @()
    while ($groupReader.Read()) {
        $recorderIds += $groupReader["RECORDER_ID"].ToString()
        $recorderCounts += [int]$groupReader["N"]
    }
    $groupReader.Close()

    $maximumCommand = $connection.CreateCommand()
    $maximumCommand.CommandText = "SELECT TOP 1 [PrimaryKey],[RECORDER_ID],[DATE],[HOUR],[WATTS] FROM [$table] WHERE [RECORDER_ID] <> 'RECORDER ID' ORDER BY [WATTS] DESC, [PrimaryKey] ASC"
    $maximumReader = $maximumCommand.ExecuteReader()
    if (-not $maximumReader.Read()) { throw "Maximum-value row was not found." }
    $maximumRow = [ordered]@{
        primary_key = [int]$maximumReader["PrimaryKey"]
        recorder_id = $maximumReader["RECORDER_ID"].ToString()
        date_raw = [int]$maximumReader["DATE"]
        hour = [int]$maximumReader["HOUR"]
        access_value = [double]$maximumReader["WATTS"]
    }
    $maximumReader.Close()

    $exportPrefix = "$($maximumRow.primary_key),"
    $exportLine = [IO.File]::ReadLines($ExportCsv) | Where-Object { $_.StartsWith($exportPrefix) } | Select-Object -First 1
    if (-not $exportLine) { throw "Maximum-value row was not found in the export." }
    $maximumRow.export_text = $exportLine.Split(",")[4]
    $sortedAccessIds = @($recorderIds | Sort-Object)
    $sortedExportIds = @($export.recorder_ids | Sort-Object)
    $idDifferences = @(Compare-Object $sortedAccessIds $sortedExportIds)
    $countDistribution = @($recorderCounts | Group-Object | Sort-Object Name)
    $measurementsPerRecorder = if ($countDistribution.Count -eq 1) {
        [int]$countDistribution[0].Name
    } else {
        $null
    }
    $culture = [Globalization.CultureInfo]::InvariantCulture
    $exportFirstRaw = [datetime]::ParseExact($export.first_date, "yyyy-MM-dd", $culture).ToString("yyMMdd")
    $exportLastRaw = [datetime]::ParseExact($export.last_date, "yyyy-MM-dd", $culture).ToString("yyMMdd")

    $result = [ordered]@{
        schema_version = 1
        database = [ordered]@{
            filename = [IO.Path]::GetFileName($Database)
            bytes = $databaseBytes
            sha256 = $databaseHash
            driver = $driver
            mode = "read-only"
        }
        table = [ordered]@{
            name = $table
            columns = $columns
            total_data_rows = $totalRows
            measurement_rows = $measurementRows
            separator_rows = $separatorRows
            recorder_series = $recorderSeries
            primary_key = [ordered]@{ first = $firstKey; last = $lastKey }
            first_date_raw = $firstDate
            last_date_raw = $lastDate
            minimum_watts = $minimumWatts
            maximum_watts = $maximumWatts
            zero_watt_rows = $zeroRows
            measurements_per_recorder = $measurementsPerRecorder
        }
        export_comparison = [ordered]@{
            total_data_rows_match = $totalRows -eq $export.total_data_rows
            measurement_rows_match = $measurementRows -eq $export.measurement_rows
            separator_rows_match = $separatorRows -eq $export.separator_rows
            recorder_series_match = $recorderSeries -eq $export.recorder_series
            recorder_id_sets_match = $idDifferences.Count -eq 0
            measurements_per_recorder_match = $countDistribution.Count -eq 1 -and $measurementsPerRecorder -eq 17544 -and $countDistribution[0].Count -eq 238
            primary_key_range_match = $firstKey -eq $export.primary_key.first -and $lastKey -eq $export.primary_key.last
            date_range_match = $firstDate.ToString().PadLeft(6, "0") -eq $exportFirstRaw -and $lastDate.ToString().PadLeft(6, "0") -eq $exportLastRaw
            zero_watt_rows_match = $zeroRows -eq $export.zero_watt_rows
            maximum_row = $maximumRow
            full_value_by_value_comparison_performed = $false
        }
    }
    $json = $result | ConvertTo-Json -Depth 8
    $outPath = if ([IO.Path]::IsPathRooted($Out)) { $Out } else { Join-Path (Get-Location) $Out }
    [IO.File]::WriteAllText($outPath, "$json`n", [Text.UTF8Encoding]::new($false))
    Write-Output $outPath
}
finally {
    $connection.Close()
}
