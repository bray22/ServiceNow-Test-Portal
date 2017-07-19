/*
* BroadcastCollection.js
*/

define(["collection/Collection", "model/BroadcastModel"], function (Collection, BroadcastModel) {
	"use strict";

	/**
    * defines a list of broadcast messages
    *
    * @class BroadcastCollection
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
        * @type BroadcastModel
        * @protected
        */
		model: BroadcastModel
	});
});