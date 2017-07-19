/*
* AlertCollection.js
*/

define(["collection/Collection", "model/AlertModel"], function (Collection, AlertModel) {
    "use strict";

    /**
    * AlertCollection contains the list of alert-models to be rendered/interacted with for the user
    *
    * @class AlertCollection
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
        * @type AlertModel
        * @protected
        */
        model: AlertModel,

        /**
        * used in the heartbeat to post a list of alert ID's the client already knows about
        *
        * @return {Array}
        *
        * @method getIdList
        * @public
        */
        getIdList: function () {
            var output = [];

            this.each(function (model) {
                output.push(model.get("AlertId"));
            });

            return output;
        }
    });
});