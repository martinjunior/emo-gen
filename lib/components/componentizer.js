(function() {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var marked = require('marked');
    var fileExists = require('../utils/fileExists');
    var scraper = require('./scraper');
    var readFile = require('../utils/readFile');
    var ComponentModel = require('../models/ComponentModel');
    var objectAssign = require('object-assign');

    /**
     * Scrapes data from source files, shaping said data
     * to the format expected by the style guide generator:
     *
     * {
     *     category: [{
     *         name: 'Btn',
     *         category: 'content',
     *         description: '<button></button>'
     *     }],
     *     otherCategory: [...],
     *     thirdCategory: [...]
     * }
     * 
     * @class componentizer
     * @static
     */
    var componentizer = {};

    /**
     * Scrape the provided files for component data;
     * return the processed, validated, and filtered data
     * 
     * @method componentizer.scrape
     * @param {Array} files  files to scrape
     * @param {Array} delimiters  open and close delimiters
     */
    componentizer.scrape = function(files, delimiters) {
        var data = {};

        scraper
            .scrapeFiles(files, delimiters)
            .map(componentizer.process)
            .filter(componentizer.isValid)
            .sort(componentizer.sort)
            .forEach(function(component) {
                var category = component.category;

                if (!data[category]) {
                    data[category] = [];
                }

                data[category].push(component);
            });

        return data;
    };

    /**
     * Sort by category
     * 
     * @method componentizer.sort
     * @param {Object} a  component model
     * @param {Object} b  component model
     */
    componentizer.sort = function(a, b) {
        return a.category > b.category;
    };

    /**
     * Process the given data as a component;
     * attach extraneous propertys to the returned model
     * 
     * @method componentizer.process
     * @param {Object} data
     */
    componentizer.process = function(data) {
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
     * Validate the provided component
     * 
     * @method componentizer.isValid
     * @param {Object} component
     */
    componentizer.isValid = function(component) {
        return component.category && component.name;
    };

    module.exports = componentizer;

} ());