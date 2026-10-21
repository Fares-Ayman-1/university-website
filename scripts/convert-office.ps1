# Converts PowerPoint course files (.pptx, and .ppt when Office allows it) in ../materials into
# PDFs under public/materials/<subject-slug>/, at the same relative path with a .pdf extension.
#
# The site serves and renders slides only from PDFs. This needs Microsoft PowerPoint (COM), so
# it runs on Windows only; the PDFs are committed, so Vercel never needs it. Existing PDFs that
# are newer than their source are skipped. Usage: npm run convert  (add -Force to redo all)
#
# Legacy .ppt files are refused when Office's Trust Center "File Block" setting blocks them:
# open those in PowerPoint, save them as .pptx, and run this again.

param([switch]$Force)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$materialsRoot = Join-Path (Split-Path -Parent $root) "materials"
$subjectsDir = Join-Path $root "content\subjects"
$courseFolders = "^(lectures|sections|chapters)$"

if (-not (Test-Path $materialsRoot)) {
  Write-Host "[convert] ../materials not found; nothing to do."
  exit 0
}

$jobs = @()
foreach ($subject in Get-ChildItem $subjectsDir -Directory) {
  $subjectFile = Join-Path $subject.FullName "subject.json"
  if (-not (Test-Path $subjectFile)) { continue }
  $materialsDir = (Get-Content $subjectFile -Raw -Encoding UTF8 | ConvertFrom-Json).materialsDir
  $sourceDir = Join-Path $materialsRoot $materialsDir
  if (-not (Test-Path $sourceDir)) { continue }

  foreach ($file in Get-ChildItem $sourceDir -Recurse -File -Include *.pptx, *.ppt) {
    $relative = $file.FullName.Substring($sourceDir.Length + 1)
    if (($relative -split "\\")[0] -notmatch $courseFolders) { continue }
    if (Test-Path ([IO.Path]::ChangeExtension($file.FullName, ".pdf"))) {
      Write-Warning "[convert] skipping $relative : a PDF with the same name already exists"
      continue
    }
    $target = Join-Path $root ("public\materials\" + $subject.Name + "\" + [IO.Path]::ChangeExtension($relative, ".pdf"))
    if (-not $Force -and (Test-Path $target) -and (Get-Item $target).LastWriteTime -ge $file.LastWriteTime) { continue }
    $jobs += [pscustomobject]@{ Source = $file.FullName; Target = $target; Relative = $relative }
  }
}

if ($jobs.Count -eq 0) {
  Write-Host "[convert] 0 file(s) converted."
  exit 0
}

$failed = 0
$powerpoint = New-Object -ComObject PowerPoint.Application
$powerpoint.DisplayAlerts = 1 # ppAlertsNone
try {
  foreach ($job in $jobs) {
    New-Item -ItemType Directory -Force (Split-Path -Parent $job.Target) | Out-Null
    try {
      # Open(path, ReadOnly, Untitled, WithWindow); SaveAs format 32 = ppSaveAsPDF
      $deck = $powerpoint.Presentations.Open($job.Source, -1, 0, 0)
      $deck.SaveAs($job.Target, 32)
      $deck.Close()
      Write-Host "[convert] $($job.Relative)"
    } catch {
      Write-Warning "[convert] could not convert $($job.Relative): $($_.Exception.Message)"
      $failed++
    }
  }
} finally {
  $powerpoint.Quit()
}

Write-Host "[convert] $($jobs.Count - $failed) file(s) converted, $failed skipped."
