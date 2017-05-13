#!/usr/bin/env bash
set -ue
DIR=$(cd $(dirname "$0") && pwd)
export NVS_HOME="$DIR/.nvs"
export PATH="$NVS_HOME:$PATH"
if [ ! -d "$NVS_HOME" ]
then
    git clone https://github.com/jasongin/nvs "$NVS_HOME"
    set +u
    . "$NVS_HOME/nvs.sh" install
    set -u
fi