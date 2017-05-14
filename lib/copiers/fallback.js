'use strict';
const fs = require('fs');

module.exports = function fcopy_streams(src, dest, opts, callback) {
    try {
        const reader = fs.createReadStream(src);
        const writer = fs.createWriteStream(dest, opts.mode);
        reader.on('error', finish);
        writer.on('error', finish);
        writer.on('open', function() {
            reader.pipe(writer);
        });
        writer.on('close', function() {
            finish();
        });

        function finish(err) {
            try { reader.destroy(); } catch (ex) {}
            try { writer.destroy(); } catch (ex) {}
            if (err) {
                callback(err);
            } else {
                callback();
            }
        }
    } catch (ex) {
        setImmediate(function() {
            callback(ex);
        });
    }
};
