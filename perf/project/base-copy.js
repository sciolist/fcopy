"use strict";
var ProgressBar = require('progress');
var fs = require('fs');
var Glob = require('glob').Glob;
var mkdir = (path)=>new Promise((s, e)=>fs.mkdir(path,(x,r)=>x?e(x):s(r)))
const MAXCONCURRENCY = 16;

const IN_PATH = "./alottafiles/node_modules";
const OUT_PATH = "./alottafiles/_node_modules";

module.exports = function copyFiles(filecopier) {
    var start = Date.now();
    var folderCount = 0, fileCount = 0;

    console.log('creating folder structure, gathering files...');
    var mg = new Glob(IN_PATH + '/**/*', {
        mark: true
    }, function () {
        console.log(folderCount + ' folders created, ' + fileCount + ' files gathered in ' + Math.round(Date.now() - start) + 'ms.');
        console.log('\nfile copying starting...');
        prog = new ProgressBar(':bar :ratef/s :percent :etas', {
            complete: '█',
            incomplete: '░',
            total: fileCount
        });

        start = Date.now();
        files.slice(0, MAXCONCURRENCY).map(startNextFile);
    });
    
    process.on('exit', () => {
        console.log(fileCount + ' files copied in ' + Math.round(Date.now() - start) + 'ms.');
    });

    var files = [], ci = 0, prog;
    function startNextFile() {
        var i = ci++;
        if (!files[i]) return;
        files[i](function (ex) {
            if (ex) console.error(ex);
            prog.tick(1);
            startNextFile();
        })
    }

    var addedCount = 0;
    var p = Promise.resolve(mkdir(OUT_PATH).catch(reportError));
    mg.on('match', function (src, st) {
        var dest = OUT_PATH + src.substring(IN_PATH.length);
        if (/\/$/.test(src)) {
            folderCount += 1;
            p.then(() => mkdir(dest).catch(reportError));
            return;
        } else {
            fileCount += 1;
            if (fileCount % 1000 === 0) {
                console.log('gathered ' + fileCount + ' files.');
            }
            files.push((cb) => filecopier(src, dest, cb));
        }
    });
}

function reportError(ex) {
    if (ex.code = 'EEXIST') return;
    console.error(ex);
    process.exit(2);
}
