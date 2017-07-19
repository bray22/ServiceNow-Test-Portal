/*
* CATeamsView.js
*/

define(["view/View", "text!widgets/cateams/templates.html"], function (View, templates) {
    "use strict";

    /**
    * CA Teams Widget entry point
    *
    * @class CATeamsView
    * @extends View
    * @namespace cateams
    * @constructor
    * @public
    */
    return View.extend({

        events: {
            "click .on-select-team": "onSelectTeam"
        },

        /**
        * initialize the DOM
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.addStylesheet("./js/widgets/cateams/cateams-styles.css", function (linkSuccess) {
                if (params.config) {
                    this.initConfig();
                    return;
                }

                this.model.getInstanceConfig(function (config) {
                    if (config) {
                        var settings;
                        try {
                            settings = JSON.parse(config);
                        } catch (e) {
                            this.configError();
                            settings = undefined;
                        } finally {
                            if (settings) {
                                if (params.appmode) {
                                    this.initAppmode(params, settings);
                                } else {
                                    this.initWidget(params, settings);
                                }
                            }
                        }
                    } else {
                        this.model.trigger("configure");
                    }
                }, this);
            }, this);
        },

        /**
        * error to display when configs failed to retrieve/parse
        *
        * @method configError
        * @private
        */
        configError: function () {
            this.$el.children().remove();
            this.$el.append(this.template("CATeam-Error", {
                Message: "Error retrieving widget settings, please try again later"
            }, null, templates));
        },

        /**
        * init this view as the configuration page
        *
        * @method initConfig
        * @private
        */
        initConfig: function () {
            this.$el.append(this.template("CATeam-Config", null, null, templates));
        },

        /**
        * user clicked on the 'select a team' from the config page
        *
        * @method onSelectTeam
        * @private
        */
        onSelectTeam: function () {
            require(["widgets/cateams/CATeamSelectorView"], $.proxy(function (CATeamSelectorView) {
                new CATeamSelectorView({
                    callback: $.proxy(function (selection) {
                        if (selection.programs) {
                            // don't need to persist this stuff
                            _.each(selection.programs, function (item) {
                                delete item.ProgramRank;
                                delete item.IsArchived;
                            });
                        }

                        this.model.setInstanceConfig(JSON.stringify(selection), function (success) {
                            // nothing to do here, the widget will be re-initialized
                            // but this time have values in it's configuration to render
                        });

                        this.model.trigger("configure");
                    }, this)
                });
            }, this));
        },

        /**
        * initialize this view in widget mode
        *
        * @param {Object} params
        *
        * @method initWidget
        * @private
        */
        initWidget: function (params, settings) {
            require([settings.module], $.proxy(function (ChartModule) {
                this.chartModule = new ChartModule({
                    model: this.model,
                    el: this.$el,
                    settings: settings,
                    appmode: params.appmode,
                    config: params.config
                });
            }, this));
        },

        /**
        * initialize the appmode dashboard
        *
        * @param {Object} params
        * @param {Object} settings
        *
        * @method initAppmode
        * @private
        */
        initAppmode: function (params, settings) {
            require(["widgets/cateams/CATeamsAppmodeView"], $.proxy(function (CATeamsAppmodeView) {
                this.appmodeView = new CATeamsAppmodeView({
                    model: this.model,
                    el: this.$el,
                    settings: settings,
                    config: params.config
                });
            }, this));
        }
    });
});