#!/usr/bin/env bash

set -euo pipefail

if [ -n "${GOOGLE_SERVICES_JSON:-}" ]; then
  echo "GOOGLE_SERVICES_JSON is set, creating google-services.json"
  echo "$GOOGLE_SERVICES_JSON" > google-services.json
fi
