(function() {
    'use strict';

    var fse = require('fs-extra');
    var Promise = require('promise');

    function copy(src, dest) {
        return new Promise(function resolve(resolve, reject) {
            fse.copy(src, dest, function(error) {
                if (error) {
                    reject(error);

                    return;
                }

                resolve();
            });
        });
    }

    module.exports = copy;

} ());