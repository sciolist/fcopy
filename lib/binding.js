const package = require('../package.json');

function buildModuleName(info) {
    return info.binversion + '-' + info.abi + '-' + info.platform + '-' + info.arch;
};

var versionInfo = {
    binversion: package.binary.version,
    platform: process.platform,
    arch: process.arch,
    abi: process.versions.modules
};
var moduleName = buildModuleName(versionInfo);
var bindingRoot = __dirname + '/binding';
var bindingPath = bindingRoot + '/' + moduleName + '.node';

module.exports = {
    bindingRoot: bindingRoot,
    bindingPath: bindingPath,
    moduleName: moduleName,
    versionInfo: versionInfo,
    buildModuleName: buildModuleName
};
