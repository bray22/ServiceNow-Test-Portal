/*
* DefectBacklogDistilledView.js
*/

define([
"widgets/radar/baseViews/TimeSeriesChartView",
"widgets/radar/util/RadarAjax",
"underscore",
"jquery",
"text!widgets/radar/templates.html"],
function (
TimeSeriesChartView, 
RadarAjax, 
_, 
$, 
templates) {
        
    "use strict";

    /**
    * defines the rendering logic for defect distilled arrivals view
    *
    * @class DefectBacklogDistilledView
    * @extends TimeSeriesChartView
    * @namespace radar
    * @constructor
    * @public
    */
    return TimeSeriesChartView.extend({

        /**
        * initialize the chart
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            var settings = params.settings;
            settings.title = settings.program + " | " + settings.chart.title;

            if (params.appmode) {
                this.model.set("AppmodeTitle", settings.title);
                this.initAppmode(settings);
                return;
            }

            var paramConfig = $.extend({
                p: settings.program
            }, settings.chart.paramConfig);

            this.polltime(settings.chart.polltime);

            RadarAjax.GetBacklog(paramConfig, function (data) {
                data = _(this.convertNegatives(data)).reject(d => isNaN(d.count));

                var chartOpts = $.extend(true, {
                    categoryField: "group",
                    graphs: this.createGraphsList(data, "method", settings.chart.graphOptions),
                }, settings.chart.chartOptions);

                var pivotData = this.pivotData(data, "method", "count", "wk");

                this.createGraphTotal(pivotData, chartOpts.graphs);

                this.render(this.$el, pivotData, chartOpts);
            }, this);

            TimeSeriesChartView.prototype.initialize.apply(this, arguments);
        },

        /**
        * initialize appmode iframe
        *
        * @param {Object} settings
        *
        * @method initAppmode
        * @private
        */
        initAppmode: function (settings) {
            this.$el.append(this.template("Radar-Appmode-Iframe", {
                Source: [
                    RadarAjax.appmodeDomain,
                    "/dashboard#defects?p=",
                    settings.program,
                    "&tab=",
                    settings.chart.paramConfig.tab,
                    "&p1=",
                    settings.chart.paramConfig.p1,
                    "&p13=",
                    settings.chart.paramConfig.p13,
                    "&guid=",
                    this.model.get("InstanceGuid")
                ].join("")
            }, null, templates));
        }
    });
});