(function() {
    'use strict';

    var fs = require('fs');

    var readFile = function(filePath) {
        return fs.readFileSync(
            filePath,
            { encoding: 'utf8' }
        ).replace(/^\uFEFF/, '')
    };

    module.exports = readFile;

} ());