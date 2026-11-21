Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = "C:\Users\lenovo\.gemini\antigravity\brain\6381e07a-e2f6-49ab-8ee6-78d2dd8178c8\.user_uploaded\media_1794988082094_c24b0551.docx"
$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entry = $archive.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$reader = New-Object System.IO.StreamReader($entry.Open())
$xml = $reader.ReadToEnd()
$reader.Close()
$archive.Dispose()

# Also let's extract paragraphs properly
$pattern = '<w:p\b.*?>(.*?)</w:p>'
$pMatches = [System.Text.RegularExpressions.Regex]::Matches($xml, $pattern)
$lines = @()
foreach ($m in $pMatches) {
    $pXml = $m.Groups[1].Value
    $tMatches = [System.Text.RegularExpressions.Regex]::Matches($pXml, '<w:t\b[^>]*>(.*?)</w:t>')
    $pText = ""
    foreach ($tm in $tMatches) {
        $pText += $tm.Groups[1].Value
    }
    if ($pText.Trim().Length -gt 0) {
        $lines += $pText.Trim()
    }
}

$entryLogo = $archive.Entries | Where-Object { $_.FullName -eq 'word/media/image1.png' }
if ($entryLogo) {
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entryLogo, "docs/report_figures/ruet_logo.png", $true)
    Write-Host "RUET Logo extracted to docs/report_figures/ruet_logo.png"
}

$lines | Out-File -FilePath $outputFile -Encoding utf8
Write-Host "Extracted paragraphs count:" $lines.Count
Get-Content $outputFile -Head 40
