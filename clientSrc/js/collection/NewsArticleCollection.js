/*
* NewsArticleCollection.js
*/

define(["collection/Collection", "model/NewsArticleModel"], function (Collection, NewsArticleModel) {
    "use strict";

    /**
    * defines a list of news articles, contained by a news channel
    *
    * @class NewsArticleCollection
    * @constructor
    * @extends Collection
    * @namespace collection
    * @public
    */
    return Collection.extend({

        /**
        * defines what model this collection encapsulates
        *
        * @property model
        * @type NewsArticleModel
        * @protected
        */
        model: NewsArticleModel,

        /**
        * auto-sort the articles on their time-stamp
        *
        * @method comparator
        * @protected
        */
        comparator: function (a, b) {
            return b.get("Timestamp") - a.get("Timestamp");
        },

        /**
        * search for articles - called from NewsView
        *
        * @param {String} query
        *
        * @method query
        * @public
        */
        query: function (query) {
            var results = [];
            
            query = query.toUpperCase();

            this.each(function (articleModel) {
                if (articleModel.get("Title").toUpperCase().indexOf(query) !== -1) {
                    results.push(articleModel);
                }
            });

            return results;
        }
    });
});