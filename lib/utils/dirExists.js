(function() {
    'use strict';

    var fs = require('fs');

    /**
     * Validate the provided directory exists
     * 
     * @param {String} dir
     * @return {Boolean}
     */
    var dirExists = function(dir) {
        var dirExists;

        try {
            dirExists = fs.lstatSync(dir).isDirectory();
        } catch(ex) {
            dirExists = false;
        }

        return dirExists;
    };

    module.exports = dirExists;

} ());