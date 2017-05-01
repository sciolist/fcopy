#!/usr/bin/env bash
# https://nodejs.org/en/download/releases/

set -ue
DIR=$(cd $(dirname "$0") && pwd)
cd $(dirname $DIR)

VERSIONS=(
  "7.8.0"
  "6.10.2"
  "5.12.0"
)

for v in ${VERSIONS[@]}
do
  nvm install "$v"
  nvm use "$v"
  sleep 1
  printf "\n\n\n"
  echo "$v (modules: $(node -e 'console.log(process.versions.modules)'))"
  printf "\n\n\n"

  rm -rf node_modules
  yarn --pure
  yarn run src-build
  yarn test
  yarn run src-package
  yarn run src-publish
done
