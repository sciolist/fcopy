const fs = require('fs');

module.exports = function fcopy_streams(src, dest, opts, callback) {
    try {
        const reader = fs.createReadStream(src);
        const writer = fs.createWriteStream(dest, opts.mode);
        reader.on('error', callback);
        writer.on('error', callback);
        writer.on('open', function() {
            reader.pipe(writer);
        });
        writer.on('close', function() {
            callback();
        });
    } catch(ex) {
        setImmediate(function() {
            callback(ex);
        });
    }
}
