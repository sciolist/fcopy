'use strict';
const baseCopy = require('../base-copy');
const copier = require('../../../lib/copiers/fallback');
baseCopy((src, dest, callback) => copier(src, dest, {}, callback));
