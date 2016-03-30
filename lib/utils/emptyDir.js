(function() {
    'use strict';

    var fse = require('fs-extra');
    var Promise = require('promise');

    var emptyDir = function(dir) {
        var promise = new Promise(function(resolve, reject) {
            fse.emptyDir(dir, function(error) {
                if (error) {
                    reject(error);
                }

                resolve();
            });
        });
        
        return promise;
    }

    module.exports = emptyDir;

} ());