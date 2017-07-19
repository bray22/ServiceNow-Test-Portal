/*
* TestStatusView.js
*/

define([
"widgets/radar/baseViews/RadarView", 
"widgets/radar/util/RadarAjax",
"require",
"amcharts.pie",
"underscore",
"text!widgets/radar/templates.html"],
function (
RadarView, 
RadarAjax, 
require, 
AmCharts, 
_, 
templates) {
        
    "use strict";

    /**
    * defines rendering logic for test status
    *
    * @class TestStatusView
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

            this.model.set("Name", params.settings.program + " Test Status");

            this.polltime(params.settings.chart.polltime);
            
            this.showLoading(this.$el, function () {
                RadarAjax.GetProgramMeta(params.settings.program, function (metaData) {
                    RadarAjax.GetTestStatus(params.settings.program, this.generateMetaCycle(params.settings.program, metaData), function (data) {
                        if (data) {
                            var parsed;

                            try {
                                parsed = JSON.parse(data)
                            } catch (e) {
                                parsed = undefined;
                            } finally {
                                this.hideLoading(function () {
                                    if (parsed && !parsed.Error) {
                                        this.render(this.formatData(parsed));
                                    } else {
                                        this.dataFailure(parsed.Error);
                                    }
                                });
                            }
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
        * generate the cycle string 
        *
        * @param {Array} metaData
        * @return {String} cycle
        *
        * @method generateMetaCycle
        * @private
        */
        generateMetaCycle: function (program, metaData) {
            var meta = _(metaData.Data).chain().groupBy(function (item) {
                return item.Class;
            }).reduce(function (result, key, value) {
                result[value] = _.reduce(key, function (final, keyFinal) {
                    final[keyFinal.Key] = keyFinal.Val;
                    return final;
                }, {});
                return result;
            }, {}).value();

            return [
                "// ", 
                program, 
                " // ",
                meta.UtmsChartParams.MilestoneRange,
                " // ",
                meta.UtmsChartParams.Cycle
            ].join("");
        },

        /**
        * called when the data fails to retrieve
        *
        * @method dataFailure
        * @private
        */
        dataFailure: function (msg) {
            this.displayError(msg);
        },

        /**
        * format the data for rendering
        *
        * @param {Object} data
        * @param {Object} data
        *
        * @method formatData
        * @private
        */
        formatData: function (data) {
            return [{
                title: "Passed",
                value: data.Data[0].Passed_Ct
            }, {
                title: "Failed",
                value: data.Data[0].Failed_Ct
            }, {
                title: "Blocked",
                value: data.Data[0].Blocked_Ct
            }, {
                title: "Remaining",
                value: data.Data[0].Remaining_Ct
            }];
        },

        /**
        * create the am-chart chart options
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
                type: "pie",
                colors: ["#008000", "#CC0000", "#800080", "#333"],
                valueField: "value",
                titleField: "title",
                labelText: "[[percents]]%"
            };
        },

        /**
        * render the test-status pie chart
        *
        * @param {Object} data
        *
        * @method render
        * @private
        */
        render: function (data) {
            this.chart = AmCharts.makeChart(this.$el[0], this.chartOptions(data));
        }
    });
});