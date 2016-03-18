(function() {
    'use strict';

    var fse = require('fs-extra');
    var Promise = require('promise');

    /**
     * Copy given source file or directory
     * to the given destination
     * 
     * @param {String} src
     * @param {String} dest
     * @return {Object} a promise
     */
    var copy = function(src, dest) {
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