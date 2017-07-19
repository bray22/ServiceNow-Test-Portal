/*
* TopRankedFeatureBacklogView.js
*/

define([
"widgets/cateams/charts/ChartView", 
"widgets/cateams/CATeamsAjax", 
"text!widgets/cateams/templates.html",
"underscore"], 
function (
ChartView, 
Ajax, 
templates, 
_) {
        
    "use strict";

    /**
    * renders the top ranked feature backlog
    *
    * @class TopRankedFeatureBacklogView
    * @extends ChartView
    * @constructor
    * @namespace cateams
    * @public
    */
    return ChartView.extend({

        /**
        * get data and render thedom
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.model.set("Name", params.settings.team.Name + ", Top Ranked Feature Backlog");

            this.showLoading(this.$el, function () {
                Ajax.GetTopRanked(params.settings.team.ObjectID, function (data) {
                    this.hideLoading(function () {
                        if (data) {
                            this.render(this.formatData(data.Data));
                        } else {
                            this.renderError();
                        }
                    });
                }, this);
            });
        },

        /**
        * what to render when data retrieval fails
        *
        * @method renderError
        * @private
        */
        renderError: function () {
            this.displayError("There was an error retrieving your data, please try again later.");
        },

        /**
        * format the incoming data for rendering
        *
        * @param {Array} data
        * @return {Array} 
        *
        * @method formatData
        * @private
        */
        formatData: function (data) {
            function isEmpty(val) {
                return ((_.isEmpty(val) || !val) ? "" : val);
            }

            var output = [];

            _.each(data, function (item) {
                output.push({
                    ID: item.FormattedID,
                    Name: item.Name,
                    ByCount: Math.round(item.PercentDoneByStoryCount * 100) + "%",
                    ByEstPts: Math.round(item.PercentDoneByStoryPlanEstimate * 100) + "%",
                    PSI: isEmpty(item.c_DPSI),
                    Attempted: isEmpty(item.UtmsAttPct),
                    Passed: isEmpty(item.UtmsPassPct),
                    Rank: item.pp_Rank || ""
                })
            });

            return output;
        },

        /**
        * render the given data to the widget
        *
        * @param {Array}
        *
        * @method render
        * @private
        */
        render: function (data) {
            this.$el.append(this.template("TopRanked-Top", null, null, templates));

            this.renderTables(this.$(".cateam-topranked-small"), this.$(".cateam-topranked-large-body"), data);
        },

        /**
        * render the tables
        *
        * @param {jQuery} $smallEl - the line item container for 1x1
        * @param {jQuery} $largeEl - the line item container for larger sizes
        * @param {Array} data
        *
        * @method renderTables
        * @private
        */
        renderTables: function ($smallEl, $largeEl, data) {
            _.each(data, function (item) {
                $smallEl.append(this.template("TopRanked-VerticalLineItem", item, null, templates));
                $largeEl.append(this.template("TopRanked-TableLineItem", item, null, templates));
            }, this);
        }
    });
});