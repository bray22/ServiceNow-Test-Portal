/*
* DesktopCollection.js
*/

define(["collection/Collection", "model/DesktopModel"], function (Collection, DesktopModel) {
    "use strict";

    /**
    * Provides a parent abstraction point to all collections
    *
    * @class DesktopCollection
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
        * @type DesktopModel
        * @protected
        */
        model: DesktopModel,

        /**
        * performs a simple error check, making sure there is an active desktop to initialize
        *
        * @method initialize
        * @protected
        */
        initialize: function (models) {
        	var count = models.length,
        		i = 0,
        		hasActive = false;

    		for ( ; i < count; i++) {
    			if (models[i].IsActive === true) {
    				hasActive = true;
    				break;
    			}
    		}

    		if (hasActive === false && count) {
    			models[0].IsActive = true;
    		}
        }
    });
});