/*
* AlertModel.js
*/

define(["model/Model", "util/Environment", "moment"], function (Model, Environment, moment) {
    "use strict";

    /**
    * defines all attributes for an alert
    *
    * @class AlertModel
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
                AlertId: 0,
                Title: "",
                Description: "",
                Url: "",
                Timestamp: 0,
                TimestampUI: "", // outsystems formatted date string
                Status: "N",
                LinkOpenMode: ""
            };
        },

        /**
        * make attribute modifications before anything uses this model
        *
        * @method initialize
        * @protected
        */
        initialize: function () {
            var url = this.get("Url");
            if (url && url.indexOf("http") === -1) {
                this.set("Url", Environment + url, {silent: true});
            }

            if (this.get("Timestamp")) {
                this.set("TimestampUI", moment(this.get("Timestamp")).format("MM/DD/YYYY HH:mm:ss")); // TODO: use the 'global' datetime format variable or function
            }

            this.on("change:Status", this.onSaveStatus, this);
        },

        /**
        * the status just changed, save the new status to the server
        *
        * @method onSaveStatus
        * @private
        */
        onSaveStatus: function () {
            require(["util/Ajax", "app"], $.proxy(function (Ajax, App) {
                Ajax.ViewAlert(this.get("AlertId"), function (success) {
                    if (!success && App.HubModel.get("Debug")) {
                        console.warn("Alert Status failed to save");
                    }
                });
            }, this));
        }
    });
});