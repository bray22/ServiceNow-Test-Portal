/*
* BroadcastModel.js
*/

define(["model/Model"], function (Model) {
    "use strict";

    /**
    * all attributes for a broadcast message
    *
    * @class BroadcastModel
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
                Id: -1,
                Title: "",
                Message: "",
                Author: "",
                StartTime: 0,
                EndTime: 0
            };
        }
    });
});