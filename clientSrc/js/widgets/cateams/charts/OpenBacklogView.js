/*
* OpenBacklogView.js
*/

define([
"widgets/cateams/charts/ChartView",
"widgets/cateams/CATeamsAjax",
"util/Util",
"underscore",
"moment",
"amcharts.serial"], 
function (
ChartView, 
CATeamsAjax, 
Util, 
_, 
moment, 
AmCharts) {
        
    "use strict";

    /**
    * renders the open backlog view
    *
    * @class OpenBacklogView
    * @extends ChartView
    * @namespace cateams
    * @constructor
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
            var title = params.settings.team.Name + " Open Backlog";

            this.model.set("Name", title);

            this.model.set("AppmodeTitle", title);

            this.showLoading(this.$el, function () {
                CATeamsAjax.GetOpenBacklog(params.settings.team.Name, function (data) {
                    this.hideLoading(function () {
                        if (data) {
                            this.render(params.settings, this.formatData(params, Util.ParseCsv(data, "|")));
                        } else {
                            this.displayError("Failed to retrieve open backlog data");
                        }
                    });
                }, this);
            });
        },

        /**
        * format the data ready for chart rendering
        *
        * @param {Object} settings
        * @param {Array} data
        * @return {Array}
        *
        * @method formatData
        * @private
        */
        formatData: function (settings, data) {
            var output = [],
                grouped = _.groupBy(data, function (item) {
                    return item.date;
                });

            _.each(grouped, function (weekGroup) {
                _.each(weekGroup, function (dvvItem) {
                    var weekStr = moment(dvvItem.date).format("MM/DD"),
                        week = _.where(output, {week: weekStr});

                    if (week.length) {
                        if (typeof week[0][dvvItem.DVV] !== "number") {
                            week[0][dvvItem.DVV] = parseInt(dvvItem.count, 10);
                        } else {
                            week[0][dvvItem.DVV] += parseInt(dvvItem.count, 10);
                        }
                    } else {
                        var toAdd = {
                            week: weekStr,
                            weekWithYear: moment(dvvItem.date).format("MM/DD/YYYY")
                        };

                        toAdd[dvvItem.DVV] = parseInt(dvvItem.count, 10);

                        output.push(toAdd);
                    }
                });
            });

            if (!settings.appmode) {
                output = output.splice(output.length -10);
            }

            return output;
        },

        /**
        * get a new instance of the chart options object for AmCharts
        *
        * @param {Array} data
        * @param {Array} graphs
        * @return {Object}
        *
        * @method chartOptions
        * @private
        */
        chartOptions: function (data, graphs) {
            return {
                dataProvider: data,
                startDuration: 0.4,
                startEffect: "easeInSine",
                graphs: graphs,
                categoryField: "week",
                type: "serial",
                categoryAxis: {
                    labelRotation: 30,
                    axisColor: "#000",
                    color: "#fff",
                    axisAlpha: 0.2,
                    gridAlpha: 0,
                    equalSpacing: true,
                    dashLength: 3,
                    labelsEnabled: true,
                    autoGridCount: false,
                    gridCount: data.length
                },
                valueAxes: [{
                    totalText: "[[total]]",
                    gridAlpha: 0,
                    axisColor: "#000",
                    color: "#000",
                    axisAlpha: 0,
                    dashLength: 0,
                    stackType: "regular",
                    labelsEnabled: true,
                    precision: 0
                }],
                chartCursor: {
                    cursorAlpha: 0.3,
                    cursorColor: "#000"
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
        * dynamically create the graph objects for Amcharts based on the data
        *
        * @param {Array} programs
        * @return {Array}
        *
        * @method createGraphs
        * @private
        */
        createGraphs: function (programs) {
            return _.map(programs, function (value, key) {
                return {
                    balloonText: value.Program + ": <b>[[" + value.Program + "]]</b><br/>",
                    fillAlphas: 0.8,
                    title: value.Program,
                    lineAlpha: 0,
                    type: "column",
                    valueField: value.Program,
                    showBalloon: true,
                    balloonFunction: function(e) {
                        var value = e.graph.chart.dataProvider[e.index][e.graph.valueField];
                        if (value === 0) {
                            return "";
                        } else {
                            return e.graph.chart.formatString(e.graph.balloonText, e, true);
                        }
                    }
                };
            });
        },

        /**
        * render the AmChart for this view
        *
        * @param {Object} settings
        * @param {Array} data
        *
        * @method render
        * @private
        */
        render: function (settings, data) {
            this.chart = AmCharts.makeChart(this.$el[0], this.chartOptions(data, this.createGraphs(settings.programs)));
        }
    });
});