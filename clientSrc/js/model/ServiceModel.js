/*
* ServiceModel.js
*/

define(["model/Model", "util/Environment"], function (Model, Environment) {
    "use strict";

    /**
    * contains all attributes for a service
    *
    * @class NewsChannelModel
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
                PluginId: -1,
                Name: "",
                Description: "",
                Url: ""
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

            this.set("Name", this.get("Name").trim(), {silent: true});
            this.set("Description", this.get("Description").trim(), {silent: true});
            this.set("Url", this.get("Url").trim(), {silent: true});
        }
    });
});