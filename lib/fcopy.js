"use strict";
const binary = require('node-pre-gyp');
const path = require('path');
const binding_path = binary.find(path.resolve(path.join(__dirname, '../package.json')));
const binding = require(binding_path);
const utils = require('./utils');
const NOOPTS = {};

const sendfile = utils.withFileDescriptors(binding.sendfile);
module.exports = function fcopy(src, dest, opts, callback) {
    if (typeof opts === 'function') {
        callback = opts;
        opts = undefined;
    }

    if (!opts) {
        opts = NOOPTS;
    }

    let ex = utils.validate(src, dest, opts);
    if (callback) {
        if (ex) setImmediate(() => callback(ex));
        else sendfile(src, dest, opts, callback);
        return;
    }

    return new Promise(function (resolve, reject) {
        if (ex) return reject(ex);
        sendfile(src, dest, opts, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}
