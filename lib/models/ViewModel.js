(function() {
    'use strict';

    /**
     * @class ViewModel
     * @constructor
     */
    var ViewModel = function() {
        this.src = null;
        this.dest = null;
        this.name = null;
    };

    ViewModel.prototype.fromJSON = function(json) {
        this.src = json.src;
        this.dest = json.dest;
        this.name = json.name;

        return this;
    };

    ViewModel.prototype.toJSON = function() {
        return {
            src: this.src,
            dest: this.dest,
            name: this.name
        };
    };

    module.exports = ViewModel;

} ());