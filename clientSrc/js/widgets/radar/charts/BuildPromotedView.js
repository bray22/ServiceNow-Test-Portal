/*
* PromotedBuildView.js
*/

define([
"widgets/radar/baseViews/RadarView", 
"widgets/radar/util/RadarAjax",
"text!widgets/radar/templates.html", 
"underscore"], 
function (
RadarView, 
RadarAjax, 
templates, 
_) {
        
    "use strict";

    /**
    * Promoted Builds view
    *
    * @class PromotedBuildView
    * @extends RadarView
    * @constructor
    * @namespace radar
    * @public
    */
    return RadarView.extend({

        events: {
            "click .on-drilldown-total": "onDrilldownTotal",
            "click .on-drilldown-testready": "onDrilldownTestready",
            "click .on-drilldown-verified": "onDrilldownVerified",
            "click .on-drilldown-other": "onDrilldownOther",
            "click .radar-build-promoted-search-ar": "onSearchAR"
        },

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

            this.program = params.settings.program;

            this.polltime(params.settings.chart.polltime);

            this.model.set("Name", params.settings.program + " " + params.settings.chart.title);

            this.showLoading(this.$el, function () {
                RadarAjax.GetPromotedBuilds(params.settings.program, function (data) {
                    if (data) {
                        this.hideLoading(function () {
                            this.render(data);
                        });
                    } else {
                        this.dataFailure(params.settings.program);
                    }
                }, this);
            });
        },

        /**
        * init the appmode iframe
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
                    message: "Failed to retrieve promoted builds data for " + program + ", please try again later.",
                    color: ToastView.prototype.ErrorColor,
                    icon: "fa fa-exclamation-triangle",
                    timer: false
                });
            });

            this.displayError();
        },

        /**
        * parse out the version number from the end of the 'Version' field
        *
        * @param {Object} data
        * @return {String}
        *
        * @method getLastPromoted
        * @private
        */
        getLastPromoted: function (data) {
            var last = data[0],
                output = -1;

            if (last) {
                for (var c = last.Version.length - 1, t = 0; c >= 0; c--, t++) {
                    if (last.Version.charAt(c) === "_") {
                        output = last.Version.substring(c + 1, c + t + 1);
                        break;
                    }
                }
            }

            return output;
        },

        /**
        * initialize dom templates, render the data
        *
        * @param {Object} data - {Fields:[], Data: []}
        *
        * @method render
        * @private
        */
        render: function (data) {
            this.$el.append(this.template("Program-Promoted-Builds", {
                LastPromoted: this.getLastPromoted(data.Data)
            }, null, templates));

            var $target = this.$(".radar-build-promoted-list");

            _.each(data.Data, function (item) {
                $target.append(this.template("Program-Promoted-Builds-Line-Item", {
                    Day: item.Day,
                    Version: item.Version,
                    Total: item.Total,
                    TestReady: item.TestReady,
                    Verified: item.Verified,
                    Other: item.Other,
                    DT: (new Date(Date.parse(item.Day))).getTime()
                }, {}, templates));
            }, this);

            this.$("[data-toggle='tooltip']").tooltip({
                trigger: "hover",
                container: "body"
            });
        },

        /**
        * user clicked a 'total' number
        *
        * @method onDrilldownTotal
        * @private
        */
        onDrilldownTotal: function (e) {
            var $item = $(e.target).closest(".radar-promoted-builds-line-item"),
                dt = $item.data("dt"),
                version = $item.data("version");

            this.drilldown(this.program, version, dt);
        },

        /**
        * user clicked a 'test-ready' number
        *
        * @method onDrilldownTestready
        * @private
        */
        onDrilldownTestready: function (e) {
            var $item = $(e.target).closest(".radar-promoted-builds-line-item"),
                dt = $item.data("dt"),
                version = $item.data("version");

            this.drilldown(this.program, version, dt, "Test-Ready");
        },

        /**
        * user clicked a 'verified' number
        *
        * @method onDrilldownVerified
        * @private
        */
        onDrilldownVerified: function (e) {
            var $item = $(e.target).closest(".radar-promoted-builds-line-item"),
                dt = $item.data("dt"),
                version = $item.data("version");

            this.drilldown(this.program, version, dt, "Verified");
        },

        /**
        * user clicked a 'other' number
        *
        * @method onDrilldownOther
        * @private
        */
        onDrilldownOther: function (e) {
            var $item = $(e.target).closest(".radar-promoted-builds-line-item"),
                dt = $item.data("dt"),
                version = $item.data("version");

            this.drilldown(this.program, version, dt, "Other");
        },

        /**
        * entry point from the various click event callbacks to execute and display a drilldown
        *
        * @method onDrilldown
        * @private
        */
        drilldown: function (program, version, dt, status) {
            RadarAjax.GetBuildTBV(program, version, dt, status, function (htmlTable) {
                require(["widgets/radar/baseViews/RadarTableView"], $.proxy(function (RadarTableView) {
                    new RadarTableView({
                        title: this.program + " Build TBVs" + (status ? (" (" + status + ")") : ""),
                        table: htmlTable,
                        width: "90%",
                        export: true
                    });
                }, this));
            }, this);
        },

        /**
        * user clicked the search-ar button, validate the input and search
        *
        * @method onSearchAR
        * @private
        */
        onSearchAR: function () {
            var $input = this.$(".radar-build-promoted-ar-search-input"),
                val = $input.val();

            if (val) {
                RadarAjax.GetBuildARSearch(this.program, val, function (data) {
                    require(["widgets/radar/baseViews/RadarTableView", "view/ToastView"], function (RadarTableView, ToastView) {
                        if (data && data.indexOf("<table>") !== -1) {
                            new RadarTableView({
                                title: "AR Search Results: (" + val + ")",
                                table: data,
                                width: "90%",
                                export: true
                            });
                        } else {
                            new ToastView({
                                message: "No ARs were found for '" + val + "'",
                                color: ToastView.prototype.WarningColor,
                                icon: "fa fa-search"
                            });
                        }
                    });
                });
            } else {
                this.$(".radar-build-promoted-ar-results").children().remove();
                $input.addClass("radar-input-error").one("input.removeError", function () {
                    $input.removeClass("radar-input-error");
                });
            }
        }
    });
});