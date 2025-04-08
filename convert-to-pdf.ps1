$word = New-Object -ComObject Word.Application
$word.Visible = $false

$txtFiles = Get-ChildItem -Path ".\sample-resources" -Filter "*.txt"

foreach ($txtFile in $txtFiles) {
    $doc = $word.Documents.Open($txtFile.FullName)
    $pdfPath = $txtFile.FullName -replace "\.txt$", ".pdf"
    $doc.SaveAs([ref] $pdfPath, [ref] 17) # 17 is the PDF format
    $doc.Close()
    Write-Host "Converted $($txtFile.Name) to PDF"
}

$word.Quit()
Write-Host "All files converted successfully!" 