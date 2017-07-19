/*
* MidrangeProgramsView.js
*
* entry point to all of radar functionality
*/

define([
"require",
"view/View",
"text!widgets/radar/templates.html",
"jquery",
"underscore",
"widgets/radar/util/ChartSelectors",
"widgets/radar/util/RadarAjax"],
function (
require, 
View, 
templates, 
$, 
_, 
ChartSelectors,
RadarAjax) {

    "use strict";

    /**
    * Entry point of Midrange Program reporting widget
    * in here we govern the configuration and module selecting for the different charting views
    *
    * @class MidrangeProgramsView
    * @namespace radar
    * @extends Backbone.View
    * @constructor
    * @public
    */
    return View.extend({

        events: {
            "click .on-select-program": "onSelectProgram",
            "click .on-compare-programs": "onComparePrograms"
        },

        /**
        * init the dom
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.addStylesheet("./js/widgets/radar/radar-styles.css", function (linkSuccess) {
                if (params.config) {
                    this.initConfig();
                    return;
                }

                this.model.getInstanceConfig(function (settings) {
                    if (settings) {
                        settings = JSON.parse(settings);
                        if (settings.chartId) {
                            if (params.appmode) {
                                this.initAppmode(settings);
                            } else {
                                this.initWidget(settings);
                            }
                        } else {
                            this.configError();
                        }
                    } else if (params.appmode && this.model.get("DeepLinkRouteData")) {
                        //Take care of deeplinks that orginated from legacy/iframed appmode radar
                        this.$el.append(this.template("Radar-Appmode-Iframe", {
                            Source: [
                                RadarAjax.appmodeDomain,
                                "/dashboard",
                                decodeURIComponent(this.model.get("DeepLinkRouteData") || ""),
                                "&guid=",
                                this.model.get("InstanceGuid")
                            ].join("")
                        }, null, templates));
                    } else {
                        if (!params.appmode) {
                            this.model.trigger("configure");
                        } else {
                            this.$el.append(this.template("Appmode-No-Config", null, null, templates));
                        }
                    }
                }, this);
            }, this);
        },

        /**
        * called when configuration is present, but invalid for this client
        *
        * @method configError
        * @private
        */
        configError: function () {
            this.$el.append(this.template("Radar-Widget-Error", {
                Message: "There was an error reading this widget's configuration, please re-configure (<span class='fa fa-cog'></span>) and try again."
            }, null, templates));
        },

        /**
        * init this View in it's widget-form
        *
        * @param {Object} settings
        *
        * @method initWidget
        * @private
        */
        initWidget: function (settings) {
            if (!settings.chart) {
                settings.chart = _.clone(this.getChartObject(settings.chartId));
            }

            // TODO: store featureId/cycleId instead of the entire record
            //      re-request for the record here

            require([settings.chart.module], $.proxy(function (ChartModule) {
                this.chartModule = new ChartModule({
                    model: this.model,
                    el: this.$el,
                    appMode: false,
                    settings: settings
                });
            }, this));
        },

        /**
        * retrieve the chartSelector object, by the serialized ID
        *
        * @param {Number} chartId
        * @return {Object} chartSelector
        *
        * @method getChartObject
        * @private
        */
        getChartObject: function (chartId) {
            var output;

            _.each(ChartSelectors, function (selector) {
                if (selector.id === chartId) {
                    output = selector;
                    return false;
                }
            });

            return output;
        },

        /**
        * init the module as the initial configuration page
        *
        * @method initConfig
        * @private
        */
        initConfig: function () {
            this.$el.append(this.template("Program-Config", null, null, templates));
        },

        /**
        * init the module for appmode
        *
        * @method initAppmode
        * @private
        */
        initAppmode: function (settings) {
            if (!settings.chart) {
                settings.chart = _.clone(this.getChartObject(settings.chartId));
            }
            
            // TODO...
            // note: CFT needs to stay native, so the iframing of the original appmode will need to be determined
            //          by the chart and not this top-level view

            require([settings.chart.module], $.proxy(function (Module) {
                this.appmodeModule = new Module({
                    model: this.model,
                    el: this.$el,
                    appmode: true,
                    settings: settings
                });
            }, this));
        },

        /**
        * from the config template, select a program
        *
        * @method onSelectProgram
        * @private
        */
        onSelectProgram: function () {
            require(["widgets/radar/ProgramChartSelectorView"], $.proxy(function (ChartSelectorView) {
                new ChartSelectorView({
                    callback: $.proxy(function (selections) {
                        var id = selections.chart.id;

                        delete selections.chart;

                        selections.chartId = id;

                        // TODO: store featureId/cycleId instead of the entire record

                        this.model.setInstanceConfig(JSON.stringify(selections), function () {
                            // nothing needed here - the widget will be re-initialized,
                            // but this time it will have settings available
                        }, this);

                        if (selections) {
                            this.model.trigger("configure");
                        }
                    }, this)
                });
            }, this));
        },

        /**
        * from the config template, compare programs
        *
        * @method onComparePrograms
        * @private
        */
        onComparePrograms: function () {
            require(["view/IframeAppmodeView", "widgets/radar/util/RadarAjax"], function (IframeAppmodeView, RadarAjax) {
                new IframeAppmodeView({
                    title: "Midrange Program Comparison",
                    url: RadarAjax.domain + "/dashboard#analytics?l=1"
                });
            });
        }
    });
});