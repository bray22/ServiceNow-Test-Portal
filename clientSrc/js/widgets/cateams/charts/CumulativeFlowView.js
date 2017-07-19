/*
* CumulativeFlowView.js
*/

define([
"widgets/cateams/charts/ChartView",
"widgets/cateams/CATeamsAjax",
"underscore",
"moment",
"amcharts.serial",
"text!widgets/cateams/templates.html"], 
function (
ChartView, 
CATeamsAjax, 
_, 
moment, 
AmCharts, 
templates) {
        
    "use strict";

    /**
    * renders the iteration cumulative flow
    *
    * @class CumulativeFlowView
    * @extends ChartView
    * @constructor
    * @namespace cateams
    * @public
    */
    return ChartView.extend({

        events: {
            "click .on-select-iteration": "onSelectIteration"
        },

        /**
        * get data and render the dom
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            if (params.settings.iteration) {
                this.model.set("Name", params.settings.team.Name + ", " + params.settings.iteration.Name + " Cumulative Flow");

                this.showLoading(this.$el, function () {
                    CATeamsAjax.GetIterationBurndown(params.settings.team.ObjectID, params.settings.iteration.CommonID, function (data) {
                        this.hideLoading(function () {
                            if (data && data.length) {
                                this.render(params.settings, this.formatData(data));
                            } else {
                                this.displayError("No data found");
                            }
                        });
                    }, this);
                });
            } else {
                this.initConfigIncomplete(params.settings);
            }
        },

        /**
        * if appmode is called from a different widget that did not get the "iteration" chart selector step,
        * we need to call chart select to get the iteration object
        *
        * @method initConfigIncomplete
        * @private
        */
        initConfigIncomplete: function (settings) {
            this.currentSettings = settings;
            this.$el.append(this.template("CATeam-Config-Incomplete", null, null, templates));
        },

        /**
        * user clicked the 'select iteration' link from the incomplete configuration template
        *
        * @method onSelectIteration
        * @private
        */
        onSelectIteration: function () {
            require(["widgets/cateams/CATeamSelectorView"], $.proxy(function (CATeamSelectorView) {
                new CATeamSelectorView({
                    step: "initIterationSelect",
                    configuration: this.currentSettings,
                    callback: $.proxy(function (config) {
                        this.model.setInstanceConfig(JSON.stringify(config), function () {
                            this.$el.children().remove();
                            this.initialize({
                                settings: config
                            });
                        }, this);
                    }, this)
                });
            }, this));
        },

        /**
        * format data ready for rendering
        *
        * @param {Array} data
        * @return {Array}
        *
        * @method formatData
        * @private
        */
        formatData: function (data) {
            _.each(data, function (item) {
                item.CreationDate = moment(new Date(parseInt(item.CreationDate.match(/\d+/g)[0], 10))).format("MM/DD");
            });

            var groups = _.groupBy(data, "CreationDate"),
                output = _.map(groups, function (value, key) {
                    return _.reduce(value, function (valueOutput, item) {
                        valueOutput[item.CardState] = item.CardEstimateTotal;
                        valueOutput.Date = key;
                        return valueOutput;
                    }, {
                        Accepted: 0,
                        Completed: 0,
                        InProgress: 0,
                        Defined: 0,
                        Scope: 0
                    });
                });

            return output;
        },

        /**
        * create the chart options object for AmCharts
        *
        * @param {Array} data
        * @return {Object}
        *
        * @method chartOptions
        * @private
        */
        chartOptions: function (data) {
            return {
                dataProvider: data,
                startDuration: 0.4,
                startEffect: "easeInSine",
                categoryField: "Date",
                type: "serial",
                graphs: [{
                    balloonText: "Accepted: <b>[[value]]</b>",
                    fillAlphas: 1,
                    lineThickness: 2,
                    title: "Accepted",
                    lineAlpha: 1,
                    type: "line",
                    valueField: "Accepted",
                    showBalloon: false,
                    lineColor: "#97CC4B"
                }, {
                    balloonText: "Completed: <b>[[value]]</b>",
                    fillAlphas: 1,
                    lineThickness: 2,
                    title: "Completed",
                    lineAlpha: 1,
                    type: "line",
                    valueField: "Completed",
                    showBalloon: false,
                    lineColor: "#F1D742"
                }, {
                    balloonText: "InProcess: <b>[[value]]</b>",
                    fillAlphas: 1,
                    lineThickness: 2,
                    title: "In-Progress",
                    lineAlpha: 1,
                    type: "line",
                    valueField: "In-Progress",
                    showBalloon: false,
                    lineColor: "#3C88F0"
                }, {
                    balloonText: "Defined: <b>[[value]]</b>",
                    fillAlphas: 1,
                    lineThickness: 2,
                    title: "Defined",
                    lineAlpha: 1,
                    type: "line",
                    valueField: "Defined",
                    showBalloon: false,
                    lineColor: "#F5B74F"
                }, {
                    balloonText: "Scope: <b>[[value]]</b>",
                    fillAlphas: 0,
                    bullet: "round",
                    bulletSize: 8,
                    lineThickness: 2,
                    title: "Scope",
                    lineAlpha: 1,
                    type: "line",
                    valueField: "Scope",
                    showBalloon: false,
                    lineColor: "#312879"
                }],
                categoryAxis: {
                    axisColor: "#000000",
                    axisAlpha: 0.2,
                    gridAlpha: 0,
                    equalSpacing: true,
                    dashLength: 3,
                    labelsEnabled: true,
                    autoGridCount: true
                },
                valueAxes: [{
                    gridAlpha: 0.1,
                    axisColor: "#000000",
                    color: "#000000",
                    axisAlpha: 0.2,
                    dashLength: 0,
                    stackType: "regular",
                    labelsEnabled: true,
                    precision: 0,
                    labelFunction: function (val, valtxt, axis) {
                        return val / 1000 + "k";
                    }
                }],
                chartCursor: {
                    cursorAlpha: 0.3,
                    cursorColor: "#000000"
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
        * render the chart to the DOM
        *
        * @param {Object} settings
        * @param {Array} data
        *
        * @method render
        * @private
        */
        render: function (settings, data) {
            this.chart = AmCharts.makeChart(this.$el[0], this.chartOptions(data));
        }
    });
});