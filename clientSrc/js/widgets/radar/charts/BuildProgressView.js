/*
* BuildProgressView.js
*/

define([
"widgets/radar/baseViews/RadarView", 
"widgets/radar/util/RadarAjax", 
"amcharts.serial", 
"underscore", 
"jquery",
"text!widgets/radar/templates.html",
"amcharts.responsive"], 
function (
RadarView, 
RadarAjax, 
AmCharts, 
_, 
$, 
templates, 
AmChartsResponsive) {
        
    "use strict";

    /**
    * displays an AmChart Build-Progress for the current program
    *
    * @class BuildProgressView
    * @extends RadarView
    * @constructor
    * @namespace radar
    * @public
    */
    return RadarView.extend({

        /**
        * initialize the chart
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            if (params.appmode) {
                this.model.set("AppmodeTitle", params.settings.program + " " + params.settings.chart.title);
                this.initAppmode(params.settings);
                return;
            }

            this.model.on("resize", function () {
                setTimeout($.proxy(function () {
                    if (this.chart) {
                        this.chart.handleResize();
                    }
                }, this), 500);
            }, this);

            this.program = params.settings.program;

            this.model.set("Name", params.settings.program + " " + params.settings.chart.title);

            this.polltime(params.settings.chart.polltime);
            
            RadarAjax.GetBuildProgress(params.settings.program, function (data) {
                if (data) {
                    this.render(data);
                } else {
                    this.dataFailure();
                }
            }, this);
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
                    "/dashboard#build?p=",
                    settings.program,
                    "&guid=",
                    this.model.get("InstanceGuid")
                ].join("")
            }, null, templates));
        },

        /**
        * called when data-call fails
        *
        * @param {String} program
        *
        * @method dataFailure
        * @private
        */
        dataFailure: function (program) {
            require(["view/ToastView"], function (ToastView) {
                new ToastView({
                    message: "Failed to retrieve build progress data for " + program + ", please try again later.",
                    color: ToastView.prototype.ErrorColor,
                    icon: "fa fa-exclamation-triangle",
                    timer: false
                });
            });

            this.displayError();
        },

        /**
        * default chart options for the build-progress view
        *
        * @param {Array} data
        *
        * @property chartOptions
        * @private
        */
        chartOptions: function (data) {
            return {
                type: "serial",
                theme: "radar",
                categoryField: "DateTime",
                dataProvider: data,
                responsive: {
                    enabled: true,
                    rules: []
                },
                valueAxes: [{
                    axisAlpha: 0.3,
                    color: "#333",
                    labelsEnabled: false,
                    titleFontSize: 8,
                    titleColor: "#000",
                    parseDates: true,
                    equalSpacing: true,
                    minPeriod: "mm",
                }, {
                    stackType: "regular",
                    color: "#333",
                    gridCount: 4,
                    labelsEnabled: false,
                    axisAlpha: 0.2,
                    dashLength: 1,
                    gridAlpha: 0.05,
                    axisColor: "#DADADA"
                }],
                graphs: [{
                    type: "column",
                    lineAlpha: 0,
                    fillAlphas: 1,
                    labelPosition: "bottom",
                    title: "Passed",
                    valueField: "Passed",
                    fillColors: ["#9EC070", "#75A13B"],
                    balloonText: "Passed:[[Version]]",
                    gradientOrientation: "horizontal"
                }, {
                    type: "column",
                    lineAlpha: 0,
                    fillAlphas: 1,
                    labelPosition: "bottom",
                    title: "Failed",
                    valueField: "Failed",
                    fillColors: ["#CF5555", "#612828"],
                    balloonText: "Failed:[[Version]], RootCause:[[RootCause]]",
                    gradientOrientation: "horizontal"
                }, {
                    type: "column",
                    lineAlpha: 0,
                    fillAlphas: 1,
                    labelPosition: "bottom",
                    title: "Promoted",
                    valueField: "Promoted",
                    fillColors: "#487dac",
                    balloonText: "Promoted:[[Version]]",
                    gradientOrientation: "horizontal"
                }],
                chartCursor: {
                    cursorPosition: "middle",
                    bulletsEnabled: false,
                    zoomable: false,
                    valueBalloonsEnabled: false,
                    categoryBalloonDateFormat: "MM-DD-YYYY, JJ:NN:SS"
                },
                chartScrollbar: {
                    scrollbarHeight: 20,
                    color: "#333",
                    autoGridCount: true
                },
                listeners: [{ //temporary hack to get rid of amcharts watermark
                    event: "drawn",
                    method: $.proxy(function (e) {
                        this.$el.find("a[title='JavaScript charts']").remove();
                    }, this)
                }]
            };
        },

        /**
        * manipulates the data for this display
        *
        * @param {Array} data
        * @return {Array}
        * 
        * @method formatData
        * @private
        */
        formatData: function (data) {
            data = data.slice(data.length -10, data.length);

            _.each(data, function (item) {
                item.DateTime = AmCharts.formatDate(new Date(Date.parse(item.Day.replace(/-/g, "/"))), "M/D/YY");
                if (item.Failed) {
                    item.Failed = -1;
                }
            });

            return data;
        },

        /**
        * render the build-progress data to the element
        *
        * @param {Array} data
        *
        * @method render
        * @private
        */
        render: function (data) {
            this.chart = AmCharts.makeChart(this.$el[0], this.chartOptions(this.formatData(data)));
        }
    });
});