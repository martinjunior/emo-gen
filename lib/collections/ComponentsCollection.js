(function() {
    'use strict';

    var path = require('path');
    var fileExists = require('../utils/fileExists');
    var readFile = require('../utils/readFile');
    var scraper = require('../utils/scraper');
    var marked = require('marked');
    var ComponentModel = require('../models/ComponentModel');
    var objectAssign = require('object-assign');

    var ComponentsCollection = function() {
        this.components = [];
    };

    var proto = ComponentsCollection.prototype;

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

    proto.sort = function(a, b) {
        return a.category > b.category;
    };

    proto.isValid = function(component) {
        return component.category && component.name;
    };

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

    proto.merge = function(component) {
        var category = component.category;

        this.components[category] = this.components[category].map(function(c) {
            if (c.name === component.name) {
                return objectAssign(c, component);
            }

            return c;
        });
    };

    proto.exists = function(component) {
        var category = component.category;

        if (!this.components[component]) {
            return false;
        }

        return this.components[category].filter(function(c) {
            return c.name === component.name;
        }).length > 0;
    };

    module.exports = ComponentsCollection;

} ());