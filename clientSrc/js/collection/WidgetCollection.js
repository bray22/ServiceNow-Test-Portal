/*
* WidgetCollection.js
*/

define([
"require", 
"collection/Collection", 
"model/WidgetModel", 
"model/WidgetLayoutModel", 
"underscore"], 
function (
require, 
Collection, 
WidgetModel, 
WidgetLayoutModel, 
_) {
    
    "use strict";

    /**
    * defines a collection of widgets which a desktop owns, or is available through the content library
    *
    * @class WidgetCollection
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
        * @type WidgetModel
        * @protected
        */
        model: WidgetModel,

        /**
        * adds a listener to re-evalulate all widget positions
        *
        * @method initialize
        * @protected
        */
        initialize: function () {
            this.on("evaluate-positions", this.onEvaluatePositions, this);
        },

        /**
        * returns a trimmed down list of widget models, only containing data the server cares about
        * to save the desktop who owns this collection
        *
        * @return {Object[]}
        *
        * @method serialize
        * @public
        */
        serialize: function () {
            var output = [],
                count = this.models.length,
                i = 0;

            for ( ; i < count; i++) {
                output.push(this.models[i].serialize());
            }

            return output;
        },

        /**
        * event handler to the "evaluate-positions" callback - iterates widgets and ensures their 
        * layout data is accurate (since a change in 1 widget, can effect many widgets)
        *
        * @method onEvalulatePositions
        * @private
        */
        onEvaluatePositions: function () {
            var count = this.models.length,
                i = 0,
                $el,
                columns,
                layouts,
                shouldBe;

            for ( ; i < count; i++) {
                $el = this.models[i].get("WidgetView").$el;
                columns = this.models[i].get("WidgetView").myGridster.cols;
                layouts = this.models[i].get("LayoutCollection").where({ColumnWidth: columns});
                shouldBe = {
                    X: parseInt($el.attr("data-col"), 10),
                    Y: parseInt($el.attr("data-row"), 10),
                    Width: parseInt($el.attr("data-sizex"), 10),
                    Height: parseInt($el.attr("data-sizey"), 10),
                    ColumnWidth: columns
                };

                if (layouts.length) { // should ALWAYS be a length of 1
                    layouts[0].set(shouldBe, {silent: true});
                }
            }
        },

        /**
        * search the widget collection for matching widgets
        *
        * @param {String} query - "search" string, looks through name and tags
        * @param {String} buFilter - BU filter
        * @param {Stirng} roleFilter - Role filter
        * @param {String} sort - "alpha" or "popularity" sorting, defaults to "alpha"
        * @return {WidgetModel[]} - an array of widget models
        *
        * @method query
        * @public
        */
        query: function (query, buFilter, roleFilter, sort) {
            function existsInOutput (output, guid) {
                var found = false;

                _.each(output, function (item) {
                    if (item.get("Guid") === guid) {
                        found = true;
                        return false;
                    }
                });

                return found;
            }

            var start = Date.now(),
                output = [],
                query = (query ? query.toUpperCase().trim() : query),
                queryParts;

            if (query) {
                queryParts = query.split(" ");
                
                this.each(function (widgetModel) {
                    var match = false,
                        name = widgetModel.get("Name").toUpperCase();

                    if (!existsInOutput(output, widgetModel.get("Guid"))) {
                        _.each(queryParts, function (part) {
                            if (name.indexOf(part) !== -1) {
                                output.push(widgetModel);
                                match = true;
                            }
                        });

                        if (!match) {
                            _.each(widgetModel.get("Tags"), function (tag) {
                                if (tag.indexOf(query) !== -1) {
                                    output.push(widgetModel);
                                    match = true;
                                    return false;
                                }
                            });
                        }
                    }
                });
            } else {
                this.each(function (m) {
                    output.push(m);
                });
            }

            if (buFilter) {
                output = _.filter(output, function (widgetModel) {
                    var found = false;
                    _.each(widgetModel.get("BusinessUnitTags"), function (buTag) {
                        if (buTag.Key === buFilter) {
                            found = true;
                            return false;
                        }
                    });
                    return found;
                });
            }

            if (roleFilter) {
                output = _.filter(output, function (widgetModel) {
                    var found = false;
                    _.each(widgetModel.get("RoleTags"), function (roleTag) {
                        if (roleTag.Key === roleFilter) {
                            found = true;
                            return false;
                        }
                    });
                    return found;
                });
            }

            if (sort === "popularity") {
                output.sort(function (a, b) {
                    return a.get("PopularityRank") - b.get("PopularityRank");
                });
            } else {
                output.sort(function (a, b) {
                    var an = a.get("Name").toUpperCase().trim(),
                        bn = b.get("Name").toUpperCase().trim();

                    if (an < bn) {
                        return -1;
                    }

                    if (an > bn) {
                        return 1;
                    }

                    return 0;
                });
            }

            if (require("app").HubModel.get("Debug")) {
                console.info("WidgetCollection query duration: %sms", Date.now() - start);
            }

            return output;
        }
    });
});