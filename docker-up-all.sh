#!/usr/bin/env bash
set -euo pipefail

compose_files=(
  "src/main/docker/app.yml"
  "src/main/docker/services.yml"
  "src/main/docker/monitoring.yml"
  "src/main/docker/sonar.yml"
  "src/main/docker/jhipster-control-center.yml"
)

for file in "${compose_files[@]}"; do
  echo "Starting compose stack: ${file}"
  docker compose -f "${file}" up -d
done

echo "All compose stacks are up."
