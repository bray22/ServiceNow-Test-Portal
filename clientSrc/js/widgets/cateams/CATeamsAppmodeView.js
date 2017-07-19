/*
* CATeamAppmode.js
*/

define([
"view/View",
"widgets/cateams/charts/IterationBurndownView",
"widgets/cateams/charts/CumulativeFlowView",
"widgets/cateams/charts/TopRankedFeatureBacklogView",
"widgets/cateams/charts/DefectSummaryView",
"text!widgets/cateams/templates.html"],
function (
View, 
IterationBurndownView, 
CumulativeFlowView, 
TopRankedFeatureBacklogView, 
DefectSummaryView, 
templates) {

    "use strict";

    /**
    * encapsulates the dashboard logic for CA Teams widget in appmode
    *
    * @class CATeamAppmode
    * @extends View
    * @namespace cateams
    * @constructor
    * @public
    */
    return View.extend({

        /**
        * initialize the dashboard view
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.$el.append(this.template("Dashboard-Layout", null, null, templates));

            this.model.set("AppmodeTitle", params.settings.team.Name + " Team Reporting");

            this.burndown = new IterationBurndownView({
                el: this.$(".cateams-dashboard-1"),
                model: this.model,
                appmode: true,
                settings: params.settings
            });

            this.cumulative = new CumulativeFlowView({
                el: this.$(".cateams-dashboard-2"),
                model: this.model,
                appmode: true,
                settings: params.settings
            });

            this.backlog = new TopRankedFeatureBacklogView({
                el: this.$(".cateams-dashboard-3"),
                model: this.model,
                appmode: true,
                settings: params.settings
            });

            this.defects = new DefectSummaryView({
                el: this.$(".cateams-dashboard-4"),
                model: this.model,
                appmode: true,
                settings: params.settings
            });
        }
    });
});