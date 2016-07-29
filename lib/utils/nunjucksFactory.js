(function() {
    'use strict';

    var path = require('path');
    var nunjucks = require('nunjucks');

    var nunjucksFactory = {
        createEnvironment: function(loaders, options) {
            return new nunjucks.Environment(loaders, options);
        },

        createLoader: function(directory) {
            var qualifiedPath = path.join(path.resolve(directory), path.sep);

            return new nunjucks.FileSystemLoader(qualifiedPath);
        },

        createLoaders: function(directories) {
            return directories.map(function(directory) {
                return nunjucksFactory.createLoader(directory);
            });
        }
    };

    module.exports = nunjucksFactory;

} ());