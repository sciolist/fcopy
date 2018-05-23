```
***DEPRECATION NOTICE***

This library has been superseded by the new fs.copyFile function in node 8.5.

See documentation here:
https://nodejs.org/api/fs.html#fs_fs_copyfile_src_dest_flags_callback
```

fcopy
========

When there's a file in a place and a new place for the file.

Installation
------------

    npm install fcopy

Usage
-----

```js
const fcopy = require('fcopy');

// using callbacks
fcopy('./my-file', './my-new-file', function (err) {
    if (err) console.error(err);
});

// using promises
fcopy('./my-file', './my-new-file').then(function (err) {
    if (err) console.error(err);
});
```
