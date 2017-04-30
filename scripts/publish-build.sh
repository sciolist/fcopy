#!/usr/bin/env bash
set -ue
cd $(dirname $(dirname "$0"))

yarn --pure
yarn run src-build
yarn test
yarn run src-package
yarn run src-publish
