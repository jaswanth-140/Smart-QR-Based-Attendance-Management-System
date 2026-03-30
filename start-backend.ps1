param(
    [string]$Profile = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot "backend"

if (-not (Test-Path $backendDir)) {
    Write-Error "Backend directory not found at $backendDir"
}

$mavenCommand = Get-Command mvn.cmd -ErrorAction SilentlyContinue
if (-not $mavenCommand) {
    Write-Error "Apache Maven was not found on PATH. Install Maven or add mvn.cmd to PATH."
}

Push-Location $backendDir
try {
    $arguments = @()
    if ($Profile) {
        $arguments += "-Dspring-boot.run.profiles=$Profile"
    }
    $arguments += "spring-boot:run"

    Write-Host "Starting backend from $backendDir" -ForegroundColor Cyan
    Write-Host "Using Maven: $($mavenCommand.Source)" -ForegroundColor DarkGray
    Write-Host "Using config: backend/src/main/resources/application.properties" -ForegroundColor DarkGray

    & $mavenCommand.Source @arguments
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
