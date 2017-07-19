/*
* FeatureSummaryView.js
*/

define([
"require", 
"widgets/radar/baseViews/RadarView",
"text!widgets/radar/templates.html",
"widgets/radar/util/RadarAjax",
"jquery",
"underscore"],
function (
require, 
RadarView, 
templates, 
RadarAjax, 
$, 
_) {
        
    "use strict";

    /**
    * defines rendering logic for feature summary
    *
    * @class FeatureSummaryView
    * @extends RadarView
    * @namespace radar
    * @constructor
    * @public
    */
    return RadarView.extend({

        events: {
            "click .on-drilldown": "onDrilldown"
        },

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

            this.polltime(params.settings.chart.polltime);

            this.params = params.settings.chart.paramConfig;

            this.program = params.settings.program;

            this.model.set("Name", params.settings.program + " Feature Summary");
            
            RadarAjax.GetFeatureSummary(params.settings.program, params.settings.cycle.RadarQueryString, function (data) {
                if (data) {
                    this.render(params.settings, this.formatData(data));
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
                    "/dashboard#operations?p=",
                    settings.program,
                    "&guid=",
                    this.model.get("InstanceGuid")
                ].join("")
            }, null, templates));
        },

        /**
        * called when the feature summary ajax call fails
        *
        * @method dataFailure
        * @private
        */
        dataFailure: function () {
            require(["view/ToastView"], function (ToastView) {
                new ToastView({
                    message: "There was an error retrieving the feature summary list for this widget, please try again later.",
                    color: ToastView.prototype.ErrorColor,
                    icon: "fa fa-exclamation-triangle"
                });
            });

            this.displayError();
        },

        /**
        * formats the data, matching the original implementation
        *
        * @param {Array} data
        * @return {Array}
        *
        * @method formatData
        * @private
        */
        formatData: function (data) {
            var noFeature = _.filter(data, {Dimension_value: "// Non-Tracked Feature"}),
                filtered = _.filter(data, function (item) {
                    if (item.Dimension_value.indexOf("Tracked Feature") !== -1 && item.Feature_Name === null) {
                        return false;
                    }

                    if (item.Dimension_value.indexOf("Non-Tracked Feature") === -1) {
                        return true;
                    }

                    return false;
                });

            if (data.length) {
                data[0].Feature_Name = "All";
            }

            if (noFeature.length) {
                noFeature[0].Feature_Name = "Non-Tracked Features";
            }

            return data;
        },

        /**
        * called after config retrieval/validation to render the widget
        *
        * @param {Object} settings
        * @param {Array} data
        *
        * @method render
        * @private
        */
        render: function (settings, data) {
            this.data = data;

            this.$el.append(this.template("Program-Feature-Summary", {
                Cycle: settings.cycle.MenuName,
                TrackedFeatureCount: Math.clamp(data.length -2, 0, Infinity)
            }, null, templates));

            var $target = this.$(".radar-fusmmary-list");

            _.each(data, function (item) {
                var $item = $(this.template("Program-Feature-Summary-Table-Item", {
                    FeatureName: item.Feature_Name,
                    OBL: item.OBL,
                    TBL: item.TBL,
                    Att: item.AttPct,
                    FirstPassed: item.PassPct
                }, null, templates)).appendTo($target);

                if (item.OBL === 0) {
                    $item.find(".radar-fsummary-feature-obl").removeClass("drilldown on-drilldown");
                }

                if (item.TBL === 0) {
                    $item.find(".radar-fsummary-feature-tbl").removeClass("drilldown on-drilldown");
                }

                if (item.AttPct === 0) {
                    $item.find(".radar-fsummary-feature-attpct").removeClass("drilldown on-drilldown");
                }

                if (item.Feature_Name === "All") {
                    $item.find(".radar-fsummary-feature-name").removeClass("drilldown on-drilldown");
                }
            }, this);
        },

        /**
        * user clicked on a drilldown link
        *
        * @method onDrilldown
        * @private
        */
        onDrilldown: function (e) {
            var $target = $(e.target),
                $item = $(e.target).closest(".radar-fsummary-table-item"),
                drilltype = $target.data("drilldown"),
                dataItem = this.data[$item.index()],
                This = this;


            require(["view/IframeModalView"], function (IframeModalView) {

                var p3qs = "";
                if (dataItem.Dimension_value) {
                    var dv = dataItem.Dimension_value.substr(dataItem.Dimension_value.length - 4);
                    p3qs = ($.isNumeric(dv) ? "&p3=FT000000000" + dv : "" );
                }

                new IframeModalView({
                    title: "AR Details",
                    url: RadarAjax.cashBaseUrl + "#?" + $.param({
                        p: This.program,
                        source: "remedyIssue",
                        save: false,
                        p12: false,
                        tab: drilltype,
                        p1: This.params.p1,
                        p2: "Bug"
                    }) + p3qs,
                    width: "90%",
                    height: "90%"
                });
            });
        }
    });
});