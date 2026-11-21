Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = "V:\Project\OneHUB\OneHUB\OneHUB_SDP1_Project_Report.docx"
$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
Write-Host "Total entries in generated DOCX:" $archive.Entries.Count
$images = $archive.Entries | Where-Object { $_.FullName -like "word/media/*" }
Write-Host "Total images embedded:" $images.Count
foreach ($img in $images) {
    Write-Host "  - $($img.FullName) ($([Math]::Round($img.Length / 1024, 1)) KB)"
}

$entryDoc = $archive.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$reader = New-Object System.IO.StreamReader($entryDoc.Open())
$xml = $reader.ReadToEnd()
$reader.Close()
$archive.Dispose()

$tnrMatches = [System.Text.RegularExpressions.Regex]::Matches($xml, 'Times New Roman')
Write-Host "Times New Roman occurrences in document.xml:" $tnrMatches.Count

$calibriMatches = [System.Text.RegularExpressions.Regex]::Matches($xml, 'Calibri')
Write-Host "Calibri occurrences in document.xml:" $calibriMatches.Count

$sz24Matches = [System.Text.RegularExpressions.Regex]::Matches($xml, 'w:sz w:val="24"')
Write-Host "Size 12pt (sz val=24) occurrences in document.xml:" $sz24Matches.Count

$justifiedMatches = [System.Text.RegularExpressions.Regex]::Matches($xml, 'w:jc w:val="both"')
Write-Host "Justified alignment occurrences in document.xml:" $justifiedMatches.Count
