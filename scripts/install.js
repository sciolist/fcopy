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
} else if (fs.existsSync(binding.bindingPath)) {
    // do nothing if the required binding exists
} else {
    downloadBinding(binding.versionInfo.abi).then(function download() {
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
        return downloadBinding(v);
    }));
}

function downloadBinding(abi) {
    const fileName = binding.buildModuleName(Object.assign({}, binding.versionInfo, {
        abi,
    }));
    console.log('downloading', fileName);
    return binding.downloadIfNeeded(abi);
}

function rebuildBinding() {
    let nodegyp = 'node-gyp';
    if (process.platform === 'win32') {
        nodegyp = path.resolve(__dirname, '../node_modules/.bin/node-gyp.cmd');
    }

    const output = cp.spawnSync(nodegyp, [
        'rebuild',
        '--modname=' + binding.moduleName,
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
