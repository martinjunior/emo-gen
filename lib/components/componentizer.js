(function() {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var marked = require('marked');
    var fileExists = require('../utils/fileExists');
    var scraper = require('./scraper');
    var readFile = require('../utils/readFile');
    var Component = require('../models/Component');
    var objectAssign = require('object-assign');

    var componentizer = {};

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

    componentizer.sort = function(a, b) {
        return a.category > b.category;
    };

    componentizer.process = function(component) {
        var componentModel = new Component().fromJSON({
            name: component.name,
            category: component.category,
            description: componentizer.mark(component._path + component.description) || component.description,
            path: path.join(component.category, component.filename || component.name + '.html')
        }).toJSON();

        return objectAssign(component, componentModel);
    };

    componentizer.mark = function(filePath) {
        if (!fileExists(filePath)) {
            return false;
        }

        return marked(readFile(filePath));
    };

    componentizer.isValid = function(component) {
        return component.category && component.name;
    };

    module.exports = componentizer;

} ());