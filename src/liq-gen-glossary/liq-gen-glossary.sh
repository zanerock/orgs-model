#!/usr/bin/env bash

import real_path

NODE_SCRIPT="$(dirname $(real_path $0))/generate-glossary.js"

if (( $# > 0 )); then
  node "${NODE_SCRIPT}" "$@"
else
  DEFINITION_FILES=$(find "${PWD}" -name "glossary.json" -exec echo -n '"{}" ' \; | tr '\n' ' ')
  echo ${DEFINITION_FILES}
  node "${NODE_SCRIPT}" ${DEFINITION_FILES}
fi

# We were doing this, but it dosen't work with source maps...
# cat <<'EOF' | node - "$@"
# source ../../build/generate-glossary.js # bash-rollup-no-recur
# EOF
