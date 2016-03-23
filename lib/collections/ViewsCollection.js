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

        var dest = path.join(dest, views);
        var pattern = path.join(src, views, '**');

        return expand([pattern]).then(function(files) {
            files.forEach(function(file) {
                if (!fileExists(file)) {
                    return;
                }

                var _src = file.replace(src, '');
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

    proto.add = function(view) {
        var data = scraper.scrapeFiles([view._src], this.delimiters)[0] || {};
        var basename = path.basename(view.path);
        var extname = path.extname(view.path);

        var viewModel = new ViewModel().fromJSON(
            objectAssign(
                view,
                {
                    name: basename.replace(extname, '')
                },
                data
            )
        ).toJSON();

        this.views.push(viewModel);
    };

    module.exports = ViewsCollection;

} ());