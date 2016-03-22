(function() {
    'use strict';

    var path = require('path');
    var fileExists = require('../utils/fileExists');
    var readFile = require('../utils/readFile');
    var scraper = require('../utils/scraper');
    var marked = require('marked');
    var ComponentModel = require('../models/ComponentModel');
    var objectAssign = require('object-assign');

    /**
     * A collection of component models
     *
     * @class ComponentsCollection
     * @constructor
     */
    var ComponentsCollection = function() {
        /**
         * An object containing component
         * categories containing components
         * 
         * @property componentsCollection.components
         * @default {}
         */
        this.components = {};
    };

    var proto = ComponentsCollection.prototype;

    /**
     * Scrape the provides files for documentation
     * using the provided delimiters
     *
     * @method componentsCollection.scrape
     * @param {Array} files  a list of files to scrape
     * @param {Array} delimiters  open/close delimiters
     * @return {Object} components
     */
    proto.scrape = function(files, delimiters) {
        scraper
            .scrapeFiles(files, delimiters)
            .map(this.map)
            .filter(this.isValid)
            .sort(this.sort)
            .forEach(function(component) {
                this.add(component);
            }.bind(this));

        return this.components;
    };

    /**
     * Map the provided data to the
     * format of the component model
     *
     * @method componentsCollection.map
     * @param {Object} data
     * @return {Object} a component model
     */
    proto.map = function(data) {
        var description = data.description;
        var file = data._path + description;

        var componentModel = new ComponentModel().fromJSON({
            name: data.name,
            category: data.category,
            description: fileExists(file) ? marked(readFile(file)) : marked(description),
            path: path.join(data.category, data.filename || data.name + '.html')
        }).toJSON();

        return objectAssign(data, componentModel);
    };

    /**
     * Sort the provided components by category
     *
     * @method componentsCollection.sort
     * @param {Object} a  a component
     * @param {Object} b  a component
     * @return {Object} a component
     */
    proto.sort = function(a, b) {
        return a.category > b.category;
    };

    /**
     * Validate the provided component
     *
     * @method componentsCollection.isValid
     * @param {Object} component
     * @return {Boolean} is the component valid?
     */
    proto.isValid = function(component) {
        return component.category && component.name;
    };

    /**
     * Add the provided component to the component
     * collection or merge it if it already exists
     *
     * @method componentsCollection.add
     * @param {Object} component
     */
    proto.add = function(component) {
        var category = component.category;

        if (this.exists(component)) {
            this.merge(component);

            return;
        }

        if (!this.components[category]) {
            this.components[category] = [];
        }

        this.components[category].push(component);
    };

    /**
     * Merge the provided component into the
     * component with a matching name
     *
     * @method componentsCollection.merge
     * @param {Object} component
     */
    proto.merge = function(component) {
        var category = component.category;

        this.components[category] = this.components[category].map(function(c) {
            if (c.name === component.name) {
                return objectAssign(c, component);
            }

            return c;
        });
    };

    /**
     * Check if the provided component exists
     *
     * @method componentsCollection.exists
     * @param {Object} component
     * @return {Boolean} does the component exist?
     */
    proto.exists = function(component) {
        var category = component.category;

        if (!this.components[category]) {
            return false;
        }

        return this.components[category].filter(function(c) {
            return c.name === component.name;
        }).length > 0;
    };

    module.exports = ComponentsCollection;

} ());