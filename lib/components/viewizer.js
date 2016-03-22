(function() {
    'use strict';

    var path = require('path');
    var expand = require('../utils/expand');
    var fileExists = require('../utils/fileExists');

    var viewizer = {};

    viewizer.buildViewsObject = function(src, dest, dir) {
        var data = [];
        var dest = path.join(dest, dir);
        var pattern = path.join(src, dir, '**');

        return expand([pattern]).then(function(files) {
            files.forEach(function(file) {
                if (fileExists(file)) {
                    var filename = path.basename(file);

                    data.push({
                        src: file.replace(src, ''),
                        dest: path.join(dest, filename)
                    });
                }
            });

            return data;
        });
    };

    module.exports = viewizer;

} ());