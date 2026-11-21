Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = "C:\Users\lenovo\.gemini\antigravity\brain\6381e07a-e2f6-49ab-8ee6-78d2dd8178c8\.user_uploaded\media_1794988082094_c24b0551.docx"
$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
foreach ($e in $archive.Entries) {
    Write-Host "$($e.FullName) ($($e.Length) bytes)"
    if ($e.FullName -like "*.xml" -and $e.FullName -notmatch "styles|theme|settings|webSettings|fontTable") {
        $r = New-Object System.IO.StreamReader($e.Open())
        $content = $r.ReadToEnd()
        $r.Close()
        # strip tags
        $clean = [System.Text.RegularExpressions.Regex]::Replace($content, '<[^>]+>', ' ')
        $clean = [System.Text.RegularExpressions.Regex]::Replace($clean, '\s+', ' ')
        Write-Host "--- Content of $($e.FullName) ---"
        Write-Host $clean
    }
}
$archive.Dispose()
