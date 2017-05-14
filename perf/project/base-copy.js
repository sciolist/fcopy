'use strict';
const ProgressBar = require('progress');
const fs = require('fs');
const mkdir = path => new Promise((s, e) => fs.mkdir(path, (x, r) => x ? e(x) : s(r)));
const MAXCONCURRENCY = 16;

const IN_PATH = './alottafiles/node_modules';
const OUT_PATH = './alottafiles/_node_modules';

module.exports = async function copyFiles(filecopier) {
    let start = Date.now();
    let folderCount = 0;
    let fileCount = 0;
    let files = [];

    console.log('creating folder structure, gathering files...');

    const paths = fs.readdirSync(IN_PATH).map(p => IN_PATH + '/' + p);
    await Promise.resolve(mkdir(OUT_PATH).catch(reportError));
    while (paths.length) {
        const src = paths.shift();
        const info = fs.statSync(src);
        const dest = OUT_PATH + src.substring(IN_PATH.length);
        if (info.isDirectory()) {
            folderCount += 1;
            const children = fs.readdirSync(src).map(p => src + '/' + p);
            await mkdir(dest).catch(reportError);
            paths.push.apply(paths, children);
        } else {
            fileCount += 1;
            if (fileCount % 1000 === 0) {
                console.log('gathered ' + fileCount + ' files.');
            }
            files.push(cb => filecopier(src, dest, cb));
        }
    }

    let ci = 0;
    console.log(folderCount + ' folders created, '
        + fileCount + ' files gathered in '
        + Math.round(Date.now() - start) + 'ms.');
    console.log('\nfile copying starting...');
    const prog = new ProgressBar(':bar :ratef/s :percent :etas', {
        complete: '█',
        incomplete: '░',
        total: fileCount,
    });

    start = Date.now();
    files.slice(0, MAXCONCURRENCY).map(startNextFile);
    
    process.on('exit', () => {
        console.log(fileCount + ' files copied in ' + Math.round(Date.now() - start) + 'ms.');
    });

    function startNextFile() {
        const i = ci++;
        if (!files[i]) { return; }
        files[i](function complete(ex) {
            if (ex) { console.error(ex); }
            prog.tick(1);
            startNextFile();
        });
    }
};

function reportError(ex) {
    if (ex.code = 'EEXIST') { return; }
    console.error(ex);
    process.exit(2);
}
