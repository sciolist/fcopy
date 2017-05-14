"use strict"

const fs = require('fs');
const packageJson = require('../package.json');
const https = require('https');

const URL = 'https://github.com/sciolist/fcopy/releases/download/bin-v{0}/{1}.node';

function fsmkdir(path) {
    return new Promise(function (resolve, reject) {
        fs.mkdir(path, function (err) { if (err) reject(err); else resolve(); });
    })
}

function fsexists(path) {
    return new Promise(function (resolve, reject) {
        fs.exists(path, function (exists) { resolve(exists); });
    })
}

const versionInfo = {
    binversion: packageJson.binary.version,
    platform: process.platform,
    arch: process.arch,
    abi: process.versions.modules
};

function buildModuleName(info) {
    return info.binversion + '-' + info.abi + '-' + info.platform + '-' + info.arch;
}
const moduleName = buildModuleName(versionInfo);
const bindingRoot = __dirname + '/binding';
const bindingPath = bindingRoot + '/' + moduleName + '.node';

function downloadIfNeeded(abi) {
    let requestAbi = arguments.length === 0 ? versionInfo.abi : abi;
    const fileName = buildModuleName(Object.assign({}, versionInfo, {
        abi: requestAbi
    }));
    const target = bindingRoot + '/' + fileName + '.node';
    const url = URL.replace('{0}', versionInfo.binversion).replace('{1}', fileName);
    return createBindingDirectory()
        .then(function () { return fsexists(target); })
        .then(function (found) { return found || httpDownload(url, target); })
}

function createBindingDirectory() {
    return fsexists(bindingRoot).then(function (found) {
        if (!found) {
            return fsmkdir(bindingRoot);
        }
    });
}

function httpDownload(url, target) {
    return new Promise(function (resolve, reject) {
        const request = https.get(url, processDownload);

        function processDownload(res) {
            if (res.statusCode === 301 || res.statusCode === 302) {
                https.get(res.headers.location, processDownload);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error('cannot download ' + url));
                return;
            }
            const writer = fs.createWriteStream(target);
            writer.on('error', reject);
            writer.on('close', function() { resolve(true); });
            res.pipe(writer);
        };
    });
}

module.exports = {
    bindingRoot: bindingRoot,
    bindingPath: bindingPath,
    moduleName: moduleName,
    versionInfo: versionInfo,
    buildModuleName: buildModuleName,
    downloadIfNeeded: downloadIfNeeded
};
