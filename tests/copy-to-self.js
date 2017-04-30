"use strict";
const fcopy = require('..');
const t = require('tap');
const fs = require('fs');
const path = require('path');
const PREFIX = path.basename(__filename, '.js') + '-';

t.test('copying file to self fails', function (callback) {
    const F1 = __dirname + '/tmp/' + PREFIX + '-1'
    var CONTENTS = 'world';
    fs.writeFileSync(F1, CONTENTS);

    return fcopy(F1, F1)
        .then(() => t.fail('expected call to fail'))
        .catch(ex => t.ok(ex.code, 'EPERM'));
})
