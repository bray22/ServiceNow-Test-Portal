/*
* SearchResultsView.js
*/

define(["view/View", "jquery"], function (View, $) {
    "use strict";

    /**
    * controls the search results from the navbar search input
    *
    * @class SearchResultsView
    * @constructor
    * @extends View
    * @namespace view
    * @public
    */
    return View.extend({

        /**
        * defines all events interacting with this view's DOM element
        *
        * @property events
        * @readonly
        * @protected
        * @type Object
        */
        events: {
            "click .on-add-widget": "onAddWidget",
            "click .on-launch-widget": "onAppmode",
            "click .on-launch-service": "onService",
            "click .on-search-emc": "onSearchEmc"
        },

        /**
        * initialize templates and handlers
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.$inputEl = params.$inputEl;
            
            this.hubView = params.hubView;
            
            this.$inputEl.on("input.search", $.proxy(function (e) {
                this.onNavbarSearch(e);
            }, this));
        },

        /**
        * user just pushed a key, check for some of our nifty features like arrow-navigation or escape
        *
        * @method onNavbarKeydown
        * @private
        */
        onNavbarKeydown: function (e) {
            var key = e.keyCode || e.which,
                output = true;

            if (key === 27) { // escape
                this.clearView();
            } else if (key === 38) { // arrow up
                this.selectUp();
                output = false;
            } else if (key === 40) { // arrow down
                this.selectDown();
                output = false;
            } else if (key === 13) { // enter
                this.spawnSelection(e);
                output = false;
            }

            return output;
        },

        /**
        * get the index of the argued element, within the list of all elements
        *
        * @param {jQuery} $el - a single selection
        * @param {jQuery} $all - all possible elements
        * @return {Number} the index of $el within $all, or null
        *
        * @method getSelectionIndex
        * @private
        */
        getSelectionIndex: function ($el, $all) {
            var output = null;

            if ($el.length && $all.length) {
                $all.each(function (index) {
                    if ($(this).is($el)) {
                        output = index;
                        return false;
                    }
                });
            } 

            return output;
        },

        /**
        * user just arrowed-up, change selection
        *
        * @method selectUp
        * @private
        */
        selectUp: function () {
            var $selected = this.$(".nav-search-widget.selected, .nav-search-service.selected"),
                $all = this.$(".nav-search-widget, .nav-search-service"),
                index = this.getSelectionIndex($selected, $all);

            if (index !== null) {
                $selected.removeClass("selected");
                if (index > 0) {
                    $all.eq(index -1).addClass("selected");
                }
            } else {
                $all.last().addClass("selected");
            }
        },

        /**
        * user just arrowed-down, change selection
        *
        * @method selectDown
        * @private
        */
        selectDown: function () {
            var $selected = this.$(".nav-search-widget.selected, .nav-search-service.selected"),
                $all = this.$(".nav-search-widget, .nav-search-service"),
                index = this.getSelectionIndex($selected, $all);

            if (index !== null) {
                if (index < $all.length) {
                    $selected.removeClass("selected");
                    $all.eq(index +1).addClass("selected");
                }
            } else {
                $all.eq(0).addClass("selected");
            }
        },

        /**
        * user just clicked enter on their selection, spawn the widget or service
        *
        * @method spawnSelection
        * @private
        */
        spawnSelection: function (e) {
            var $selected = this.$(".nav-search-widget.selected, .nav-search-service.selected");

            if ($selected.length) {
                if ($selected.hasClass("nav-search-widget")) {
                    this.onAddWidget({
                        target: $selected.find(".on-add-widget")[0]
                    });
                } else {
                    this.onService({
                        target: $selected.find(".on-launch-service")[0]
                    });
                }
            }
        },

        /**
        * user just typed something in the nav-bar search input
        *
        * @method onNavbarSearch
        * @private
        */
        onNavbarSearch: function (e) {
            var query = $(e.target).val().toUpperCase().trim(),
                App = require("app"),
                start = Date.now(),
                results = {
                    widgets: [],
                    services: []
                },
                wResults,
                sResults;

            if (!query.length) {
                this.renderSearchResults(null, null);
                return;
            }

            wResults = App.WidgetCollection.query(query);

            if (wResults.length) {
                results.widgets = wResults.slice(0, 4);
            }

            sResults = App.ServiceCollection.query(query);

            if (sResults.length) {
                results.services = sResults.splice(0, 4);
            }

            this.renderSearchResults(e, results);

            if (App.HubModel.get("Debug")) {
                console.info("Search Result query duration: %sms",Date.now() - start);
            }
        },

        /**
        * renders the search results from the navbar
        *
        * @param {Event} e
        * @param {Object} results - {widgets:[WidgetModel], services:[ServiceModel]}
        *
        * @method renderSearchResults
        * @private
        */
        renderSearchResults: function (e, results) {
            var $resultBox = this.$("#navbar-search-results");

            if (!e && !results) {
                this.clearView();
                return;
            }

            this.$inputEl.off("keydown.search").on("keydown.search", $.proxy(function (e) {
                this.onNavbarKeydown(e);
            }, this));

            if (!this.$el.hasClass("visible")) {
                this.$el.show().addClass("visible").animate({opacity: 1}, {duration: 200});
            }

            this.$(".search-group-widgets").children().remove();

            this.$(".search-group-services").children().remove();

            var offset = this.$inputEl.offset();

            this.$el.css({
                position: "absolute",
                right: window.innerWidth - (offset.left + this.$inputEl.parent().width()),
                top: offset.top + $(e.target).height() + 15 // padding
            });

            var $target = this.$(".search-group-widgets");

            _.each(results.widgets, function (model, index) {
                var $el;

                $target.append($el = $(this.template("Nav-Search-Widget-Result", model.attributes)));
                
                if (!model.get("SizeCollection").where({X: 999, Y: 999, Enabled: true}).length) {
                    $el.find(".widget-result-appmode").remove();
                }
            }, this);

            $target = this.$(".search-group-services");

            _.each(results.services, function (model, index) {
                $target.append(this.template("Nav-Search-Service-Result", model.attributes));
            }, this);

            this.$("[data-toggle='tooltip']").tooltip({
                show: true,
                container: "body",
                trigger: "hover"
            });

            // TODO: may need to fiddle with this selector
            $("#content-header, #desktop-container").off("click.remove").on("click.remove", $.proxy(function () {
                $("#content-header, #gridster-container-inner").off("click.remove");
                this.clearView();
            }, this));
        },

        /**
        * user clicked the 'add widget' from the navbar search
        *
        * @method onAddWidget
        * @private
        */
        onAddWidget: function(e) {
            var pluginId = $(e.target).closest(".nav-search-widget").data("pluginid"),
                App = require("app");

            var widgetModel = App.WidgetCollection.where({PluginId: pluginId})[0];

            if (widgetModel) {
                var model = widgetModel.clone(),
                    desktop = this.hubView.getActiveDesktopView();

                model.generateGuid();

                require(["model/WidgetLayoutModel"], $.proxy(function (WidgetLayoutModel) {
                    model.get("LayoutCollection").add(new WidgetLayoutModel({
                        X: 1,
                        Y: 1,
                        Width: model.get("DefaultSize").get("X"),
                        Height: model.get("DefaultSize").get("Y"),
                        ColumnWidth: desktop.gridster.cols
                    }));

                    desktop.model.get("WidgetCollection").add(model);

                    this.clearView();
                }, this));
            } else if (App.HubModel.get("Debug")) {
                console.error("SearchResultsView.onAddWidget() - unable to locate widget model");
            }
        },

        /**
        * user clicked the 'launch appmode' from the navbar search
        *
        * @method onAppmode
        * @private
        */
        onAppmode: function (e) {
            var pluginId = $(e.target).closest(".nav-search-widget").data("pluginid"),
                App = require("app"),
                widgetModel = App.WidgetCollection.where({PluginId: pluginId})[0];

            if (widgetModel) {
                var model = widgetModel.clone();

                require(["view/WidgetAppmodeView"], $.proxy(function (WidgetAppmodeView) {
                    new WidgetAppmodeView({
                        model: model
                    });

                    this.clearView();

                    App.Metrics.WidgetAppmodeViewed({
                        pluginId: model.get("Guid"),
                        Instanceid: model.get("InstanceGuid"),
                        pluginName: model.get("Name")
                    });
                }, this));
            } else if (App.HubModel.get("Debug")) {
                console.error("SearchResultsView.onAppmode() - unable to locate widget model");
            }
        },

        /**
        * user launched a service from the navbar search
        *
        * @method onService
        * @private
        */
        onService: function (e) {
            var pluginId = $(e.target).closest(".nav-search-service").data("pluginid"),
                App = require("app"),
                serviceModel = App.ServiceCollection.where({PluginId: pluginId})[0];

            if (serviceModel) {
                require(["view/IframeModalView"], $.proxy(function (IframeModalView) {
                    new IframeModalView({
                        title: serviceModel.get("Name"),
                        url: serviceModel.get("Url")
                    });
                    
                    this.clearView();

                    App.Metrics.ServiceClicked({
                        pluginId: serviceModel.get("Guid"),
                        pluginName: serviceModel.get("Name"),
                        url: serviceModel.get("Url")
                    });
                }, this));
            } else if (App.HubModel.get("Debug")) {
                console.error("SearchResultsView.onService() - unable to locate service model");
            }
        },

        /**
        * user clicked the 'search emc' link from the nav-bar search results
        *
        * @method onSearchEmc
        * @private
        */
        onSearchEmc: function () {
            var val = this.$inputEl.val(),
                win;

            if (val) {
                this.clearView();
                
                win = window.open("https://search.emc.com/?q=" + encodeURI(val), "_blank");

                if (win) {
                    win.focus();
                } else {
                    require(["util/Util"], function (Util) {
                        Util.NotifyPopupBlocker();
                    });
                }
            }
        },

        /**
        * internally called to hide results, clear input, and clear current results
        *
        * @method clearView
        * @private
        */
        clearView: function () {
            this.$("[data-toggle='tooltip']").tooltip("hide");

            this.$inputEl.val("");

            this.$el.removeClass("visible").animate({opacity: 0}, {
                duration: 200,
                complete: $.proxy(function () {
                    this.$el.hide();
                }, this)
            });

            this.$inputEl.off("keydown.search");
        }
    });
});