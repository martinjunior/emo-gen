(function() {
    'use strict';

    /**
     * @class ComponentModel
     * @constructor
     */
    function ComponentModel() {
        this.name;
        this.category;
        this.description;
        this.path;
    }

    ComponentModel.prototype.fromJSON = function(json) {
        this.name = json.name;
        this.category = json.category;
        this.description = json.description;
        this.path = json.path;

        return this;
    };

    ComponentModel.prototype.toJSON = function() {
        return {
            name: this.name,
            category: this.category,
            description: this.description,
            path: this.path
        };
    };

    module.exports = ComponentModel;

} ());