/*
* TestCFTView.js
*/

define([
"widgets/radar/baseViews/RadarView",
"widgets/radar/util/RadarAjax",
"underscore",
"moment",
"amcharts.serial",
"text!widgets/radar/templates.html",
"require"], 
function (
RadarView, 
RadarAjax, 
_, 
moment, 
AmCharts, 
templates, 
require) {
        
    "use strict";

    /**
    * defines rendering logic for test CFT
    *
    * @class TestCFTView
    * @extends RadarView
    * @namespace radar
    * @constructor
    * @public
    */
    return RadarView.extend({

        events: {
            "click .radar-program-test-header-option[data-target='All']": "onSelectAll",
            "click .radar-program-test-header-option[data-target='OB']": "onSelectOB",
            "click .radar-program-test-header-option[data-target='VP']": "onSelectVP",
        },

        /**
        * initialize the chart
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            var title = params.settings.program + " Test CFT";

            this.model.set("Name", title);

            this.model.set("AppmodeTitle", title);

            this.polltime(params.settings.chart.polltime);
            
            this.showLoading(this.$el, function () {
                RadarAjax.GetTestCFT(params.settings.program, function (data) {
                    if (data && data.length) {
                        this.hideLoading(function () {
                            this.render(this.formatData(data, params.settings.program), params);
                        });
                    } else {
                        this.dataFailure();
                    }
                }, this);
            });
        },

        /**
        * called when the data fails to retrieve
        *
        * @param {String} program
        *
        * @method dataFailure
        * @private
        */
        dataFailure: function (program) {
            require(["view/ToastView"], function (ToastView) {
                new ToastView({
                    message: "Failed to retrieve Test CFT data for " + program + ", please try again later.",
                    color: ToastView.prototype.ErrorColor,
                    icon: "fa fa-exclamation-triangle",
                    timer: false
                });
            });

            this.displayError();
        },

        /**
        * format the data ready for rendering,
        * pre-separates data into 'all' 'ob' and 'vp'
        *
        * @param {Array} data
        * @return {Array}
        *
        * @method formatData
        * @private
        */
        formatData: function (data, program) {
            // get the minimum duration value
            function _min (list) {
                var min = Infinity;
                
                _.each(list, function (item) {
                    if (item.duration < min) {
                        min = item.duration;
                    }
                });

                return min;
            }

            // get the maximum duration value
            function _max (list) {
                var max = -Infinity;

                _.each(list, function (item) {
                    if (item.duration > max) {
                        max = item.duration;
                    }
                });

                return max;
            }

            // get the average duration value
            function _average (list) {
                var avg;

                _.each(list, function (item) {
                    if (item) {
                        if (!avg) {
                            avg = item.duration;
                        } else {
                            avg += item.duration;
                            avg *= 0.5;
                        }
                    }
                });

                return avg;
            }

            // get the median duration value
            function _median (list) {
                var calc = [],
                    output,
                    mid;

                if (list.length > 1) {
                    _.each(list, function (item) {
                        calc.push(item);
                    });

                    calc.sort(function (a,b) {
                        return a.duration - b.duration;
                    });

                    var half = Math.floor(calc.length * 0.5);

                    if (calc.length % 2) {
                        output = calc[half].duration;
                    } else {
                        output = (calc[half -1].duration + calc[half].duration) * 0.5;
                    }
                } else {
                    output = list.length ? list[0] : null;
                }

                return output;
            }

            var output = {
                All: [],
                OB: [],
                VP: []
            };

            var mapped = _.map(_.groupBy(data, "Image"), function (value, key) {
                var image = value[0].ShortBuild,
                    ar = value[0].ARCount,
                    arLabel = ar > 0 ? ar : "",
                    dataPoint = function (min, max, median, average, arcount, arLabel, image, imageName) {
                        return {
                            rtm: 168,
                            threshold: 48,
                            min: min,
                            max: max,
                            median: median,
                            average: average,
                            arcount: arcount,
                            arLabel: arLabel,
                            program: program,
                            image: image,
                            imageName: imageName,
                            description: [
                                "<span style='color: #42A5F5;'>Median:</span>", median," hrs", "<br/>",
                                "<span style='color: #42A5F5;'>Average:</span>", average," hrs", "<br/>",
                                "<span style='color: #BBDEFB;'>Max:</span>", max," hrs", "<br/>",
                                "<span style='color: #000;'>Min:</span>", min," hrs", "<br/>"
                            ].join("")
                        };
                    };


                output.All.push(dataPoint(
                    Math.round(moment.duration(_min(value), "minutes").asHours() * 100) / 100,
                    Math.round(moment.duration(_max(value), "minutes").asHours() * 100) / 100,
                    Math.round(moment.duration(_median(value), "minutes").asHours() * 100) / 100,
                    Math.round(moment.duration(_average(value), "minutes").asHours() * 100) / 100,
                    value[0].ARCount,
                    value[0].ARCount > 0 ? value[0].ARCount : "",
                    value[0].ShortBuild, 
                    key
                ));

                var filtered = _.filter(value, function (item) {
                    if (item.Platform) {
                        return item.Platform.indexOf("OB") !== -1;
                    } else {
                        return false;
                    }
                });

                if (filtered.length) {
                    output.OB.push(dataPoint(
                        Math.round(moment.duration(_min(filtered), "minutes").asHours() * 100) / 100,
                        Math.round(moment.duration(_max(filtered), "minutes").asHours() * 100) / 100,
                        Math.round(moment.duration(_median(filtered), "minutes").asHours() * 100) / 100,
                        Math.round(moment.duration(_average(filtered), "minutes").asHours() * 100) / 100,
                        filtered[0].ARCount,
                        filtered[0].ARCount > 0 ? filtered[0].ARCount : "",
                        filtered[0].ShortBuild, 
                        key
                    ));
                }

                filtered = _.filter(value, function (item) {
                    if (item.Platform) {
                        return item.Platform.indexOf("VP") !== -1;
                    } else {
                        return false;
                    }
                });

                if (filtered.length) {
                    output.VP.push(dataPoint(
                        Math.round(moment.duration(_min(filtered), "minutes").asHours() * 100) / 100,
                        Math.round(moment.duration(_max(filtered), "minutes").asHours() * 100) / 100,
                        Math.round(moment.duration(_median(filtered), "minutes").asHours() * 100) / 100,
                        Math.round(moment.duration(_average(filtered), "minutes").asHours() * 100) / 100,
                        filtered[0].ARCount,
                        filtered[0].ARCount > 0 ? filtered[0].ARCount : "",
                        filtered[0].ShortBuild, 
                        key
                    ));
                }
            });

            output.All = output.All.slice(Math.max(output.All.length -10, 0));

            output.OB = output.OB.slice(Math.max(output.OB.length -10, 0));

            output.VP = output.VP.slice(Math.max(output.VP.length -10, 0));

            if (output.All.length) {
                output.All[0].thresholdtitle = "B-Line Goal";
                output.All[0].rtmtitle = "RTM";
            }

            if (output.OB.length) {
                output.OB[0].thresholdtitle = "B-Line Goal";
                output.OB[0].rtmtitle = "RTM";
            }

             if (output.VP.length) {
                output.VP[0].thresholdtitle = "B-Line Goal";
                output.VP[0].rtmtitle = "RTM";
            }

            return output;
        },

        /**
        * create the AmChart options for rendering
        *
        * @param {Array} data
        *
        * @method chartOptions
        * @private
        */
        chartOptions: function (data) {
            return {
                dataProvider: data,
                type: "serial",
                theme: "radar",
                startDuration: 0.4,
                startEffect: "easeInSine",
                categoryField: "image",
                categoryAxis: {
                    axisColor: "#333",
                    color: "#FFF",
                    axisAlpha: 0.1,
                    gridAlpha: 0,
                    dashLength: 3,
                    equalSpacing: true,
                    labelsEnabled: true,
                    autoGridCount: true,
                    gridCount: data.length
                },
                graphs: [{
                    valueAxis: "v1",
                    title: "Max",
                    valueField: "max",
                    type: "column",
                    lineAlpha: 1,
                    fillAlphas: 1,
                    lineThickness: 0,
                    showBalloon: true,
                    columnWidth: 0.9,
                    fillColors: "#BBDEFB",
                    lineColor: "#BBDEFB",
                    color: "#BBDEFB",
                    clustered: false,
                    balloonText: "[[description]]",
                    showHandOnHover: true
                }, {
                    valueAxis: "v1",
                    title: "Median",
                    valueField: "median",
                    type: "column",
                    lineAlpha: 1,
                    fillAlphas: 1,
                    showBalloon: false,
                    fillColors: "#42A5F5",
                    columnWidth: 0.5,
                    lineColor: "#42A5F5",
                    color: "#42A5F5",
                    clustered: false,
                    showHandOnHover: true
                }, {
                    valueAxis: "v1",
                    title: "Min",
                    valueField: "min",
                    type: "column",
                    lineAlpha: 0,
                    fillAlphas: 0.3,
                    showBalloon: false,
                    fillColors: "#FFF",
                    columnWidth: 0.2,
                    lineColor: "#FFF",
                    color: "#FFF",
                    clustered: false,
                    showHandOnHover: true
                }, {
                    valueAxis: "v2",
                    title: "Total Disruptive",
                    labelPosition: "top",
                    labelText: "[[arLabel]]",
                    valueField: "arcount",
                    type: "line",
                    lineAlpha: 1,
                    lineThickness: 1,
                    bullet: "round",
                    bulletSize: 0,
                    lineColor: "#F44336",
                    color: "#F44336",
                    bulletBorderAlpha: 1,
                    bulletColor: "#FFF",
                    showBalloon: false,
                    markerType: "circle",
                    useLineColorForBulletBorder: true,
                    showHandOnHover: true
                }, {
                    valueAxis: "v1",
                    title: "B-Line Goal",
                    labelText: "[[thresholdtitle]]",
                    labelPosition: "top",
                    valueField: "threshold",
                    type: "line",
                    lineAlpha: 0.4,
                    lineThickness: 2,
                    showBalloon: false,
                    lineColor: "#090",
                    color: "#090"
                }, {
                    valueAxis: "v1",
                    title: "RTM",
                    labelText: "[[rtmtitle]]",
                    labelPosition: "top",
                    valueField: "rtm",
                    type: "line",
                    lineAlpha: 0.4,
                    lineThickness: 2,
                    showBalloon: false,
                    lineColor: "#090",
                    color: "#090"
                }],
                valueAxes: [{
                    id: "v1",
                    gridAlpha: 0,
                    axisColor: "#333",
                    color: "#333",
                    axisAlpha: 0.1,
                    dashLength: 3,
                    labelsEnabled: true,
                    precision: 0,
                    stackType: "none"
                }, {
                    id: "v2",
                    position: "right",
                    gridAlpha: 0,
                    axisColor: "#333",
                    color: "#333",
                    axisAlpha: 0,
                    dashLength: 3,
                    stackType: "none",
                    labelsEnabled: false,
                    precision: 0
                }],
                chartCursor: {},
                listeners: [{ //temporary hack to get rid of amcharts watermark
                    event: "drawn",
                    method: $.proxy(function (e) {
                        this.$el.find("a[title='JavaScript charts']").remove();
                    }, this)
                }]
            };
        },

        /**
        * render the amChart to the dom
        *
        * @param {Array} data
        * @param {Object} params - constructor arguments
        *
        * @method render
        * @private
        */
        render: function (data, params) {
            this.$el.append(this.template("Test-CFT", null, null, templates));

            if (params.appmode) {
                this.$el.addClass("appmode");

                var $appmodeSection = this.$(".radar-program-test-cft-appmode");

                this.showLoading($appmodeSection, function () {
                    RadarAjax.GetCrossTestDefects(params.settings.program, function (data) {
                        this.hideLoading(function () {
                            $appmodeSection.append(data);
                        });
                    }, this);
                });
            }

            this.renderData = data;

            // wait a sec for the browser to draw, this requires accurate dimensions
            setTimeout($.proxy(this.postRender, this));
        },

        /**
        * called after render, and after the browser gets a chance to draw into the DOM
        * (so we have accurate dimensions to calculate)
        *
        * @method postRender
        * @private
        */
        postRender: function () {
            this.onSelectAll();
        },

        /**
        * user selected 'All' cft data
        *
        * @method onSelectAll
        * @private
        */
        onSelectAll: function () {
            this.chart && this.chart.clear();

            this.moveUnderline(".radar-program-test-header-option[data-target='All']");

            this.chartEvents(this.chart = AmCharts.makeChart(this.$(".radar-program-test-cft-widget")[0], this.chartOptions(this.renderData.All)));
        },

        /**
        * user selected 'Overons' cft data
        *
        * @method onSelectOB
        * @private
        */
        onSelectOB: function () {
            this.chart && this.chart.clear();

            this.moveUnderline(".radar-program-test-header-option[data-target='OB']");

            this.chartEvents(this.chart = AmCharts.makeChart(this.$(".radar-program-test-cft-widget")[0], this.chartOptions(this.renderData.OB)));
        },

        /**
        * user selected 'vVNX' cft data
        *
        * @method onSelectVP
        * @private
        */
        onSelectVP: function () {
            this.chart && this.chart.clear();

            this.moveUnderline(".radar-program-test-header-option[data-target='VP']");

            this.chartEvents(this.chart = AmCharts.makeChart(this.$(".radar-program-test-cft-widget")[0], this.chartOptions(this.renderData.VP)));
        },

        /**
        * re-usable underline-movement logic
        *
        * @param {String} selector
        * 
        * @method moveUnderline
        * @private
        */
        moveUnderline: function (selector) {
            var $selector = this.$(selector),
                $parent = $selector.parent(),
                selectorOffset = $selector.offset(),
                parentOffset = $parent.offset(),
                padding = parseInt($selector.css("padding-left").replace("px", ""), 10),
                $line = this.$(".radar-program-test-header-underline");

            this.$(".radar-program-test-header-option.selected").removeClass("selected");

            $selector.addClass("selected");

            $line.css({
                left: selectorOffset.left - parentOffset.left + padding,
                width: $selector.width()
            });
        },

        /**
        * attach drilldown events to the newly rendered chart
        *
        * @param {AmChart} chart
        *
        * @method chartEvents
        * @private
        */
        chartEvents: function (chart) {
            chart.addListener("clickGraphItem", $.proxy(function (e) {
                if (e.target.valueField === "arcount") {
                    this.arDrilldown(e.item.dataContext);
                } else {
                    this.imageDrilldown(e.item.dataContext);
                }
            }, this));
        },

        /**
        * user is drilling down on the ar count
        *
        * @param {Object} datapoint - the dataContext of the clicked graph item 
        *
        * @method arDrilldown
        * @private
        */
        arDrilldown: function (datapoint) {
            RadarAjax.CftArDrilldown(datapoint.program, datapoint.imageName, function (data) {
                require(["widgets/radar/baseViews/RadarTableView", "view/ToastView"], function (RadarTableView, ToastView) {
                    if (data && data.indexOf("<table>") !== -1) {
                        new RadarTableView({
                            title: [datapoint.program, " AR Details: ", datapoint.imageName].join(""),
                            table: data,
                            export: true
                        });
                    } else {
                        new ToastView({
                            message: [
                                "No drilldown data found (",
                                datapoint.program, ", ", 
                                datapoint.imageName, 
                                ")"].join(""),
                            timer: 3000,
                            icon: "fa fa-exclamation-triangle",
                            color: ToastView.prototype.WarningColor
                        });
                    }
                });
            }, this);
        },

        /**
        * user is drilling down on the image
        *
        * @param {Object} datapoint - the dataContext of the clicked graph item 
        *
        * @method imageDrilldown
        * @private
        */
        imageDrilldown: function (datapoint) {
            RadarAjax.CftImageDrilldown(datapoint.program, datapoint.imageName, function (data) {
                require(["widgets/radar/baseViews/RadarTableView", "view/ToastView"], function (RadarTableView, ToastView) {
                    if (data && data.indexOf("<table>") !== -1) {
                        new RadarTableView({
                            title: [datapoint.program, " Details: ", datapoint.imageName].join(""),
                            table: data,
                            export: true
                        });
                    } else {
                        new ToastView({
                            message: [
                                "No drilldown data found (",
                                datapoint.program, ", ", 
                                datapoint.imageName, 
                                ")"].join(""),
                            timer: 3000,
                            icon: "fa fa-exclamation-triangle",
                            color: ToastView.prototype.WarningColor
                        });
                    }
                });
            }, this);
        }
    });
});