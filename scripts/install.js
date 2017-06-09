"use strict";
const path = require('path');
const fs = require('fs');
const binding = require('../lib/bindings.js');
const cp = require('child_process');
const packageJson = require('../package.json');

if (!fs.existsSync(binding.bindingRoot)) {
    fs.mkdirSync(binding.bindingRoot);
}

if (process.env.FCOPY_REBUILD) {
    rebuildBinding();
} else if (process.argv.length === 3 && process.argv[2] === '--download') {
    Promise.all(Object.keys(packageJson.binary.abis).map(v => {
        return Promise.all(['win32', 'darwin', 'linux'].map(platform => downloadBinding(v, platform)));
    }))
        .catch(err => {
            console.error(err);
            process.exitCode = 1;
        });
} else if (fs.existsSync(binding.bindingPath)) {
    // do nothing if the required binding exists
} else {
    downloadBinding(binding.versionInfo.abi, process.platform).then(function download() {
        const otherAbis = Object.keys(packageJson.binary.abis).filter(function(abi) {
            return abi !== binding.versionInfo.abi;
        });
        downloadBindings(otherAbis).catch(function downloadBindingsErr(err) {});
    }, function downloadBindingErr(err) {
        console.error(err.message);
        rebuildBinding();
    });
}

function downloadBindings(abis) {
    return Promise.all(abis.map(function mapAbi(v) {
        return downloadBinding(v, process.platform);
    }));
}

function downloadBinding(abi, platform) {
    return binding.downloadIfNeeded(Object.assign({}, binding.versionInfo, {
        abi, platform,
    }));
}

function rebuildBinding() {
    let nodegyp = 'node-gyp';
    if (process.platform === 'win32') {
        nodegyp = path.resolve(__dirname, '../node_modules/.bin/node-gyp.cmd');
    }

    const output = cp.spawnSync(nodegyp, [
        'rebuild',
        '--modname=' + binding.buildModuleName(binding.versionInfo),
    ], {
        cwd: path.resolve(__dirname, '..'),
        stdio: ['inherit', 'inherit', 'inherit'],
    });
    if (output.error || output.status) {
        const error = output.error || (new Error(String(output.stderr || output.status)));
        console.error(error.stack);
        throw error;
    }
}
