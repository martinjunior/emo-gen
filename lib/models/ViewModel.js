(function() {
    'use strict';

    /**
     * @class ViewModel
     * @constructor
     */
    var ViewModel = function() {
        this._src = null;
        this.dest = null;
        this.path = null;
        this.name = null;
    };

    ViewModel.prototype.fromJSON = function(json) {
        this._src = json._src;
        this.dest = json.dest;
        this.path = json.path;
        this.name = json.name;

        return this;
    };

    ViewModel.prototype.toJSON = function() {
        return {
            _src: this._src,
            dest: this.dest,
            path: this.path,
            name: this.name
        };
    };

    module.exports = ViewModel;

} ());