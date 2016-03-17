(function() {
    'use strict';

    var path = require('path');
    var componentizer = require('./componentizer');
    var fileExists = require('../utils/fileExists');
    var expandFiles = require('../utils/expandFiles');
    var copy = require('../utils/copy');
    var copyFiles = require('../utils/copyFiles');
    var fse = require('fs-extra');
    var swig = require('swig');
    var Promise = require('promise');
    var objectAssign = require('object-assign');

    var StyleGuide = function(options) {
        this.options = objectAssign(StyleGuide.OPTIONS, options || {});

        this.init();
    };

    StyleGuide.OPTIONS = {
        path: {
            src: 'styleguide/src/',
            dest: 'styleguide/dest/',
            _src: path.join(__dirname, '../../styleguide/')
        },
        delimiters: ['{#', '#}'],
        DEFAULT_COMPONENT_TEMPLATE: 'templates/component.html'
    };

    var proto = StyleGuide.prototype;

    proto.init = function() {
        swig.setDefaults({
            loader: swig.loaders.fs(this.options.path.src)
        });

        this.options.path.src = path.join(this.options.path.src, path.sep);
        this.options.path.dest = path.join(this.options.path.dest, path.sep);
    };

    proto.place = function() {
        if (fileExists(path.join(this.options.path.src, 'index.html'))) {
            return new Promise(function(resolve, reject) {
                resolve();
            });
        }

        return copy(this.options.path._src, this.options.path.src);
    };

    proto.copyFiles = function(filesToCopy) {
        return copyFiles(filesToCopy);
    };

    proto.build = function(files) {
        return expandFiles(files).then(function(expandedFiles) {
            var components = componentizer.scrape(expandedFiles, this.options.delimiters);

            return this.buildIndex(components).then(function() {
                return this.buildComponents(components);
            }.bind(this));
        }.bind(this));
    };

    proto.buildIndex = function(components) {
        var data = {
            pathToRoot: '',
            components: components
        };

        return new Promise(function(resolve, reject) {
            fse.outputFile(
                this.options.path.dest + 'index.html',
                swig.compileFile('index.html')(data),
                function(error) {
                    if (error) {
                        reject(error);
                    }

                    resolve();
                }
            );
        }.bind(this));
    };

    proto.buildComponents = function(components) {
        var promiseList = [];
        var categories = Object.keys(components);

        categories.map(function(category) {
            promiseList = components[category].map(function(component) {
                var template = component.template || this.options.DEFAULT_COMPONENT_TEMPLATE;

                var data = {
                    pathToRoot: '..' + path.sep,
                    component: component,
                    components: components
                };

                return new Promise(function(resolve, reject) {
                    fse.outputFile(
                        path.join(this.options.path.dest, component.path),
                        swig.compileFile(template)(data),
                        function(error) {
                            if (error) {
                                reject(error);
                            }

                            resolve();
                        }
                    );
                }.bind(this));
            }.bind(this));
        }.bind(this));

        return Promise.all(promiseList);
    };

    module.exports = StyleGuide;

} ());