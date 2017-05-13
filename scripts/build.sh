#!/usr/bin/env bash
# https://nodejs.org/en/download/releases/

set -ue
DIR=$(cd $(dirname "$0") && pwd)
source setup-nvs.sh
export PATH="$DIR/../node_modules/.bin:$PATH"

set +u
nvs add "$1"
set -u

export PATH="$(dirname $(nvs which $1)):$PATH"
node_version=$(node -e 'console.log(process.version)')

printf "\n\n\n"
echo "$node_version (modules: $(node -e 'console.log(process.versions.modules)'))"
printf "\n\n\n"

cd ..
rm -rf node_modules
FCOPY_REBUILD=1 yarn --pure-lockfile
yarn test
