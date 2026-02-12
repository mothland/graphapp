Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$composeFiles = @(
  "src/main/docker/app.yml",
  "src/main/docker/services.yml",
  "src/main/docker/monitoring.yml",
  "src/main/docker/jhipster-control-center.yml"
)

foreach ($file in $composeFiles) {
  Write-Host "Starting compose stack: $file"
  docker compose -f $file up -d
  if ($LASTEXITCODE -ne 0) {
    throw "docker compose failed for $file"
  }
}

Write-Host "All compose stacks are up."
