(function() {
    'use strict';

    var fs = require('fs');

    /**
     * Determine whether or not
     * a given file exists
     *
     * @param {String} pathToFile
     * @return {Boolean}
     */
    var fileExists = function(pathToFile) {
        var fileExists;

        try {
            fileExists = fs.statSync(pathToFile).isFile();
        } catch(ex) {
            fileExists = false;
        }

        return fileExists;
    };

    module.exports = fileExists;

} ());