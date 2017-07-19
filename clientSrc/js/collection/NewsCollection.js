/*
* NewsCollection.js
*
* encapsulates a collection of news
*/

define(["collection/Collection", "model/NewsChannelModel"], function (Collection, NewsChannelModel) {
    "use strict";

    /**
    * defines a list of channels, who owns a list of articles
    *
    * @class NewsCollection
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
        * @type NewsChannelModel
        * @protected
        */
        model: NewsChannelModel,

        /**
        * used by the heartbeat to get a list of article ID's that the client already knows about
        *
        * @return {Array}
        *
        * @method getIdList
        * @public
        */
        getIdList: function () {
            var output = [];

            this.each(function (channelModel) {
                channelModel.get("ArticleCollection").each(function (articleModel) {
                    output.push(articleModel.get("ArticleId"));
                });
            });

            return output;
        }
    });
});
