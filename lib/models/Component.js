(function() {
    'use strict';

    function Component() {
        this.name;
        this.category;
        this.description;
        this.path;
    }

    Component.prototype.fromJSON = function(json) {
        this.name = json.name;
        this.category = json.category;
        this.description = json.description;
        this.path = json.path;

        return this;
    };

    Component.prototype.toJSON = function() {
        return {
            name: this.name,
            category: this.category,
            description: this.description,
            path: this.path
        };
    };

    module.exports = Component;

} ());