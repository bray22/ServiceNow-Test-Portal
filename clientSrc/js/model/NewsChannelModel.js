/*
* NewsChannelModel.js
*/

define(["model/Model", "collection/NewsArticleCollection", "moment"], function (Model, NewsArticleCollection, moment) {
    "use strict";

    /**
    * all attributes for a news item
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
                ChannelId: 0,
                Name: "",
                Description: "",
                Creator: "",
                CreatedTimestamp: 0, // not used yet
                Icon: "",
                IsSubscribed: true,
                IsMandatory: false,
                ArticleCollection: []
            };
        },

        /**
        * initialize inner-collection
        *
        * @method initialize
        * @protected
        */
        initialize: function () {
            this.set("ArticleCollection", new NewsArticleCollection(this.get("ArticleCollection")), {silent: true});
        },

        /**
        * overriden JSON conversion to deal with inner collection
        *
        * @method toJSON
        * @protected
        */
        toJSON: function () {
            var output = Model.prototype.toJSON.call(this);

            output.ArticleCollection = this.get("ArticleCollection").toJSON();

            return output;
        }
    });
});