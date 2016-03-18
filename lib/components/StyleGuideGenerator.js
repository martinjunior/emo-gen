(function() {
    'use strict';

    var path = require('path');
    var componentizer = require('./componentizer');
    var fileExists = require('../utils/fileExists');
    var expand = require('../utils/expand');
    var copy = require('../utils/copy');
    var copyAll = require('../utils/copyAll');
    var writeFile = require('../utils/writeFile');
    var fse = require('fs-extra');
    var swig = require('swig');
    var Promise = require('promise');
    var objectAssign = require('object-assign');

    /**
     * A style guide generator
     *
     * @param {Object} options  user overrides
     */
    var StyleGuideGenerator = function(options) {
        /**
         * @property styleGuideGenerator.options
         * @type {Object}
         */
        this.options = objectAssign(StyleGuideGenerator.OPTIONS, options || {});

        this.init();
    };

    /**
     * Default style guide options
     *
     * @property StyleGuideGenerator.OPTIONS
     * @static
     * @final
     */
    StyleGuideGenerator.OPTIONS = {
        path: {
            src: 'styleguide/src/',
            dest: 'styleguide/dest/',
            _src: path.join(__dirname, '../../styleguide/')
        },
        delimiters: ['{#', '#}'],
        DEFAULT_COMPONENT_TEMPLATE: 'templates/component.html'
    };

    var proto = StyleGuideGenerator.prototype;

    /**
     * Initialize the styleGuideGenerator
     * 
     * @method styleGuideGenerator.init
     */
    proto.init = function() {
        swig.setDefaults({
            loader: swig.loaders.fs(this.options.path.src)
        });

        // ensure paths end with a '/' or '\'
        this.options.path.src = path.join(this.options.path.src, path.sep);
        this.options.path.dest = path.join(this.options.path.dest, path.sep);
    };

    /**
     * Place the style guide src files in their
     * working directory (specified by this.options.src)
     * 
     * @method styleGuideGenerator.place
     */
    proto.place = function() {
        // if index.html exists in the working directory, return early
        if (fileExists(path.join(this.options.path.src, 'index.html'))) {
            return new Promise(function(resolve, reject) {
                resolve();
            });
        }

        return copy(this.options.path._src, this.options.path.src);
    };

    /**
     * Copy all of the specified files
     * to their specified destinations
     * 
     * @method styleGuideGenerator.copy
     * @param {Array} files  a list of src-dest file mappings
     */
    proto.copy = function(files) {
        return copyAll(files);
    };

    proto.scrape = function(files) {
        return expand(files).then(function(expandedFiles) {
            return componentizer.scrape(expandedFiles, this.options.delimiters);
        }.bind(this));
    };

    /**
     * Build the style guide
     * 
     * @method styleGuideGenerator.build
     * @return {Object} a promise
     */
    proto.build = function(components) {
        return this.buildIndex(components).then(function() {
            return this.buildComponents(components);
        }.bind(this));
    };

    /**
     * Build the index.html page
     * 
     * @method styleGuideGenerator.buildIndex
     * @param {Array} components  a list of components
     * @return {Object} a promise
     */
    proto.buildIndex = function(components) {
        var data = {
            pathToRoot: '',
            components: components
        };

        return writeFile(
            this.options.path.dest + 'index.html',
            swig.compileFile('index.html')(data)
        );
    };

    /**
     * Build out the provided components
     * 
     * @method styleGuideGenerator.buildComponents
     * @param {Array} components  a list of components
     * @return {Object} a promise
     */
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

                return writeFile(
                    path.join(this.options.path.dest, component.path),
                    swig.compileFile(template)(data)
                );
            }.bind(this));
        }.bind(this));

        return Promise.all(promiseList);
    };

    module.exports = StyleGuideGenerator;

} ());