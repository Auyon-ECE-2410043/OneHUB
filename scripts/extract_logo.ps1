Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = "C:\Users\lenovo\.gemini\antigravity\brain\6381e07a-e2f6-49ab-8ee6-78d2dd8178c8\.user_uploaded\media_1794988082094_c24b0551.docx"
$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

$entryLogo = $archive.Entries | Where-Object { $_.FullName -eq 'word/media/image1.png' }
if ($entryLogo) {
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entryLogo, "V:\Project\OneHUB\OneHUB\docs\report_figures\ruet_logo.png", $true)
    Write-Host "RUET Logo extracted to docs/report_figures/ruet_logo.png"
}

$archive.Dispose()
