/*
* SizeCollection.js
*/

define(["collection/Collection", "model/SizeModel"], function (Collection, SizeModel) {
    "use strict";

    /**
    * contains a list of sizes a widget can be set to
    *
    * @class SizeCollection
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
        * @type SizeModel
        * @protected
        */
        model: SizeModel
    });
});