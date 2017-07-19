/*
* LayoutCollection.js
*/

define([
"collection/Collection", 
"model/WidgetLayoutModel", 
"view/DesktopView"], 
function (
Collection, 
WidgetLayoutModel, 
DesktopView) {
	
	"use strict";

	/**
    * defines a list of profile layouts at different column widgets for widgets
    *
    * @class LayoutCollection
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
        * @type WidgetLayoutModel
        * @protected
        */
		model: WidgetLayoutModel,

		/**
		* recursively gets the closest column profile looking downwards
		*
		* @param {Number} columnCount
		*
		* @method getNextLowest
		* @private
		*/
		getNextLowest: function (columnCount) {
			if (columnCount >= 1) {
				var profiles = this.where({ColumnWidth: columnCount});

				if (profiles.length) {
					return profiles[profiles.length -1];
				} else {
					return this.getNextLowest(columnCount -1); // recursion!!!
				}
			} else {
				return undefined;
			}
		}
	});
});