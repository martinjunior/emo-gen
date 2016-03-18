(function() {
    'use strict';

    var fse = require('fs-extra');
    var Promise = require('promise');

    /**
     * Write the given data to the given file path
     * 
     * @param {String} file  a file path
     * @param {[type]} data
     * @return {Object} a promise
     */
    var writeFile = function(file, data) {
        return new Promise(function(resolve, reject) {
            fse.outputFile(file, data,
                function(error) {
                    if (error) {
                        reject(error);
                    }

                    resolve();
                }
            );
        });
     };

    module.exports = writeFile;

} ());