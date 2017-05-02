"use strict";
const path = require('path');
const utils = require('./utils');
const NOFALLBACK = !!process.env.FCOPY_NOFALLBACK;
const NOOPTS = {};
let copier;

module.exports = function fcopy(src, dest, opts, callback) {
    if (copier === undefined) {
        copier = findCopier();
    }

    if (typeof opts === 'function') {
        callback = opts;
        opts = undefined;
    }

    if (!opts) {
        opts = NOOPTS;
    }

    let ex = utils.validate(src, dest, opts);
    if (callback) {
        if (ex) {
            setImmediate(function () { callback(ex); })
        } else {
            copier(src, dest, opts, callback);
        }
        return;
    }

    return new Promise(function (resolve, reject) {
        if (ex) return reject(ex);
        copier(src, dest, opts, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

function findCopier() {
    try {
        const binary = require('node-pre-gyp');
        const binding_path = binary.find(path.resolve(path.join(__dirname, '../package.json')));
        const binding = require(binding_path);
        return require('./copiers/sendfile')(binding);
    } catch(ex) {
        if (NOFALLBACK) throw ex;
    }

    return require('./copiers/fallback');
}
