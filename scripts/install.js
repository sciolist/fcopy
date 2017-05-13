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
    return new Promise(function (resolve, reject) {
        var fileName = binding.buildModuleName(Object.assign({}, binding.versionInfo, {
            abi: abi
        }));

        var target=binding.bindingRoot + '/' + fileName + '.node';
        var source='https://github.com/sciolist/fcopy/releases/download/bin-v' + binding.versionInfo.binversion + '/' + fileName + '.node';
        var request = https.get(source, processDownload);
        
        console.log('downloading', source);
        function processDownload(res) {
            if (res.statusCode === 301 || res.statusCode === 302) {
                https.get(res.headers.location, processDownload);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error('cannot download prebuilt ' + fileName));
                return;
            }

            var writer = fs.createWriteStream(target);
            writer.on('error', reject);
            writer.on('close', resolve);
            res.pipe(writer);
        };
    });
}

function rebuildBinding() {
    var dir = path.resolve(__dirname, '../lib/binding');
    var output = cp.spawnSync('node-gyp', [
        'rebuild',
        '--modname=' + binding.moduleName
    ], {
        cwd: path.resolve(__dirname, '..'),
        stdio: ['inherit', 'inherit', 'inherit']
    });
    if (output.error || output.status) {
        throw output.error;
    }
}
