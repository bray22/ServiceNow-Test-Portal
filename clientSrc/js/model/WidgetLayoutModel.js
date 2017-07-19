/*
* WidgetLayoutModel.js
*/

define(["model/Model"], function (Model) {
    "use strict";

    /**
    * defines the width/height/position of a widget at particular at column counts
    *
    * @class WidgetLayoutModel
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
                Width: 1,
                Height: 1,
                ColumnWidth: 0
            };
        }
    });
});