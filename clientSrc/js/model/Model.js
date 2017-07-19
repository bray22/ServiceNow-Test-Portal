/*
* Model.js
*/

define(["backbone"], function (Backbone) {
    "use strict";

    /**
    * Extends Backbone.Model, and provides parent functionality common to all Models
    *
    * not really used yet - but the option is here...
    *
    * @class Model
    * @constructor
    * @extends Backbone.Model
    * @namespace model
    * @public
    */
    return Backbone.Model.extend({
        validate: function () {
        	return undefined;
        }
    });
});