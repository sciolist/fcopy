'use strict';
const fcopy = require('..');
fcopy.setCopier(require('../lib/copiers/fallback'));
const t = require('tap');
const fs = require('fs');
const path = require('path');
const PREFIX = path.basename(__filename, '.js') + '-';
if (!fs.existsSync(__dirname + '/tmp')) {
    fs.mkdirSync(__dirname + '/tmp');
}

t.test('copying file to self fails', function test(callback) {
    const F1 = __dirname + '/tmp/' + PREFIX + '-1';
    const CONTENTS = 'world';
    fs.writeFileSync(F1, CONTENTS);

    return fcopy(F1, F1)
        .then(() => t.fail('expected call to fail'))
        .catch(ex => t.ok(ex.code, 'EPERM'));
});
