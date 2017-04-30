"use strict";
const fcopy = require('..');
const t = require('tap');
const fs = require('fs');
const path = require('path');
const PREFIX = path.basename(__filename, '.js') + '-';

t.test('copying file succeeds', function (callback) {
    const F1 = __dirname + '/tmp/' + PREFIX + '-1'
    const F2 = __dirname + '/tmp/' + PREFIX + '-2'
    var CONTENTS = 'world';

    fs.writeFileSync(F1, CONTENTS);
    if (fs.existsSync(F2)) fs.unlinkSync(F2);

    return fcopy(F1, F2).then(() => {
        var found = fs.readFileSync(F2).toString();
        t.ok(found, CONTENTS);
    })
})
