/*
* SizeModel.js
*/

define(["model/Model"], function (Model) {
    "use strict";

    /**
    * defines a size for a widget
    *
    * @class SizeModel
    * @constructor
    * @extends Model
    * @namespace model
    * @public
    */
    return Model.extend({

        /**
        * defines default null-values for all model attributes
        *
        * @return {Object}
        *
        * @method defaults
        * @protected
        */
        defaults: function () {
            return {
                X: 1,
                Y: 1,
                Enabled: true
            };
        },

        /**
        * make attribute modifications before anything uses this model
        *
        * only 0-checking here, happened in some strange edge-case which hasn't cropped again, safety first...
        *
        * @method initialize
        * @protected
        */
        initialize: function () {
            if (!this.get("X")) {
                this.set("X", 1, {silent: true});
            }
            if (!this.get("Y")) {
                this.set("Y", 1, {silent: true});
            }
        }
    });
});