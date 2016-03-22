(function() {
    'use strict';

    var path = require('path');
    var expand = require('../utils/expand');
    var fileExists = require('../utils/fileExists');
    var ViewModel = require('../modles/ViewModel');

    var ViewsCollection = function(options) {
        this.options = options;

        this.views = [];
    };

    var proto = ViewsCollection.prototype;

    proto.get = function() {
        var dest = path.join(this.options.dest, this.options.path);
        var pattern = path.join(this.options.src, this.options.path, '**');

        return expand([pattern]).then(function(files) {
            files.forEach(function(file) {
                if (!fileExists(file)) {
                    return;
                }

                this.add({
                    src: file.replace(src, ''),
                    dest: path.join(dest, path.basename(file))
                });
            }.bind(this));

            return this.views;
        }.bind(this));
    };

    proto.add = function(view) {
        this.views.push(new ViewModel().fromJSON());
    };

    module.exports = ViewsCollection;

} ());