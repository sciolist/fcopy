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

t.test('copying file succeeds', function test(callback) {
    const F1 = __dirname + '/tmp/' + PREFIX + '-1';
    const F2 = __dirname + '/tmp/' + PREFIX + '-2';
    const CONTENTS = 'world';

    fs.writeFileSync(F1, CONTENTS);
    if (fs.existsSync(F2)) { fs.unlinkSync(F2); }

    return fcopy(F1, F2, {mode: 0o666}).then(() => {
        const found = fs.readFileSync(F2).toString();
        t.ok(found, CONTENTS);
    });
});
