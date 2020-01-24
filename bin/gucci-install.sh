#!/usr/bin/env bash

if [[ $1 == '--force' ]] || ! [[ -f ./bin/gucci ]]; then
  VERSION=1.2.2
  curl -L https://github.com/noqcks/gucci/releases/download/${VERSION}/gucci-v${VERSION}-darwin-amd64 -o ./bin/gucci
  chmod a+x ./bin/gucci
fi
