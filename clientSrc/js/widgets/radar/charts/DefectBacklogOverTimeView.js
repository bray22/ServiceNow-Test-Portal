/*
* DefectBacklogOverTimeView.js
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

    var defaultParamConfig = {
        tab: "OBL",
        p2: "Bug",
        p1: "P00|P01|P02|"
    },
    fillColors = {
        P00: ["#CF5555", "#612828"],
        P01: ["#E65C5F", "#DF3337"],
        P02: ["#EDD24F", "#E8C625"],
        P03: ["#9EC070", "#75A13B"],
        P04: "#CCCC66"
    };

    /**
    * defines view rendering logic for Defect backlog over time
    *
    * @class DefectBacklogOverTimeView
    * @extends TimeSeriesChartView
    * @constructor
    * @namespace radar
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
            this.settings = params.settings;
             
            // setup title - a little quirly based on if it's program or feature based                 
            this.settings.title = [
                this.settings.program, 
                (this.settings.feature ? " (" + this.settings.feature.Ra_FormattedID + ")" : ""), 
                " | ", 
                this.settings.chart.title
            ].join("");

            if (params.appmode) {
                this.model.set("AppmodeTitle", this.settings.title);
                this.initAppmode(this.settings);
                return;
            }

            this.polltime(this.settings.chart.polltime);

            var paramConfig = $.extend({}, defaultParamConfig, {
                p: this.settings.program,
                p3: this.settings.feature && this.settings.feature.Ars_FeatureId
            }, this.settings.chart.paramConfig || {});

            RadarAjax.GetBacklog(paramConfig, function (data) {
                data = _(data).reject(d => !d.wk);

                var chartOpts = {
                    categoryField: "wk",
                    graphs: this.createGraphsList(paramConfig.p1.split("|"))
                };

                if (data && data.length) {
                    this.createGraphTotal(data, chartOpts.graphs, {
                        type: "column", // needs to be the same type as graphs it's summing
                        legendPeriodValueText: "[[close.close]]", // don't understand this quirk
                    });

                    this.render(this.$el, data, chartOpts, {
                        clickGraphItem: $.proxy(this.drilldown, this)
                    });
                } else {
                    this.renderNoData();
                }
            }, this);

            TimeSeriesChartView.prototype.initialize.apply(this, arguments);
        },

        /**
        * initialize the appmode iframe
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
                    "&p2=",
                    settings.chart.paramConfig.p2,
                    "&guid=",
                    this.model.get("InstanceGuid")
                ].join("")
            }, null, templates));
        },

        /**
        * some missing comment
        *
        * @method createGraphsList
        * @private
        */
        createGraphsList: function (valueKeys) {
            var graphs = [],
                graphOpts = this.defaultGraphOptions();

            _.each(_(valueKeys).reject(p => !p), function (item, i) {
                graphs.push($.extend({}, graphOpts, {
                    bullet: "",
                    balloonText: item + ": [[value]]",
                    showBalloon: true,
                    valueField: item,
                    fillColors: fillColors[item],
                    gradientOrientation: "horizontal",
                    title: item,
                    legendPeriodValueText: "[[value.close]]",
                    type: "column"
                }));
            });

            return graphs;
        },

        /**
        * there is no data for the graph, render a friendly message
        *
        * @method renderNoData
        * @private
        */
        renderNoData: function () {
            this.hideLoading(function () {
                this.$el.append(this.template("Program-Backlog-No-Data", null, null, templates));
            });
        },

        /**
        * user drilled down on the graph
        *
        * @param {AmChartsEvent} event
        *
        * @method drilldown
        * @private
        */
        drilldown: function (event) {
            require(["view/IframeModalView"], $.proxy(function (IframeModalView) {
                new IframeModalView({
                    title: "AR Details",
                    url: [
                        RadarAjax.cashBaseUrl,
                        "#?source=remedyIssue",
                        "&save=false",
                        "&p12=false",
                        "&tab=OBLT",
                        "&p=", this.settings.program,
                        "&p1=P00|P01|P02",
                        "&p2=Bug",
                        "&p3=", this.settings.feature && this.settings.feature.Ars_FeatureId,
                        "&wk=", event.item.dataContext.wk
                    ].join(""),
                    width: "90%",
                    height: "90%"
                });
            }, this));
        }
    });
});