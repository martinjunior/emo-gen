(function() {
    'use strict';

    var glob = require('glob');
    var Promise = require('promise');

    /**
     * Expand the given glob patterns
     *
     * @param {Array}  patterns  a list of glob patterns
     * @return {Object} a promise
     */
    var expand = function(patterns) {
        var promiseList = [];

        promiseList = patterns.map(function(pattern) {
            return new Promise(function(resolve, reject) {
                glob(pattern, function(error, files) {
                    if (error) {
                        reject(error);

                        return;
                    }

                    resolve(files);
                });
            });
        });

        return Promise.all(promiseList).then(function(response) {
            var flattenedArray = [];

            response.forEach(function(filesAndDirectories) {
                flattenedArray = flattenedArray.concat(filesAndDirectories);
            });

            return flattenedArray;
        });
    };

    module.exports = expand;

} ());