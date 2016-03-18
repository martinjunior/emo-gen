(function() {
    'use strict';

    var copy = require('./copy');
    var Promise = require('promise');

    /**
     * Copy a list a src-dest file mappings
     *
     * @param {Array} files  a list of src-dest file mappings
     * @return {Object} a promsie
     */
    var copyAll = function(files) {
        var promise;

        files.forEach(function(file) {
            if (!promise) {
                promise = copy(file.src, file.dest);
            } else {
                promise = promise.then(function() {
                    return copy(file.src, file.dest);
                });
            }
        });

        if (!promise) {
            return new Promise(function(resolve, reject) {
                resolve();
            });
        }

        return promise;
    }

    module.exports = copyAll;

} ());