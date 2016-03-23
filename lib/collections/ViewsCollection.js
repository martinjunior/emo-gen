(function() {
    'use strict';

    var path = require('path');
    var expand = require('../utils/expand');
    var fileExists = require('../utils/fileExists');
    var dirExists = require('../utils/dirExists');
    var ViewModel = require('../models/ViewModel');
    var Promise = require('promise');

    /**
     * A collection of view models
     *
     * @class ViewsCollection
     * @param {String} src  the views source directory
     * @param {String} dest  the views dest directory
     * @constructor
     */
    var ViewsCollection = function(src, dest) {
        this.views = [];
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

                this.views.push(new ViewModel().fromJSON({
                    src: file.replace(src, ''),
                    dest: path.join(dest, path.basename(file))
                }).toJSON());
            }.bind(this));

            return this.views;
        }.bind(this));
    };

    module.exports = ViewsCollection;

} ());