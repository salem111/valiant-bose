Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = "X:\projects\valiant-bose"
$zipPath = Join-Path $root "saleem-voice-app-production.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

$includeFiles = @(
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "index.html",
    "database.rules.json",
    "firestore.rules",
    "capacitor.config.ts",
    "server.ts",
    "encore.app",
    ".env.example",
    "README.md"
)

$includeDirs = @("src", "public", "scripts")

foreach ($fName in $includeFiles) {
    $fPath = Join-Path $root $fName
    if (Test-Path $fPath) {
        $entry = $zip.CreateEntry($fName, [System.IO.Compression.CompressionLevel]::Optimal)
        $stream = [System.IO.File]::Open($fPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
        $entryStream = $entry.Open()
        $stream.CopyTo($entryStream)
        $entryStream.Dispose()
        $stream.Dispose()
    }
}

foreach ($dir in $includeDirs) {
    $dirPath = Join-Path $root $dir
    if (Test-Path $dirPath) {
        $allFiles = Get-ChildItem -Path $dirPath -Recurse -File
        foreach ($file in $allFiles) {
            $relPath = $file.FullName.Substring($root.Length + 1).Replace('\', '/')
            $entry = $zip.CreateEntry($relPath, [System.IO.Compression.CompressionLevel]::Optimal)
            try {
                $stream = [System.IO.File]::Open($file.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
                $entryStream = $entry.Open()
                $stream.CopyTo($entryStream)
                $entryStream.Dispose()
                $stream.Dispose()
            } catch {
                Write-Host "Skipping locked file: $relPath"
            }
        }
    }
}

$zip.Dispose()
$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "SUCCESS: Created $zipPath ($sizeMB MB)"
