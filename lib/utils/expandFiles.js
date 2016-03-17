(function() {
    'use strict';

    var glob = require('glob');
    var Promise = require('promise');

    function expandFiles(files) {
        var promiseList = [];

        promiseList = files.map(function(file) {
            return new Promise(function(resolve, reject) {
                glob(file, function(error, files) {
                    if (error) {
                        reject(error);

                        return;
                    }

                    resolve(files);
                });
            });
        });

        return Promise.all(promiseList).then(function(filesArray) {
            var flattenedArray = [];

            filesArray.forEach(function(files) {
                flattenedArray = flattenedArray.concat(files);
            });

            return flattenedArray;
        });
    };

    module.exports = expandFiles;

} ());