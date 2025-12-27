$ErrorActionPreference = "Stop"
$mavenVersion = "3.9.6"
$mavenUrl = "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
$installDir = "d:\smartHR\tools"
$mavenDir = "$installDir\apache-maven-$mavenVersion"

# Create tools directory
if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
    Write-Host "Created directory $installDir"
}

# Check if already installed
if (Test-Path "$mavenDir\bin\mvn.cmd") {
    Write-Host "Maven already exists at $mavenDir"
    exit 0
}

# Download
$zipPath = "$installDir\maven.zip"
Write-Host "Downloading Maven from $mavenUrl..."
Invoke-WebRequest -Uri $mavenUrl -OutFile $zipPath

# Unzip
Write-Host "Extracting Maven..."
Expand-Archive -Path $zipPath -DestinationPath $installDir -Force

# Cleanup
Remove-Item $zipPath
Write-Host "Maven ready at $mavenDir"
