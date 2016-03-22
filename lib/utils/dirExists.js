(function() {
    'use strict';

    var fs = require('fs');

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