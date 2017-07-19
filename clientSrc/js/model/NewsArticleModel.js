/*
* NewsArticleModel.js
*/

define(["model/Model", "moment"], function (Model, moment) {
    "use strict";

    /**
    * contains the attributes for a single news article
    *
    * @class NewsArticleModel
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
                ArticleId: 0,
                ChannelId: 0,
                Title: "",
                Timestamp: 0,
                TimestampUI: "", // outsystems formatted date string
                Author: "",
                ChannelName: "",
                Status: "D" // D: dismissed, N: new, V: viewed
            };
        },

        /**
        * init save events
        *
        * @method initialize
        * @protected
        */
        initialize: function () {
            this.on("change:Status", this.saveStatus, this);

            if (this.get("Timestamp")) {
                this.set("TimestampUI", moment(this.get("Timestamp")).format("MM/DD/YYYY HH:mm:ss")); // TODO: use the 'global' datetime format variable or function
            }
        },

        /**
        * save the status of this articleModel
        *
        * @param {NewsArticleModel} model (this)
        * @param {String} val
        *
        * @method saveStatus
        * @private
        */
        saveStatus: function (model, val) {
            require(["app", "util/Ajax"], function (App, Ajax) {
                Ajax.SetNewsStatus(model.get("ArticleId"), val, function (success) {
                    if (App.HubModel.get("Debug")) {
                        console.log("NewsArticleModel.saveStatus() - saved new article status success: %s", success);
                    }
                });
            });
        }
    });
});