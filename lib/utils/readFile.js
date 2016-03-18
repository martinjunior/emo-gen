(function() {
    'use strict';

    var fs = require('fs');

    /**
     * Read a file in a cross environment manner
     * (remove byte order mark from files)
     *
     * @param {String} filePath
     * @return {String} file contents
     */
    var readFile = function(filePath) {
        return fs.readFileSync(
            filePath,
            { encoding: 'utf8' }
        ).replace(/^\uFEFF/, '')
    };

    module.exports = readFile;

} ());