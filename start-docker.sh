#!/bin/bash

set -euo pipefail

# build + run backend service via docker compose
docker compose --env-file .env.docker up --build backend
