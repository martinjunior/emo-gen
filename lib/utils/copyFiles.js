(function() {
    'use strict';

    var copy = require('./copy');
    var Promise = require('promise');

    function copyFiles(filesToCopy) {
        var promise;

        filesToCopy.forEach(function(srcDestFileMapping) {
            if (!promise) {
                promise = copy(srcDestFileMapping.src, srcDestFileMapping.dest);
            } else {
                promise = promise.then(function() {
                    return copy(srcDestFileMapping.src, srcDestFileMapping.dest);
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

    module.exports = copyFiles;

} ());