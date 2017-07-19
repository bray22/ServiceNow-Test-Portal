/*
* TestESTView.js
*/

define([
"widgets/radar/baseViews/RadarView", 
"widgets/radar/util/RadarAjax", 
"text!widgets/radar/templates.html",
"moment",
"underscore",
"require"],
function (
RadarView, 
RadarAjax, 
templates, 
moment, 
_, 
require) {
        
    "use strict";

    /**
    * defines rendering logic for test EST
    *
    * @class TestESTView
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
                this.model.set("AppmodeTitle", params.settings.program + " Test EST");
                this.initAppmode(params.settings);
                return;
            }

            this.model.set("Name", params.settings.program + " Test EST");
            
            this.polltime(params.settings.chart.polltime);

            this.showLoading(this.$el, function () {
                RadarAjax.GetTestEst(params.settings.program, function (data) {
                    this.hideLoading(function () {
                        if (data && data.length) {

                            var formatted;

                            try {
                                formatted = this.formatData(data);
                            } catch (e) {
                                this.dataFailure(params.settings.program);
                                formatted = undefined;
                            } finally {
                                if (formatted) {
                                    this.render(formatted, params.settings);
                                }
                            }
                        } else {
                            this.dataFailure(params.settings.program);
                        }
                    });
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
                    "/dashboard#/test?p=",
                    settings.program,
                    "&dv=reports&slide=0",
                    "&guid=",
                    this.model.get("InstanceGuid")
                ].join("")
            }, null, templates));
        },

        /**
        * Failed to get data, or the data returned was empty
        *
        * @method dataFailure
        * @private
        */
        dataFailure: function (program) {
            require(["view/ToastView"], function (ToastView) {
                new ToastView({
                    message: "Failed to retrieve Test EST data for " + program + ", please try again later.",
                    color: ToastView.prototype.ErrorColor,
                    icon: "fa fa-exclamation-triangle",
                    timer: false
                });
            });

            this.displayError();
        },

        /**
        * format the incoming data for rendering
        *
        * @param {Array} data
        * @return {Array}
        *
        * @method formatData
        * @private
        */
        formatData: function (data) {
            var output = {
                testDates: []
            };

            _.each(_.groupBy(data, function (item) { 
                return item.TestDate; 
            }), function (value, key) {
                output.testDates.push({
                    date: key,
                    values: value
                });
            });

            output.testDates = _(_.map(output.testDates, function (item) {
                return {
                    dateFormat: moment(item.date),
                    sortTime: new Date(item.date).getTime(),
                    date: item.date,
                    image: (item.values.length && item.values[0].Image.length ? item.values[0].Image.split("|") : []),
                    values: item.values
                };
            })).chain().sortBy(function (item) {
                return -item.sortTime;
            }).value();

            output.SmallEstResult = [
                output.testDates[output.testDates.length -1].image,
                output.testDates[output.testDates.length -1].date
            ].join(" ");

            output.SmallEstResultValue = output.testDates[output.testDates.length -1].values.length;

            output.Color = output.testDates[output.testDates.length -1].values.length 
                ? output.testDates[output.testDates.length -1].values[0].Color 
                : "#FFF";

            output.data = data;

            return output;
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
        render: function (data, settings) {
            this.$el.append(this.template("Program-TestEST", data, null, templates));

            var $thead = this.$("thead"),
                $tbody = this.$("tbody");

            var dates = [];

            _.each(_.chain(data.testDates).reverse().value(), function (item) {
                dates.unshift({
                    date: item.date,
                    total: 0
                });

                $("<th></th>", {
                    html: [
                        moment(item.date).format("MM/DD"), 
                        "<br/>",
                        "<span class='test-est-table-header-img'>",
                        _.where(data.testDates, {date: item.date})[0].image.join("<br/>"),
                        "</span>"
                    ].join("")
                }).prependTo($thead);
            });

            $thead.prepend("<th class='radar-est-table-corner'>Early System Test</th>");

            var testNames = _.groupBy(data.data, function (item) {
                return item.TestName;
            });

            var i = 0;

            for (var key in testNames) {
                var $row = $("<tr></tr>").appendTo($tbody);
                
                $row.append(["<td>", key, "</td>"].join(""));

                for (var dateIndex = 0; dateIndex < dates.length; dateIndex++) {
                    var $td = $("<td></td>").appendTo($row);

                    var cellData = _.filter(data.data, {
                        TestDate: dates[dateIndex].date,
                        TestName: key
                    });

                    if (cellData.length) {
                        $td.attr("data-color", cellData[0].Color);

                        var defects = [],
                            total = 0;

                        _.each(cellData, function (item) {
                            if (item.Defects) {
                                defects = item.Defects.split(",");
                                total += defects.length;
                                _.each(defects, function (item, idx) {
                                    defects[idx] = item.trim();
                                });
                            }
                        });

                        $td.text(defects.length ? defects.length : "");

                        if (defects.length) {
                            $td.addClass("test-est-drilldown").on("click.drilldown", (function (ars, This) {
                                return $.proxy(function () {
                                    this.drillDown(ars);
                                }, This);
                            })(defects, this))
                        }

                        dates[dateIndex].total += total;
                    }
                }

                i++;
            }

            $row = $("<tr></tr>").appendTo($tbody);

            $row.append("<td>Total Distinct Defects</td>");

            for (i = 0; i < dates.length; i++) {
                $("<td></td>", {
                    text: dates[i].total
                }).appendTo($row);
            }
        },

        /**
        * user is drilling down into defects
        *
        * @method drillDown
        * @private
        */
        drillDown: function (defects) {
            if (defects && defects.length) {
                _.each(defects, function (item, index) {
                    defects[index] = "000000000" + item;
                });

                RadarAjax.ARDrillDown(defects.join(","), function (data) {
                    require(["view/HtmlModalView"], function (HtmlModalView) {
                        new HtmlModalView({
                            title: "AR Drilldown",
                            html: $("<div>", {
                                addClass: "radar-est-drilldown-data",
                                html: data
                            })
                        });
                    });
                }, this);
            }
        }
    });
});