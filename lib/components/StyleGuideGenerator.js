(function() {
    'use strict';

    var path = require('path');
    var ComponentsCollection = require('../collections/ComponentsCollection');
    var ViewsCollection = require('../collections/ViewsCollection');
    var fileExists = require('../utils/fileExists');
    var expand = require('../utils/expand');
    var copy = require('../utils/copy');
    var copyAll = require('../utils/copyAll');
    var writeFile = require('../utils/writeFile');
    var emptyDir = require('../utils/emptyDir');
    var Promise = require('promise');
    var objectAssign = require('object-assign');
    var nunjucks = require('nunjucks');

    /**
     * A style guide generator
     *
     * @param {Object} options  user overrides
     */
    var StyleGuideGenerator = function(options, nunjucksOptions) {
        /**
         * @property styleGuideGenerator.options
         * @type {Object}
         */
        this.options = objectAssign(StyleGuideGenerator.OPTIONS, options || {});

        /**
         * @property styleGuideGenerator.nunjucksOptions
         */
        this.nunjucksOptions = objectAssign(nunjucksOptions || {}, StyleGuideGenerator.NUNJUCKS_OPTIONS);

        /**
         * @property styleGuideGenerator.componentsCollection
         */
        this.componentsCollection = new ComponentsCollection();

        /**
         * @property styleGuideGenerator.viewsCollection
         */
        this.viewsCollection = new ViewsCollection(this.options.delimiters);

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
            dest: 'styleguide/dest/'
        },
        DEFAULT_COMPONENT_TEMPLATE: 'templates/component.html'
    };

    StyleGuideGenerator.NUNJUCKS_OPTIONS = {
        autoescape: false
    };

    StyleGuideGenerator.SRC = path.join(__dirname, '../../styleguide/');

    StyleGuideGenerator.getRelativePath = function(to, from) {
        return path.relative(to, from).replace(/\.\.$/, '');
    };

    var proto = StyleGuideGenerator.prototype;

    /**
     * Initialize the styleGuideGenerator
     * 
     * @method styleGuideGenerator.init
     */
    proto.init = function() {
        // ensure paths end with a '/' or '\'
        this.options.path.src = path.normalize(path.join(this.options.path.src, path.sep));
        this.options.path.dest = path.normalize(path.join(this.options.path.dest, path.sep));

        // configure nunjucks
        nunjucks.configure(path.join(path.resolve(this.options.path.src), path.sep), this.nunjucksOptions);
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

        return copy(StyleGuideGenerator.SRC, this.options.path.src);
    };

    /**
     * Copy all of the specified files
     * to their specified destinations
     * 
     * @method styleGuideGenerator.copy
     * @param {Array} files  a list of src-dest file mappings
     */
    proto.copy = function(files) {
        return copyAll(files).then(function() {
            return files.filter(function(file) {
                return fileExists(file.src);
            });
        });
    };

    /**
     * Scrape the provided files
     * for component documentation
     * 
     * @method styleGuideGenerator.scrape
     * @param {Array} files  files to scrape
     */
    proto.scrape = function(files) {
        return expand(files).then(function(expandedFiles) {
            return this.componentsCollection.scrape(expandedFiles);
        }.bind(this));
    };

    /**
     * @method styleGuideGenerator.emptyDestinationFolder
     */
    proto.emptyDestinationFolder = function() {
        return emptyDir(this.options.path.dest);
    };

    /**
     * Build the style guide
     * 
     * @method styleGuideGenerator.build
     * @param {Array} componentFiles  a list of component files/glob patterns
     * @param {String} viewDir  the path to the views directory
     * @return {Object} a promise
     */
    proto.build = function(componentFiles, viewDir) {
        return this.scrape(componentFiles).then(function() {
            if (!viewDir) {
                return;
            }

            return this.viewsCollection.get(
                this.options.path.src,
                this.options.path.dest,
                path.normalize(path.join(viewDir, path.sep))
            );

        }.bind(this)).then(function() {

            return this.buildIndex();

        }.bind(this)).then(function() {

            return this.buildComponents();

        }.bind(this)).then(function() {

            return this.buildViews();

        }.bind(this));
    };

    /**
     * Build the index.html page
     * 
     * @method styleGuideGenerator.buildIndex
     * @return {Object} a promise
     */
    proto.buildIndex = function() {
        var data = {
            pathToRoot: '',
            components: this.componentsCollection.components,
            views: this.viewsCollection.views
        };

        return writeFile(
            path.join(this.options.path.dest, 'index.html'),
            nunjucks.render('index.html', data)
        );
    };

    /**
     * Build out the components
     * 
     * @method styleGuideGenerator.buildComponents
     * @return {Object} a promise
     */
    proto.buildComponents = function() {
        var promiseList = [];
        var categories = Object.keys(this.componentsCollection.components);

        categories.map(function(category) {
            promiseList = this.componentsCollection.components[category].map(function(component) {
                var template = component.template || this.options.DEFAULT_COMPONENT_TEMPLATE;

                var data = {
                    pathToRoot: path.join('..', path.sep),
                    component: component,
                    components: this.componentsCollection.components,
                    views: this.viewsCollection.views
                };

                return writeFile(
                    path.join(this.options.path.dest, component.path),
                    nunjucks.render(template, data)
                );
            }.bind(this));
        }.bind(this));

        return Promise.all(promiseList);
    };


    /**
     * Build out the views
     * 
     * @method styleGuideGenerator.buildViews
     * @return {Object} a promise
     */
    proto.buildViews = function() {
        var promiseList = [];

        promiseList = this.viewsCollection.views.map(function(view) {
            var data = {
                pathToRoot: StyleGuideGenerator.getRelativePath(path.join(view.path), ''),
                components: this.componentsCollection.components,
                view: view,
                views: this.viewsCollection.views
            };

            return writeFile(
                view.dest,
                nunjucks.render(view.path, data)
            );
        }.bind(this));

        return Promise.all(promiseList);
    };

    module.exports = StyleGuideGenerator;

} ());