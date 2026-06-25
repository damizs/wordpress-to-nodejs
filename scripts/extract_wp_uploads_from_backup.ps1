param(
  [Parameter(Mandatory = $true)]
  [string]$BackupZip,

  [string]$Destination = "public\uploads\wp-migration"
)

$ErrorActionPreference = "Stop"

function To-LongPath([string]$Path) {
  $full = [System.IO.Path]::GetFullPath($Path)
  if ($full.StartsWith("\\?\")) {
    return $full
  }
  return "\\?\" + $full
}

Add-Type -AssemblyName System.IO.Compression.FileSystem

if (!(Test-Path $BackupZip)) {
  throw "Backup nao encontrado: $BackupZip"
}

$workspace = (Resolve-Path ".").Path
$tmpRoot = Join-Path $workspace ".tmp"
[System.IO.Directory]::CreateDirectory((To-LongPath $tmpRoot)) | Out-Null

$tempDir = Join-Path $tmpRoot ("wp-upload-extract-" + (Get-Date -Format "yyyyMMddHHmmss"))
[System.IO.Directory]::CreateDirectory((To-LongPath $tempDir)) | Out-Null

$filesZip = Join-Path $tempDir "files.zip"
$destRoot = Join-Path $workspace $Destination
$marker = "wp-content/uploads/"
$count = 0
$skipped = 0

try {
  $outer = [System.IO.Compression.ZipFile]::OpenRead($BackupZip)
  try {
    $entry = $outer.Entries | Where-Object { $_.FullName -eq "files.zip" } | Select-Object -First 1
    if (!$entry) {
      throw "files.zip nao encontrado dentro do backup"
    }
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, (To-LongPath $filesZip), $true)
  } finally {
    $outer.Dispose()
  }

  [System.IO.Directory]::CreateDirectory((To-LongPath $destRoot)) | Out-Null

  $inner = [System.IO.Compression.ZipFile]::OpenRead($filesZip)
  try {
    foreach ($entry in $inner.Entries) {
      $name = $entry.FullName.Replace("\", "/")
      $idx = $name.IndexOf($marker, [System.StringComparison]::OrdinalIgnoreCase)
      if ($idx -lt 0 -or $name.EndsWith("/")) {
        continue
      }

      $rel = $name.Substring($idx + $marker.Length)
      if (!$rel -or $rel.Contains("..")) {
        $skipped++
        continue
      }

      $dest = Join-Path $destRoot ($rel.Replace("/", "\"))
      $parent = Split-Path -Parent $dest
      [System.IO.Directory]::CreateDirectory((To-LongPath $parent)) | Out-Null
      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, (To-LongPath $dest), $true)
      $count++
    }
  } finally {
    $inner.Dispose()
  }
} finally {
  if (Test-Path $tempDir) {
    Remove-Item -LiteralPath $tempDir -Recurse -Force
  }
}

Write-Output "uploads_extraidos=$count"
Write-Output "ignorados=$skipped"
Write-Output "destino=$destRoot"
