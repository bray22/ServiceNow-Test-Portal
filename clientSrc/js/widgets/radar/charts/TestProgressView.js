/*
* TestProgressView.js
*/

define([
"widgets/radar/baseViews/RadarView", 
"widgets/radar/util/RadarAjax",
"require",
"text!widgets/radar/templates.html", 
"amcharts.serial",
"moment"], 
function (
RadarView, 
RadarAjax, 
require, 
templates, 
AmCharts, 
moment) {
        
    "use strict";

    /**
    * defines rendering logic for test progress
    *
    * @class TestProgressView
    * @extends RadarView
    * @namespace radar
    * @constructor
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
                this.model.set("AppmodeTitle", params.settings.program + " Operations");
                this.initAppmode(params.settings);
                return;
            }

            this.model.set("Name", params.settings.program + " Test Progress");

            this.polltime(params.settings.chart.polltime);

            this.showLoading(this.$el, function () {
                RadarAjax.GetProgramMeta(params.settings.program, function (meta) {

                    var metadata = _(meta.Data).chain().groupBy("Class").reduce(function (result, key, value) {
                        result[value] = _.reduce(key, function (final, keyFinal) {
                            final[keyFinal.Key] = keyFinal.Val;
                            return final;
                        }, {});
                        return result;
                    }, {}).value();

                    RadarAjax.GetTestProgress(params.settings.program, this.generateCycle(metadata, params.settings), function (data) {
                        if (data) {
                            this.hideLoading(function () {
                                var parsed;

                                try {
                                    parsed = JSON.parse(data);
                                } catch (e) {
                                    parsed = undefined;
                                } finally {
                                    if (parsed) {
                                        if (!parsed.Error) {
                                            this.render(params.settings.cycle, parsed);
                                        } else {
                                            this.renderNoData(params.settings.cycle)
                                        }
                                    } else {
                                        this.dataFailure(params.settings.program);
                                    }
                                }
                            });
                        } else {
                            this.dataFailure(params.settings.program);
                        }
                    }, this);

                }, this);
                
            });
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
                    "/dashboard#operations?p=",
                    settings.program,
                    "&guid=",
                    this.model.get("InstanceGuid")
                ].join("")
            }, null, templates));
        },

        /**
        * generate the cycle query string thingy
        *
        * @param {Array} meta
        * @param {Object} settings
        * @return {String}
        *
        * @method generateCycle
        * @private
        */
        generateCycle: function (meta, settings) {
            return [
                "// ",
                settings.program,
                " ",
                settings.cycle.RadarQueryString
            ].join("");
        },

        /**
        * Failed to get data
        *
        * @method dataFailure
        * @private
        */
        dataFailure: function (program) {
            require(["view/ToastView"], function (ToastView) {
                new ToastView({
                    message: "Failed to retrieve Test Progress data for " + program + ", please try again later.",
                    color: ToastView.prototype.ErrorColor,
                    icon: "fa fa-exclamation-triangle",
                    timer: false
                });
            });

            this.displayError();
        },

        /**
        * create the am-charts options object used for rendering
        *
        * @param {Object} cycle - selected cycle data
        * @param {Array} data
        *
        * @method chartOptions
        * @private
        */
        chartOptions: function (cycle, data) {
            var startDate = moment(cycle.StartDate).format("MM/DD"),
                endDate = moment(cycle.EndDate).format("MM/DD");

            var chartData = data.Data;

            chartData = _(chartData).filter(function (value) {
                var date = moment(value.wk);
                return date <= moment(cycle.ChartEndDate) && date >= moment(cycle.ChartStartDate)
            }).map(function (value) {
                var date = moment(value.wk);                               
                if (date > moment()) {
                    delete value.aattempted;
                    delete value.apassed;
                }
                return value;
            });
                            
            return {
                dataProvider: chartData,
                startDuration: 0.4,
                startEffect: "easeInSine",
                type: "serial",
                theme: "radar",
                dataDateFormat:"YYYY-MM-DD",
                graphs: [{
                    balloonText: "Actual Attempted: <b>[[aattempted]]</b><br/>Actual First Passed: <b>[[apassed]]</b>",
                    title: "Actual Attempted",
                    type: "line",
                    valueField: "apassed",
                    showBalloon: true,
                    lineColor: "#5E2D79"
                }, {
                    balloonText: "Attempted: <b>[[value]]</b>",
                    title: "Attempted",
                    type: "line",
                    valueField: "aattempted",
                    showBalloon: false,
                    lineColor: "#0C0"
                }],
                categoryField: "wk",
                categoryAxis: {
                    axisColor: "#000",
                    equalSpacing: true,
                    dashLength: 3,
                    labelsEnabled: true,
                    autoGridCount: true,
                    gridCount: data.length,
                    color: "#FFF",
                    labelText: "[[wk]]",
                    parseDates: true
                },
                chartCursor: {
                    cursorAlpha: 0.3,
                    cursorColor: "#000"
                },
                guides: [{
                    lineColor: "#C00",
                    lineAlpha: 1,
                    dashLength: 2,
                    labelRotation: 90,
                    inside: true,
                    date: cycle.StartDate,
                    color: "#333",
                    label: "Start " + startDate
                }, {
                    lineColor: "#C00",
                    lineAlpha: 1,
                    dashLength: 2,
                    labelRotation: 90,
                    inside: true,
                    date: cycle.EndDate,
                    color: "#333",
                    label: "End " + endDate
                }],
                listeners: [{ //temporary hack to get rid of amcharts watermark
                    event: "drawn",
                    method: $.proxy(function (e) {
                        this.$el.find("a[title='JavaScript charts']").remove();
                    }, this)
                }]
            };
        },

        /**
        * render the data to the dom
        *
        * @param {Array} data
        * @param {Object} settings
        *
        * @method render
        * @private
        */
        render: function (cycle, data) {
            this.chart = AmCharts.makeChart(this.$el[0], this.chartOptions(cycle, data));
        },

        /**
        * we did not retrieve any data for the cycle
        *
        * @param {Object} cycle
        *
        * @method renderNoData
        * @private
        */
        renderNoData: function (cycle) {
            this.$el.append(this.template("Program-Test-Progress-No-Data", {
                Cycle: cycle.MenuName
            }, null, templates));
        }
    });
});