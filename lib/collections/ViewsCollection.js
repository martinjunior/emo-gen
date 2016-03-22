(function() {
    'use strict';

    var path = require('path');
    var expand = require('../utils/expand');
    var fileExists = require('../utils/fileExists');
    var ViewModel = require('../models/ViewModel');

    var ViewsCollection = function(src, dest) {
        this.src = src;

        this.dest = dest;

        this.views = [];
    };

    var proto = ViewsCollection.prototype;

    proto.get = function(views) {
        var dest = path.join(this.dest, views);
        var pattern = path.join(this.src, views, '**');

        return expand([pattern]).then(function(files) {
            files.forEach(function(file) {
                if (!fileExists(file)) {
                    return;
                }

                this.views.push(new ViewModel().fromJSON({
                    src: file.replace(this.src, ''),
                    dest: path.join(dest, path.basename(file))
                }).toJSON());
            }.bind(this));

            return this.views;
        }.bind(this));
    };

    module.exports = ViewsCollection;

} ());