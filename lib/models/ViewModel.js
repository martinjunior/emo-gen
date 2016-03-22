(function() {
    'use strict';

    /**
     * @class ViewModel
     * @constructor
     */
    var ViewModel = function() {
        this.src = null;
        this.dest = null;
    };

    ViewModel.prototype.fromJSON = function(json) {
        this.src = json.src;
        this.dest = json.dest;

        return this;
    };

    ViewModel.prototype.toJSON = function() {
        return {
            src: this.src,
            dest: this.dest
        };
    };

    module.exports = ViewModel;

} ());