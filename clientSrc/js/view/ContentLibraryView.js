/*
* ContentLibraryView.js
* (FullScreenContentLibraryView) - that's just way to big to type out everytime.
*/

define(["require", "view/View", "util/Ajax", "util/AnimHelpers", "jquery", "i18n!nls/Hub"], 
function (require, View, Ajax, AnimHelpers, $, Strings) {
    "use strict";

    return View.extend({

        /**
        * defines all events interacting with this view's DOM element
        *
        * @property events
        * @namespace view
        * @readonly
        * @protected
        * @type Object
        */
        events: {
            "click .on-close": "onHide",
            "input #clib-search": "onSearch",
            "click .clib-dd-item[data-filter='BU']": "onBUFilter",
            "click .clib-dd-item[data-filter='Role']": "onRoleFilter",
            "click #clib-alpha-lbl-txt": "onAlphaSort",
            "click #clib-pop-lbl-txt": "onPopularitySort",
            "click .on-widget-add": "onAddWidget",
            "click .on-widget-appmode": "onAppmode",
            "click .on-widget-help": "onHelp",
            "click .on-access-control": "onAccessControls",
            "focus #clib-search": "onSearchFocus"
        },

        /**
        * init dom and events
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            var app = require("app");

            Ajax.GetBUList(function (data) {
                this.populateBUList(data);
            }, this);

            Ajax.GetRoleList(function (data) {
                this.populateRoleList(data);
            }, this);

            this.populateWidgetList();

            this.$("[data-toggle='tooltip']").tooltip({
                show: true,
                trigger: "hover",
                container: "body"
            });

            this.on("show", this.onShow, this);

            this.once("show", this.onAlphaSort, this);

            this.on("hide", this.onHide, this);

            this.on("toggle", function (cb) {
                this.trigger(this.isVisible ? "hide" : "show", cb);
            }, this);

            app.UserModel.on("widget-add", this.evaluateOnDesktop, this);

            app.UserModel.on("widget-remove", this.evaluateOnDesktop, this);

            app.UserModel.on("desktop-change", this.evaluateOnDesktop, this);

            this.evaluateOnDesktop();
        },

        /**
        * add unique options and populate the BU list
        *
        * @param {Array} data
        *
        * @method populateBUList
        * @private
        */
        populateBUList: function (data) {
            var $target = this.$("#clib-bu-list");

            data.unshift({
                Key: "my",
                Value: Strings.MyBU
            });

            data.unshift({
                Key: "all",
                Value: Strings.AllBU
            });

            _.each(data, function (item) {
                $target.append(this.template("ContentLibrary-DD-Item", _.extend({
                    Filter: "BU"
                }, item)));
            }, this);

            this.$("#clib-bu-dd-txt").text(data[0].Value).data("current", data[0].Key);
        },

        /**
        * add unique options and populate the Role list
        *
        * @param {Array} data
        *
        * @method populateRoleList
        * @private
        */
        populateRoleList: function (data) {
            var $target = this.$("#clib-role-list");

            data.unshift({
                Key: "my",
                Value: Strings.MyRole
            });

            data.unshift({
                Key: "all",
                Value: Strings.AllRoles
            });

            _.each(data, function (item) {
                $target.append(this.template("ContentLibrary-DD-Item", _.extend({
                    Filter: "Role"
                }, item)));
            }, this);

            this.$("#clib-role-dd-txt").text(data[0].Value).data("current", data[0].Key);
        },

        /**
        * populate the list of widgets onto the DOM
        *
        * @method populateWidgetList
        * @private
        */
        populateWidgetList: function () {
            var $target = this.$("#clib-body-widget-list"),
                $targetParent = $target.parent(),
                widgetList = this.model.query();

            $target.detach(); // out of flow manipulation

            _.each(widgetList, function (widgetModel) {
                var $widget = $(this.template("ContentLibrary-Widget-Item", widgetModel.attributes)),
                    $spinner = $(this.template("Loading-Spinner")).prependTo($widget.find(".clib-item-image"));

                if (widgetModel.get("SizeCollection").where({X: 999, Y: 999, Enabled: true}).length === 0) {
                    $widget.find(".on-widget-appmode").remove();
                }

                if (!widgetModel.getHelpUrl()) {
                    $widget.find(".on-widget-help").remove();
                }

                widgetModel.once("change:Icon", function (model, iconClass, params) {
                    var $iconEl = $widget.find(".clib-item-image");

                    $spinner.remove();
                    
                    if (model.get("ImageUrl")) {
                        $iconEl.css("background-image", "url('" + model.get("ImageUrl") + "')");
                    } else if (iconClass) {
                        $iconEl.addClass(iconClass)
                    } else {
                        $iconEl.css("background-image", "url(./res/img/no-icon.png)");
                    }
                }, this);

                $widget.appendTo($target);
            }, this);

            $targetParent.append($target);
        },

        /**
        * iterates the active desktop model and applies 'on-desktop' indicators to library widgets
        *
        * @method evaluateOnDesktop
        * @private
        */
        evaluateOnDesktop: function () {
            this.$(".owned").removeClass("owned");

            var activeDesktop = require("app").HubView.getActiveDesktopModel();

            if (activeDesktop) {
                activeDesktop.get("WidgetCollection").each(function (widgetModel) {
                    this.$(".clib-item[data-pluginid='" + widgetModel.get("PluginId") + "']").addClass("owned");
                }, this);
            }
        },

        /**
        * used to toggle the animated line for the first time 
        * (because dimensions are unknown until it's visible)
        *
        * @property _firstShow
        * @private
        */
        _firstShow: true,

        /**
        * used to block excessive sorting clicks
        *
        * @property _currentSort
        * @private
        */
        _currentSort: "alpha",

        /**
        * user clicked the alpha-sorting button
        *
        * @method onAlphaSort
        * @private
        */
        onAlphaSort: function () {
            if (this._currentSort === "alpha" && !this._firstShow) {
                return;
            }
            this._currentSort = "alpha";

            this.$("#clib-alpha-lbl-txt.selected, #clib-pop-lbl-txt.selected").removeClass("selected");

            if (!this._firstShow) {
                var $target = $("#clib-alpha-lbl-txt").addClass("selected"),
                    width = $target.width(),
                    offset = $target.offset(),
                    padding = parseInt(this.$("#clib-filters-inner-bottom").css("padding-left").replace(/px/, ""), 10);

                this.$("#clib-sort-selector-top").animate({
                    width: width + "px",
                    left: offset.left - this.$el.offset().left - padding
                }, { duration: 200 });
            } else {
                setTimeout($.proxy(function () {
                    var $target = $("#clib-alpha-lbl-txt").addClass("selected"),
                        width = $target.width(),
                        offset = $target.offset(),
                        padding = parseInt(this.$("#clib-filters-inner-bottom").css("padding-left").replace(/px/, ""), 10);

                    this.$("#clib-sort-selector-top").removeAttr("style").css({
                        width: width + "px",
                        left: offset.left - this.$el.offset().left - padding
                    });

                    this._firstShow = false;
                }, this), 500);
            }

            if (!this._firstShow) {
                this.sortByAlpha();
            }
        },

        /**
        * sort and re-order the widget elements alphabetically
        *
        * @method sortByAlpha
        * @private
        */
        sortByAlpha: function () {
            this.reorderWidgets(this.model.query(this.$("#clib-search").val(), 
                this.getCurrentBUFilter(), 
                this.getCurrentRoleFilter(),
                this._currentSort));
        },

        /**
        * user clicked the popularity-sorting button
        *
        * @method onPopularitySort
        * @private
        */
        onPopularitySort: function () {
            if (this._currentSort === "popularity" && !this._firstShow) {
                return;
            }
            this._currentSort = "popularity";

            this.$("#clib-alpha-lbl-txt.selected, #clib-pop-lbl-txt.selected").removeClass("selected");
            
            if (!this._firstShow) {
                var $target = $("#clib-pop-lbl-txt").addClass("selected"),
                    width = $target.width(),
                    offset = $target.offset(),
                    padding = parseInt(this.$("#clib-filters-inner-bottom").css("padding-left").replace(/px/, ""), 10);

                this.$("#clib-sort-selector-top").animate({
                    width: width + "px",
                    left: offset.left - this.$el.offset().left - padding
                }, { duration: 200 });
            } else {
                setTimeout($.proxy(function () {
                    var $target = $("#clib-pop-lbl-txt").addClass("selected"),
                        width = $target.width(),
                        offset = $target.offset(),
                        padding = parseInt(this.$("#clib-filters-inner-bottom").css("padding-left").replace(/px/, ""), 10);

                    this.$("#clib-sort-selector-top").removeAttr("style").css({
                        width: width + "px",
                        left: offset.left - this.$el.offset().left - padding
                    });

                    this._firstShow = false;
                }, this), 500);
            }

            if (!this._firstShow) {
                this.sortByPopularity();
            }
        },

        /**
        * sort and re-order the widget elements based on popularity
        *
        * @method sortByPopularity
        * @private
        */
        sortByPopularity: function () {
            this.reorderWidgets(this.model.query(this.$("#clib-search").val(), 
                this.getCurrentBUFilter(), 
                this.getCurrentRoleFilter(),
                this._currentSort));
        },

        /**
        * called by the sorting methods - reorders the widgets in the given order
        *
        * @param {WidgetModel[]} widgetList
        *
        * @method reorderWidgets
        * @private
        */
        reorderWidgets: function (widgetList) {
            var $target = this.$("#clib-body-widget-list"),
                i = widgetList.length -1,
                $widget;

            for (; i >= 0; i--) {
                $widget = $target.find(".clib-item[data-pluginid='" + widgetList[i].get("PluginId") + "']");
                if ($widget.length) {
                    $target.prepend($widget.detach());
                }
            }
        },

        /**
        * retrieve the value for BU filter, taking "all" and "my" into account
        *
        * @return {String}
        *
        * @method getCurrentBUFilter
        * @private
        */
        getCurrentBUFilter: function () {
            var current = this.$("#clib-bu-dd-txt").data("current");

            if (current === "all") {
                current = "";
            } else if (current === "my") {
                current = require("app").UserModel.get("PrimaryBusinessUnitId");
            }

            return current;
        },

        /**
        * retrieve the value for Role filter, taking "all" and "my" into account
        *
        * @return {String}
        *
        * @method getCurrentRoleFilter
        * @private
        */
        getCurrentRoleFilter: function () {
            var current = this.$("#clib-role-dd-txt").data("current");

            if (current === "all") {
                current = "";
            } else if (current = "my") {
                current = require("app").UserModel.get("PrimaryRoleId");
            }

            return current;
        },

        /**
        * user typed a new value in the search field
        *
        * @method onSearch
        * @private
        */
        onSearch: function (e) {
            var $input = this.$("#clib-search"),
                val = $input.val(),
                matches = this.model.query(val, this.getCurrentBUFilter(), this.getCurrentRoleFilter());

            this.showWidgets(matches);
        },

        /**
        * user changed the BU filter
        *
        * @method onBUFilter
        * @private
        */
        onBUFilter: function (e) {
            var $target = $(e.target),
                key = $target.data("key");

            this.$("#clib-bu-dd-txt").text($target.text()).data("current", $target.data("key"));

            this.showWidgets(this.model.query(this.$("#clib-search").val(), 
                this.getCurrentBUFilter(), this.getCurrentRoleFilter()));
        },

        /**
        * user changed the Role filter
        *
        * @method onRoleFilter
        * @private
        */
        onRoleFilter: function (e) {
            var $target = $(e.target),
                key = $target.data("key");

            this.$("#clib-role-dd-txt").text($target.text()).data("current", $target.data("key"));

            this.showWidgets(this.model.query(this.$("#clib-search").val(), 
                this.getCurrentBUFilter(), this.getCurrentRoleFilter()));
        },

        /**
        * after a search query or filter changes, this will be called to show/hide matching widgets
        *
        * @param {WidgetModel[]} matches
        *
        * @method showWidgets
        * @private
        */
        showWidgets: function (matches) {
            this.$(".clib-item").hide();
            _.each(matches, function (widgetModel) {
                this.$(".clib-item[data-pluginid='" + widgetModel.get("PluginId") + "']").show();
            }, this);
        },

        /**
        * add the widget to the desktop
        *
        * @method onAddWidget
        * @private
        */
        onAddWidget: function (e) {
            var id = $(e.target).closest(".clib-item").data("pluginid"),
                widget = this.model.where({PluginId: id}),
                app = require("app");

            if (widget.length) {
                this.$("[data-toggle='tooltip']").tooltip("hide");

                app.HubView.trigger("add-widget", widget[0]);
            } else if (app.HubModel.get("Debug")) {
                console.error("ContentLibraryView.onAddWidget() - unable to determine widget");
            }
        },

        /**
        * open the widget in appmode
        *
        * @method onAppmode
        * @private
        */
        onAppmode: function (e) {
            var id = $(e.target).closest(".clib-item").data("pluginid"),
                widget = this.model.where({PluginId: id}),
                app = require("app");

            if (widget.length) {
                this.$("[data-toggle='tooltip']").tooltip("hide");

                require(["view/WidgetAppmodeView"], $.proxy(function (WidgetAppmodeView) {
                    var model = widget[0].clone();

                    new WidgetAppmodeView({
                        model: model
                    });

                    this.onHide();
                }, this));

                app.Metrics.WidgetAppmodeViewed({
                    pluginId: widget[0].get("Guid"),
                    Instanceid: widget[0].get("InstanceGuid"),
                    pluginName: widget[0].get("Name")
                });
            } else if (app.HubModel.get("Debug")) {
                console.error("ContentLibraryView.onAppmode() - unable to determine widget");
            }
        },

        /**
        * open the widget's help wiki
        *
        * @method onHelp
        * @private
        */
        onHelp: function (e) {
            var id = $(e.target).closest(".clib-item").data("pluginid"),
                widget = this.model.where({PluginId: id});

            if (widget.length) {
                this.$("[data-toggle='tooltip']").tooltip("hide");

                require(["view/IframeModalView"], function (IframeModalView) {
                    new IframeModalView({
                        title: Strings.WidgetHelpModalTitle + widget[0].get("Name"),
                        url: widget[0].getHelpUrl()
                    });
                });
            } else if (require("app").HubModel.get("Debug")) {
                console.error("ContentLibraryView.onHelp() - unable to determine widget");
            }
        },

        /**
        * user clicked the access controls icon
        *
        * @method onAccessControls
        * @private
        */
        onAccessControls: function (e) {
            var id = $(e.target).closest(".clib-item").data("pluginid"),
                widget = this.model.where({PluginId: id});

            require(["view/IframeModalView", "util/Environment"], function (IframeModalView, Environment) {
                new IframeModalView({
                    title: Strings.AccessControlTitle.replace(/{{ Name }}/g, widget[0].get("Name")),
                    url: Environment + "/OCM_Management/HubAccessControl.aspx?PluginId=" + id
                });
            });
        },

        /**
        * internally used to block excessive show/hide calls
        *
        * @property isVisible
        * @private
        */
        isVisible: false,


        /**
        * cached reference to the desktop-cover
        *
        * @property _$backdrop
        * @private
        */
        _$backdrop: undefined,

        /**
        * animate the Content Library in
        *
        * @param {Function} cb - optional on-complete callback
        *
        * @method onShow
        * @private
        */
        onShow: function (cb) {
            if (this.isVisible === true) {
                return;
            }

            if (!this._$backdrop) {
                this._$backdrop = $("#gridster-backdrop");
            }

            this._$backdrop.show()
                .on("click.close", $.proxy(this.onHide, this))
                .animate({opacity: 0.35}, {duration: 300});

            AnimHelpers.FadeScaleIn(this.$el.show(), function () {
                this.isVisible = true;

                this.$("#clib-search").val("").focus();

                $(window).on("keyup.clescape", $.proxy(function cb_escapeHandler (e) {
                    var key = e.which || e.keyCode;

                    if (key === 27) {
                        this.onHide();
                    }
                }, this));

                if (typeof cb === "function") {
                    cb();
                }
            }, this);

            require("app").Metrics.ContentLibraryClicked({});        
        },

        /**
        * animate the Content Library out
        *
        * @param {Function} cb - optional on-complete callback
        *
        * @method onHide
        * @private
        */
        onHide: function (cb) {
            if (this.isVisible === false) {
                return;
            }

            var app = require("app");

            if (!this._$backdrop) {
                this._$backdrop = $("#gridster-backdrop");
            }

            this._$backdrop.animate({opacity: 0}, {
                duration: 300,
                complete: $.proxy(function () {
                    this._$backdrop.hide();
                }, this)
            });

            $(window).off("keyup.clescape");

            this._$backdrop.off("click.close");

            AnimHelpers.FadeScaleOut(this.$el, function () {
                this.isVisible = false;
                this.$el.hide();
                this.$("#clib-search").val("");
                this.onSearch();
                if (typeof cb === "function") {
                    cb();
                }
            }, this);

            app.Metrics.ContentLibraryClosed({});
        },

        /**
        * user just focused the search box - only log the metric
        *
        * @method onSearchFocus
        * @private
        */
        onSearchFocus: function () {
            require("app").Metrics.ContentLibrarySearch({});
        }
    });
});