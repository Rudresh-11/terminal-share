# --- Configuration ---
$BinaryName = "terminal-share.exe"
# Replace these URLs with your actual hosting links
$DownloadUrl = "https://github.com/Rudresh-11/terminal-share/releases/download/v1.0.0/terminal-share-win.exe"

Write-Host "🚀 Installing Terminal Share Agent..." -ForegroundColor Cyan

try {
    # 1. Create destination directory if not exists
    $DestDir = "$env:USERPROFILE\bin"
    if (!(Test-Path $DestDir)) {
        New-Item -ItemType Directory -Path $DestDir | Out-Null
    }

    # 2. Download Binary
    Write-Host "Downloading binary from $DownloadUrl..."
    Invoke-WebRequest -Uri $DownloadUrl -OutFile "$DestDir\$BinaryName"

    # 3. Add to User Path
    $CurrentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($CurrentPath -notlike "*$DestDir*") {
        [Environment]::SetEnvironmentVariable("Path", "$CurrentPath;$DestDir", "User")
        Write-Host "Adding $DestDir to your PATH..." -ForegroundColor Yellow
    }

    Write-Host "✅ Installation complete!" -ForegroundColor Green
    Write-Host "Please restart your terminal and type: $BinaryName" -ForegroundColor White
}
catch {
    Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
}
