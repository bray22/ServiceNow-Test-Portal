/*
* IterationBurndownView.js
*/

define([
"widgets/cateams/charts/ChartView",
"widgets/cateams/CATeamsAjax",
"text!widgets/cateams/templates.html",
"moment",
"underscore",
"jquery",
"amcharts.serial"], 
function (
ChartView, 
CATeamsAjax, 
templates, 
moment, 
_, 
$, 
AmCharts) {
        
    "use strict";

    /**
    * renders the iteration burndown
    *
    * @class IterationBurndownView
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
        * get data and render thedom
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            if (params.settings.iteration) {
                this.model.set("Name", params.settings.team.Name + ", " + params.settings.iteration.Name + " Burndown");

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
        * format the data for the chart
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
                        if (item.CardState === "Accepted") {
                            valueOutput.Accepted = item.CardEstimateTotal;
                        }

                        valueOutput.ToDo += item.CardToDoTotal;

                        if (item.CardState !== "Total") {
                            valueOutput.TaskEstimateTotal += item.TaskEstimateTotal;
                        } else {
                            valueOutput.Ideal += item.TaskEstimateTotal;
                        }

                        valueOutput.Date = key;

                        return valueOutput;
                    }, {
                        ToDo: 0,
                        Accepted: 0,
                        TaskEstimateTotal: 0,
                        Ideal: 0
                    });
                });

            return output;
        },

        /**
        * create the chart options used for amCharts
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
                    fillAlphas: 1,
                    title: "ToDo",
                    lineAlpha: 0,
                    type: "column",
                    valueField: "ToDo",
                    showBalloon: false,
                    fillColors: ["#289ECC"]
                }, {
                    fillAlphas: 1,
                    title: "Accepted",
                    lineAlpha: 0,
                    type: "column",
                    valueField: "Accepted",
                    showBalloon: false,
                    fillColors: ["#00FF00"]
                }, {
                    fillAlphas: 0,
                    bullet: "round",
                    bulletSize: 8,
                    lineThickness: 2,
                    title: "Task Estimated",
                    lineAlpha: 1,
                    type: "line",
                    valueField: "TaskEstimateTotal",
                    showBalloon: false,
                    lineColor: "#878787"
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
                    stackType: "none",
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
        * render the chart
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