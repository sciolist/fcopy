"use strict";
const fs = require('fs');
const baseCopy = require('../base-copy');

baseCopy((src, dest, callback) => {
    var read = fs.createReadStream(src);
    var write = fs.createWriteStream(dest);
    write.on('error', callback);
    read.on('error', callback);
    read.on('open', () => read.pipe(write))
    write.on('close', () => callback());
});
