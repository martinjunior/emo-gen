(function() {
    'use strict';

    var path = require('path');
    var expand = require('../utils/expand');
    var fileExists = require('../utils/fileExists');
    var dirExists = require('../utils/dirExists');
    var ViewModel = require('../models/ViewModel');
    var scraper = require('../utils/scraper');
    var Promise = require('promise');
    var objectAssign = require('object-assign');

    /**
     * A collection of view models
     *
     * @class ViewsCollection
     * @constructor
     */
    var ViewsCollection = function(delimiters) {
        this.views = [];

        this.delimiters = delimiters;
    };

    var proto = ViewsCollection.prototype;

    /**
     * Retrieve all the views found
     * within the provided path; the provided
     * path is expected to extend for src
     *
     * @method viewsCollection.get
     * @param {String} src  the directory the view sources files live in
     * @param {String} dest  the directory the views will be built to
     * @param  {String} views  the path to the views
     * @return {Object} a promise
     */
    proto.get = function(src, dest, views) {
        var srcDoesNotExist = !dirExists(path.join(src, views));
        var destDoesNotExist = !dirExists(dest);

        if (srcDoesNotExist || destDoesNotExist) {
            return new Promise(function(resolve, reject) {
                resolve();
            });
        }

        dest = path.join(dest, views);
        var pattern = path.join(src, views, '**');

        return expand([pattern]).then(function(files) {
            files.forEach(function(file) {
                if (!fileExists(file)) {
                    return;
                }

                var file = path.normalize(file);
                var _src = path.join('./', file.replace(src, ''));
                var _dest = path.join(dest, _src.replace(views, ''));

                this.add({
                    _src: file,
                    path: _src,
                    dest: _dest
                });
            }.bind(this));

            return this.views;
        }.bind(this));
    };

    proto.sortByName = function(a, b) {
        if (a.name > b.name) {
            return 1;
        } else if (a.name < b.name) {
            return -1;
        } else {
            return 0;
        }
    };

    proto.validate = function(view) {
        return typeof view.name === 'string';
    };

    proto.add = function(view) {
        var data = scraper.scrapeFiles([view._src], this.delimiters)[0] || {};
        var basename = path.basename(view.path);
        var extname = path.extname(view.path);

        // allow the name property to be overriden by the user
        var viewModel = new ViewModel().fromJSON(objectAssign(data, {
            _src: view.src,
            dest: view.dest,
            path: view.path,
        })).toJSON();

        if (!this.validate(viewModel)) {
            return;
        }

        // pick up any user-provided properties that
        // aren't available in the view model
        this.views.push(objectAssign(data, viewModel));
        this.views.sort(this.sortByName);
    };

    module.exports = ViewsCollection;

} ());