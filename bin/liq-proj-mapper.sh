#!/usr/bin/env bash

# bash strict settings
set -o errexit # exit on errors
set -o nounset # exit on use of uninitialized variable
set -o pipefail

OUTPUT="${1}"; shift

for PROJECT_DIR in "$@"; do
  PROJ_NAME="$(cat "${PROJECT_DIR}/package.json" | jq -r ".name" | sed -e 's/^@//')"
  PROJ_URL="$(cat "${PROJECT_DIR}/package.json" | jq -r ".repository.url")"
  PROJ_URL="https://$(echo "${PROJ_URL}" | sed -E -e 's|[^/]*//[^@]*@?([^/]*/)|\1|' -e 's/\.git//')"

  echo "'$PROJ_NAME' => '$PROJ_URL'," >> $OUTPUT
done
