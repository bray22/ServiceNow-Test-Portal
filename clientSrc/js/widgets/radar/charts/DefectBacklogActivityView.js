/*
* DefectBacklogActivityView.js
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
    * defines the view used to render the backlog in/out data
    *
    * @class DefectBacklogActivityView
    * @extends TimeSeriesChartView
    * @constructor
    * @namespace radar
    * @public
    */
    return TimeSeriesChartView.extend({

        defaultParamConfig: {
            tab: "BI", // This indicates the Backlog Incoming table
            p2: "Bug",
            p1: "P00|P01|P02|",
            p13: "Move%20In|New|Reopen|Other|"
        },

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

            var paramConfig = $.extend({}, this.defaultParamConfig, {
                p: settings.program
            }, settings.chart.paramConfig || {});

            this.polltime(settings.chart.polltime);

            RadarAjax.GetBacklog(paramConfig, function (data) {
                data = _.chain(this.convertNegatives(data))
                    .reject(d => isNaN(d.count))
                    .sortBy("wk")
                    .value();

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