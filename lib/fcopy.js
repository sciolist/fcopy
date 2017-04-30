"use strict";
const binary = require('node-pre-gyp');
const path = require('path');
const binding_path = binary.find(path.resolve(path.join(__dirname, '../package.json')));
const binding = require(binding_path);
const utils = require('./utils');

const sendfile = utils.withFileDescriptors(binding.sendfile);
module.exports = function fcopy(src, dest, callback) {
    let ex = utils.validate(src, dest);

    if (callback) {
        if (ex) process.nextTick(() => callback(ex));
        else sendfile(src, dest, callback);
        return;
    }

    return new Promise(function (resolve, reject) {
        if (ex) return reject(ex);
        sendfile(src, dest, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}
