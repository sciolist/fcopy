"use strict";
const utils = require('../utils');

module.exports = function (binding) {
    return utils.withFileDescriptors(binding.sendfile);
}
