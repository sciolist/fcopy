var path = require('path');
var fs = require('fs');
var binding = require('../lib/binding.js');
var cp = require('child_process');
var https = require('https');
var package = require('../package.json');

if (!fs.existsSync(binding.bindingRoot)) {
    fs.mkdirSync(binding.bindingRoot);
}

if (process.env.FCOPY_REBUILD) {
    rebuildBinding()
} else if (fs.existsSync(binding.bindingPath)) {
    // do nothing if the required binding exists
} else {
    downloadBinding(binding.versionInfo.abi).then(function () {
        var otherAbis = Object.keys(package.binary.abis).filter(function(abi) { return abi !== binding.versionInfo.abi; });
        downloadBindings(otherAbis).catch(function (err) {});
    }, function (err) {
        console.error(err.message);
        rebuildBinding();
    });
}

function downloadBindings(abis) {
    return Promise.all(abis.map(function (v) {
        return downloadBinding(v);
    }));
}

function downloadBinding(abi) {
    var fileName = binding.buildModuleName(Object.assign({}, binding.versionInfo, {
        abi: abi
    }));
    console.log('downloading', fileName);
    return binding.downloadIfNeeded(abi);
}

function rebuildBinding() {
    var nodegyp = 'node-gyp';
    if (process.platform === 'win32') {
        nodegyp = path.resolve(__dirname, '../node_modules/.bin/node-gyp.cmd');
    }

    var dir = path.resolve(__dirname, '../lib/binding');
    var output = cp.spawnSync(nodegyp, [
        'rebuild',
        '--modname=' + binding.moduleName
    ], {
        cwd: path.resolve(__dirname, '..'),
        stdio: ['inherit', 'inherit', 'inherit']
    });
    if (output.error || output.status) {
        var error = output.error || (new Error(String(output.stderr||output.status)));
        console.error(error.stack);
        throw error;
    }
}
