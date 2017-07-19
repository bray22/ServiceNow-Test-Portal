/*
* TimeSeriesChartView.js
*/

define([
"widgets/radar/baseViews/RadarView", 
"underscore", 
"amcharts.serial", 
"widgets/radar/util/RadarTheme", 
"amcharts.responsive", 
"jquery"],
function (
RadarView, 
_, 
serial, 
hubtheme, 
responsive, 
$) {
        
    "use strict";

    /**
    * An AmChart abstraction for Radar Time Series chart views,
    * provides a common API for extending and building time series charts for Radar
    *
    * @class TimeSeriesChartView
    * @extends RadarView
    * @namespace radar
    * @public
    * @constructor
    */
    return RadarView.extend({

        /** 
        * these are the default graph options for Time Series charts.
        *
        * @property defaultChartOptions
        * @protected
        */
        defaultGraphOptions: function () {
            return {
                bullet: "round",
                bulletSize: 5,
                bulletAlpha: 1,
                lineAlpha: 0,
                fillAlphas: 0.7,
                type: "line",
                showBalloon: false,
                markerType: "square"
            };
        },

        /** 
        * these are the default chart options for Time Series charts.
        *
        * @property defaultChartOptions
        * @protected
        */
        defaultChartOptions: function (extOptions) {
            var options = $.extend(true, {
                marginTop: 10,
                type: "serial",
                theme: "radar",
                startDuration: 0.4,
                startEffect: "easeInSine",
                categoryField: "group", //should be overidden if not using pivotData function below
                legend: {
                    useGraphSettings: true,
                    equalWidths: true,
                    position: "top",
                    valueAlign: "left",
                    valueWidth: 50
                },
                categoryAxis: {
                    labelRotation: 0,
                    axisColor: "#000000",
                    color: "#000",
                    axisAlpha: 0,
                    gridAlpha: 0,
                    equalSpacing: true,
                    labelsEnabled: true,
                    autoGridCount: true,
                    parseDates: true
                },
                valueAxes: [{
                    gridAlpha: 0,
                    axisColor: "#000000",
                    color: "#000",
                    axisAlpha: 0,
                    dashLength: 0,
                    stackType: "regular",
                    labelsEnabled: true,
                    precision: 0,
                }],
                chartCursor: {
                    cursorAlpha: 0.3,
                    cursorColor: "#000000",
                    categoryBalloonEnabled: true
                },
                chartScrollbar: {
                    scrollbarHeight: 5,
                    hideResizeGrips: false
                },
                responsive: {
                    enabled: true,
                    rules: [{
                        maxHeight: 500,
                        overrides: {
                            precision: 0,
                            categoryAxis: {
                                autoGridCount: false
                            },
                        }
                    }, {
                        maxHeight: 250,
                        overrides: {
                            marginTop: 5,
                            chartScrollbar: {
                                enabled: false
                            },
                            legend: {
                                enabled: false
                            },
                            valueAxes: {
                                labelsEnabled: true
                            },
                            categoryAxis: {
                                labelsEnabled: false,
                            },
                            chartCursor: {
                                oneBalloonOnly: true
                            },
                        }
                    }]
                },
                export: {
                    enabled: true
                },
                listeners: [{ //temporary hack to get rid of amcharts watermark
                    event: "drawn",
                    method: $.proxy(function (e) {
                        this.$("a[title='JavaScript charts']").remove();
                    }, this)
                }]
            }, extOptions);

            return options;
        },

        /**
        * called during construction, provides a point to set member-instance variables
        *
        * @param {Object} params constructor arguments
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.showLoading(this.$el);
            var title = params.settings.title || params.settings.chart.title;
            this.model.set("Name", title);
        },

        /**
        * this method will initialize chart options and render the chart into the given element
        *
        * @param {jQuery} $el - the element to render the AmChart into
        * @param {Array} data - formatted data ready for AmCharts data provider
        * @param {Array} graphs - prepared AmCharts graph list ready to be added to AmCharts chart options 
        * @param {Object or Array} listeners - collection of key values for each chart listener/event (key is event, and value is function/method)
        *               if parameter is Array, it will be directly assigned and should be in the form  [{event: "eventName", method: handler function}]
        *
        * @method render
        * @public
        */
        render: function ($el, data, chartOpts, listeners) {
            this.$el.children().remove();

            if (data) {
                chartOpts.dataProvider = data;

                this.chart = AmCharts.makeChart($el[0], this.defaultChartOptions(chartOpts));

                _.each(listeners, function (callback, event) {
                    this.chart.addListener(event, callback);
                }, this);

            } else {
                this.displayError("Failed to retrieve chart data.");
            }
        },

        /**
       * sets up the AmCharts dataprovider with a total series and a graph for total
       * it expects finished dataProvider as given to makeChart
       *
       * notes: 
       *    - add empty "Total" data point/series so "total graph works"
       *    - empty graph for a balloon with total display
       *    - can't toggle Total on/off in legend
       *
       * @param {Array} dataProvider - modifies data with a "Total" column/series
       * @param {Array} graphs - list of AmGraphs to modify and add total graph to
       * @param {String} extOpts - extra options to extend the graph with
       *
       * @method createGraphTotal
       * @public
       */
        createGraphTotal: function (dataProvider, graphs, extOpts) {
            _.each(dataProvider, (el, i) => el.Total = 0);

            graphs.push($.extend({
                balloonText: "Total: [[total]]",
                valueField: "Total",
                title: "Total",
                lineAlpha: 0,
                fillAlphas: 0,
                legendValueText: "[[total]]",
                visibleInLegend: true,
                switchable: false,
                markerType: "square",
                lineColor: "#fff"
            }, extOpts));
        },

        /**
        * sets up the AmCharts graphs list of objects with default settings
        * it expects an "unpivotted" Array data structure
        *
        * @param {Array} data
        * @param {String} valueKey
        * @return {Array} - list of AmGraph objects to makeChart with
        *
        * @method createGraphsList
        * @public
        */
        createGraphsList: function (data, valueKey, extOpts) {
            var keys = _.chain(data).pluck(valueKey || "keyBy").uniq().value(),
                graphs = [],
                graphOpts = this.defaultGraphOptions();

            _.each(keys, function (item, i) {
                if (item !== undefined) {
                    graphs.push($.extend({}, graphOpts, {
                        balloonText: item + ": [[value]]",
                        valueField: item,
                        title: item,
                        showBalloon: true,
                    }, extOpts));
                }
            });

            return graphs;
        },

        /**
        * groups all the data by the groupKey field and adds new items for each pivotByKey
        * {group: "1", groupName: "1", keyBy: "New", val: 10}, {group: "1", groupName: "1", keyBy: "Move In", val: 5}
        * becomes
        * {group: "1", groupName "1", New: 10, "Move In": 5}
        *
        * @param {Array} - data
        * @param {String} - pivotByKey
        * @param {String} - measureKey
        * @param {String} - groupKey
        *
        * @method 
        * @private
        */
        pivotData: function (data, pivotByKey, measureKey, groupKey, addTotal) {
            pivotByKey = pivotByKey || "keyBy", 
            measureKey = measureKey || "val", 
            groupKey = groupKey || "group";

            var keyBy = data.reduce((keyBy, object) => (keyBy[object[pivotByKey]] = 0, keyBy), {});

            var result = data.reduce((result, object) => (
                (
                    result[object[groupKey]] = result[object[groupKey]] ||
                    Object.assign({ "group": object[groupKey] }, keyBy)
                )
                [object[pivotByKey]] += object[measureKey] * 1, result), {}
            );

            var flattenedJson = Object.keys(result).map(key => result[key]);

            return flattenedJson;
        },

        /**
        * sweeps through all the "count" items and converts negatives to positives
        *
        * @param {Array} data - json
        * @param {String} field - name of value field to make postive
        * @return {Array}
        *
        * @method 
        * @private
        */
        convertNegatives: function (data, field) {
            field = field || "count";

            return _.each(data, function (v) {
                v[field] = Math.abs(v[field]);
            });
        }
    });
});