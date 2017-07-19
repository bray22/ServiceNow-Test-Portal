/*
* HubView.js
*
* Extends View, defines the UI functionality to TheHub
*/

define([
"require", 
"view/View", 
"view/DesktopView", 
"underscore", 
"jquery",
"i18n!nls/Hub", 
"view/SearchResultsView", 
"view/HelpMenuView", 
"view/AlertMenuView", 
"view/DesktopMenuView",
"view/NewsView",
"view/ContentLibraryView",
"util/Messaging"], 
function (
require, 
View, 
DesktopView, 
_, 
$,
Strings, 
SearchResultsView, 
HelpMenuView, 
AlertMenuView, 
DesktopMenuView,
NewsView,
ContentLibraryView,
Messaging) {

    "use strict";

    /**
    * HubView controls the top-most level of interaction with TheHub as an application,
    * it also contains some helpful methods to get the current active desktop model/view
    *
    * @class HubView
    * @constructor
    * @extends View
    * @namespace view
    * @public
    */
    var HubView = View.extend({

        /**
        * defines all events interacting with this view's DOM element
        *
        * @property events
        * @readonly
        * @protected
        * @type Object
        */
        events: {
            "click .on-open-help-menu": "onShowHelp",
            "click .on-open-alert-menu": "onShowAlerts",
            "click .on-open-desktop-menu": "onShowDesktopMenu",
            "click .on-show-livewire": "onShowChat",
            "click #devmenu-trigger-inner": "onShowDevMenu",
            "click .on-user-info": "onMyInfo",
            "click .on-reload-hub": "onReload",
            "click .on-open-library": "onShowContentLibrary",
            "click .on-open-news": "onShowNews",
            "focus #navbar-search": "onSearchFocus",
            "click .on-submit-incident": "onSubmitIndcident"
        },

        /**
        * the selector used as the 'off click' of navbar menus
        *
        * @property menuCloseSelector
        * @private
        * @type String
        * @readonly
        */
        menuCloseSelector: "#content-header, #gridster-container-inner, #desktop-container",

        /**
        * populate dynamic DOM elements
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.$contentBody = this.$("#content-body");

            this.DesktopViewList = [];
            
            this.model.UserModel.get("DesktopCollection").on("add", this.onNewDesktop, this);
            
            this.model.UserModel.get("DesktopCollection").on("remove", this.onRemoveDesktop, this);

            this.once("widget-load", function (widgetCollection) {
                this.ContentLibraryView = new ContentLibraryView({
                    model: widgetCollection,
                    el: $("#clib")
                });
            }, this);

            this.searchResultsView = new SearchResultsView({
                hubView: this,
                el: this.$("#navbar-search-results"),
                $inputEl: this.$("#navbar-search")
            });

            this.helpMenuView = new HelpMenuView({
                hubView: this,
                el: this.$("#hub-help-menu"),
                $icon: this.$("#hub-navbar-help")
            });

            this.alertMenuView = new AlertMenuView({
                hubView: this,
                model: require("app").UserModel.get("AlertCollection"),
                el: this.$("#alert-menu"),
                $icon: this.$("#hub-navbar-alert-icon")
            });

            this.desktopMenuView = new DesktopMenuView({
                hubView: this,
                model: require("app").UserModel.get("DesktopCollection"),
                el: this.$("#desktop-menu"),
                $icon: this.$("#hub-navbar-desktops"),
                $currentName: this.$("#desktop-name")
            });

            require(["util/Ajax"], $.proxy(function (Ajax) {
                Ajax.GetNews(function (NewsCollection) {
                    this.NewsView = new NewsView({
                        hubView: this,
                        el: this.$("#news"),
                        model: NewsCollection,
                        $countIcon: this.$("#hb-news-count-txt")
                    });
                }, this);
            }, this));
            
            if (require("app").HubModel.get("Debug")) {
                require(["view/DevMenuView"], $.proxy(function (DevMenuView) {
                    this.DevMenu = new DevMenuView();
                }, this));
            }

            this.$(".hb-user-name").text(this.model.UserModel.get("FullName"));

            this.on("add-widget", this.onAddNewWidget, this);

            $(window).resize($.proxy(function () {
                this.onWindowResize();
            }, this));

            Messaging.Start();

            this.initLivewire();

            this.initHotKeys();

            this.$("#hub-navbar-user-img").attr("title", this.model.UserModel.get("FullName"))
                .css("background-image", "url('" + this.model.UserModel.get("UserIconUrl") + "'), url('../res/img/user-icon.png')");

            this.$("#hub-navbar [data-toggle='tooltip']").tooltip({
                trigger: "hover",
                container: "body",
                delay: {
                    show: 500,
                    hide: 0
                }
            });

            if (params.query.dlh || params.query.dlrd) {
                this.initDeepLink(params.query);
            } else {
                this.initDesktops();
            }

            if (this.model.UserModel.get("IsFirstTimeUser")) {
                this.once("load-complete", function () {
                    require(["view/WalkthroughView"], function (WalkthroughView) {
                        new WalkthroughView({
                            step: params.query.newuserstep
                        });
                    });
                }, this);
            }
        },

        /**
        * initialize our hot-key handlers
        *
        * @method initHotKeys
        * @private
        */
        initHotKeys: function () {
            $(window).on("keypress", $.proxy(function cb_hotkeys (e) {
                if (document.activeElement.nodeName === "INPUT") {
                    return;
                }

                if (e.key === "s") {
                    var $search = this.$("#navbar-search");
                    $search.focus();
                    setTimeout($.proxy(function () {
                        $search.val("");
                    }, this), 1);
                } else if (e.key === "c") {
                    this.onShowContentLibrary();
                } else if (e.key === "n") {
                    this.onShowNews();
                }
            }, this));
        },

        /**
        * launch appmode for the given hash, then init desktops 
        * -we want the appmode iframe loaded first
        * -library widget reference-list is loaded async, may need to wait for it before executing
        *
        * @param {Object} params - url query string params, which could have 5 different deeplink datapoints (-.-)
        *
        * @method initDeepLink
        * @private
        */
        initDeepLink: function (params) {
            // private method to display a "no widget" error message
            function _noWidget(ToastView) {
                new ToastView({
                    message: Strings.DeepLinkNoWidget,
                    color: ToastView.prototype.WarningColor,
                    icon: "fa fa-chain-broke",
                    timer: false
                });

                this.initDesktops();
            }

            // private method to display a "expired link" error message
            function _expiredLink(ToastView) {
                new ToastView({
                    message: Strings.DeepLinkExpired,
                    color: ToastView.prototype.WarningColor,
                    icon: "fa fa-chain-broke",
                    timer: false
                });

                this.initDesktops();
            }

            // private method to search for the widget and spawn it
            function _execute(WidgetCollection, guid, WidgetAppmodeView) {
                var widget = WidgetCollection.where({Guid: guid});

                if (widget.length) {
                    var cloned = widget[0].clone();

                    cloned.set("DeepLinkHash", params.dlh);

                    if (params.dlrd) {
                        cloned.set("DeepLinkRouteData", params.dlrd);
                    }

                    if (params.SwarmArray || params.SwarmHost || params.SwarmTestbed) {
                        cloned.set(params);
                    }

                    // widgetModel.getAppmodeUrl() will have to take care of the rest of this deeplink MESS
                    new WidgetAppmodeView({
                        model: cloned
                    });
                } else {
                    _noWidget.call(this, ToastView);
                }

                this.initDesktops();
            }

            require(["util/Ajax", "view/ToastView", "app", "view/WidgetAppmodeView"], 
            $.proxy(function (Ajax, ToastView, App, WidgetAppmodeView) {
                App.Metrics.DeepLinkHit({
                    url: location.pathname + location.search + location.hash
                });
                Ajax.GetDeepLinkGuid(params.dlh, function (guid) {
                    if (guid) {
                        if (App.WidgetCollection) {
                            _execute.call(this, App.WidgetCollection, guid, WidgetAppmodeView);
                        } else {
                            // it's possible the widget collection hasn't finished loading...
                            var interval = setInterval($.proxy(function () {
                                if (App.WidgetCollection) {
                                    clearInterval(interval);
                                    _execute.call(this, App.WidgetCollection, guid, WidgetAppmodeView);
                                }
                            }, this), 250);
                        }
                    } else {
                        _expiredLink.call(this, ToastView);
                    }
                }, this);

            }, this));
        },

        /**
        * initialize all of the desktop views
        *
        * re-ensure there is an active desktop to initialize on our initial load
        *
        * @method initDesktops
        * @private
        */
        initDesktops: function () {
            this.model.UserModel.get("DesktopCollection").each(function (model, index, collection) {
                this.DesktopViewList.push(new DesktopView({
                    model: model,
                    el: $("<div></div>", {
                        id: "desktop-" + model.get("DesktopId"),
                        addClass: "gridster-desktop"
                    }),
                    $gridster: this.$("#gridster-container-inner")
                }));
            }, this);
        },

        /**
        * collection callback when a new desktop is added
        *
        * @param {DesktopModel} desktopModel
        *
        * @method onNewDesktop
        * @private
        */
        onNewDesktop: function (desktopModel) {
            this.DesktopViewList.push(new DesktopView({
                model: desktopModel,
                el: $("<div></div>", {
                    id: "desktop-" + desktopModel.get("DesktopId"),
                    addClass: "gridster-desktop"
                }),
                $gridster: this.$("#gridster-container-inner")
            }));
        },

        /**
        * collection callback when a desktop is removed
        *
        * @param {DesktopModel} desktopModel
        *
        * @method onRemoveDesktop
        * @private
        */
        onRemoveDesktop: function (desktopModel) {
            var count = this.DesktopViewList.length,
                i = 0;

            for ( ; i < count; i++) {
                if (this.DesktopViewList[i].model === desktopModel) {
                    this.DesktopViewList[i].$el.remove();
                    this.DesktopViewList.splice(i, 1);
                    break;
                }
            }
        },

        /**
        * initialize the livewire "reach" plugin extension
        *
        * @method initLivewire
        * @private
        */
        initLivewire: function () {
            window._reach = window._reach || [];

            window._reach.push({
                container: "livewire-plugin",
                domain: "https://livewire.socialcast.com/",
                token: "684819c9e88674b872080ea2ddd8f36f9142e886",
                autogrow: false,
                iframeHeight: "100%"
            });

            var e = document.createElement("script");
            e.type = "text/javascript";
            e.async = true;
            e.src = document.location.protocol + "//livewire.socialcast.com/services/reach/extension.js";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(e, s);
        },

        /**
        * return the DesktopModel that is currently active
        *
        * @return {DesktopModel}
        *
        * @method getActiveDesktopModel
        * @public
        */
        getActiveDesktopModel: function () {
            var desktops = this.model.UserModel.get("DesktopCollection").where({IsActive: true});
            return desktops.length ? desktops[0] : null;
        },

        /**
        * determine and retrieve the desktop VIEW thats currently active
        *
        * @return {DesktopView}
        *
        * @method getActiveDesktopView
        * @private
        */
        getActiveDesktopView: function () {
            var output = undefined;

            _.each(this.DesktopViewList, function (desktopView, index) {
                if (desktopView.model.get("IsActive")) {
                    output = desktopView;
                    return false;
                }
            });

            return output;
        },

        /**
        * event-handler when the user adds a new widget from content library
        *
        * @param {WidgetModel} widgetModel
        *
        * @method onAddNewWidget
        * @private
        */
        onAddNewWidget: function (widgetModel) {
            var desktopModel = this.getActiveDesktopModel();
            if (desktopModel) {
                desktopModel.trigger("add-new-widget", widgetModel);
            } else if (require("app").HubModel.get("Debug")) {
                console.warn("HubView.onAddNewWidget() - unable to determine active desktop");
            }
        },

        /**
        * called in a few difference methods to close the nav-bar search results
        *
        * @method closeNavbarSearchResults
        * @private
        */
        closeNavbarSearchResults: function () {
            this.$("[data-toggle='tooltip']").tooltip("hide");
            this.$("#navbar-search").val("");
            this.$("#navbar-search-results").remove();
            $(this.menuCloseSelector).off("click.remove");
        },

        /**
        * the window just resized - get the active gridster and tell it to re-evaluate it's columns
        *
        * @method onWindowResize
        * @private
        */
        onWindowResize: function () {
            var desktop = this.getActiveDesktopModel();

            if (desktop) {
                desktop.trigger("resize");
            } else if (require("app").HubModel.get("Debug")) {
                console.warn("HubView.onWindowResize() - unable to determine active desktop");
            }
        },

        /**
        * user clicked the hub help icon
        *
        * @method onShowHelp
        * @private
        */
        onShowHelp: function () {
            var app = require("app");

            this.helpMenuView.show($.proxy(function () {
                $(this.menuCloseSelector).off("click.removeHelpMenu");
            }, this));

            $(this.menuCloseSelector).one("click.removeHelpMenu", $.proxy(function () {
                this.helpMenuView.close();
            }, this));

            app.Metrics.HelpClicked({});
        },

        /**
        * user clicked the alerts icon
        *
        * @method onShowAlerts
        * @private
        */
        onShowAlerts: function () {
            this.alertMenuView.show($.proxy(function () {
                $(this.menuCloseSelector).off("click.removeAlertMenu");
            }, this));

            $(this.menuCloseSelector).one("click.removeAlertMenu", $.proxy(function () {
                this.alertMenuView.close();
            }, this));
        },

        /**
        * user clicked the desktop-menu icon
        *
        * @method onShowDesktopMenu
        * @private
        */
        onShowDesktopMenu: function () {
            this.desktopMenuView.show($.proxy(function () {
                $(this.menuCloseSelector).off("click.removeDesktopMenu");
            }, this));

            $(this.menuCloseSelector).on("click.removeDesktopMenu", $.proxy(function () {
                this.desktopMenuView.close();
            }, this));
        },

        /**
        * user clicked the TheHub Chat link
        *
        * @method onShowChat
        * @private
        */
        onShowChat: function () {
            var $livewire = this.$("#livewire"),
                isVisible = $livewire.hasClass("show");

            $livewire.toggleClass("show");
        },

        /**
        * user clicked the dev-menu trigger
        *
        * @method onShowDevMenu
        * @private
        */
        onShowDevMenu: function () {
            var $devMenu = this.$("#devmenu"),
                isVisible = $devMenu.hasClass("show");

            $devMenu.toggleClass("show");

            if (isVisible) {
                $devMenu.one("transitionend", function () {
                    $devMenu.removeClass("material-dropshadow");
                });
            } else {
                $devMenu.addClass("material-dropshadow");
            }
        },

        /**
        * user clicked on 'my info' link
        *
        * @method onMyInfo
        * @private
        */
        onMyInfo: function () {
            require(["view/IframeModalView", "util/Environment", "app"], function (IframeModalView, Environment, App) {
                new IframeModalView({
                    title: Strings.MyInformationTitle,
                    url: Environment + "/MyInfo.aspx?UserId=" + App.UserModel.get("UserId"),
                    width: 566,
                    height: 443
                });

                App.Metrics.MyInfoClicked({});
            });
        },

        /**
        * user clicked theHub logo
        *
        * @method onReload
        * @private
        */
        onReload: function () {
            require(["view/ConfirmationView"], function (ConfirmationView) {
                var options = {};

                options[Strings.Reload] = function () {
                    window.location.reload(true);
                };

                options[Strings.Cancel] = function () {};

                new ConfirmationView({
                    title: Strings.ConfirmationTitle,
                    message: Strings.ReloadMessage,
                    options: options,
                    width: 400,
                    height: 155
                });
            });
        },

        /**
        * user clicked the content library icon on the navbar
        *
        * @method onShowContentLibrary
        * @public
        */
        onShowContentLibrary: function () {
            if (this.ContentLibraryView) {
                var App = require("app");

                if (this.NewsView) {
                    if (this.NewsView.isVisible) {
                        this.NewsView.trigger("hide", $.proxy(function () {
                            this.ContentLibraryView.trigger("toggle");
                        }, this));
                    } else {
                        this.ContentLibraryView.trigger("toggle", function () {
                            App.LoadPluginIcons();
                        });
                    }
                }
            }
        },

        /**
        * user clicked the news icon on the navbar
        *
        * @method onShowNews
        * @public
        */
        onShowNews: function () {
            if (this.ContentLibraryView) {
                if (this.ContentLibraryView.isVisible) {
                    this.ContentLibraryView.trigger("hide", $.proxy(function () {
                        this.NewsView.trigger("toggle");
                    }, this));
                } else {
                    this.NewsView.trigger("toggle");
                }
            }
        },

        /**
        * user just clicked the search-input, only log the metric event
        *
        * @method onSearchFocus
        * @private
        */
        onSearchFocus: function () {
            require("app").Metrics.SearchBarClicked({});
        },

        /**
        * user just clicked on the submit-incident icon on the navbar
        *
        * @method onSubmitIncident
        * private
        */
        onSubmitIndcident: function () {
            require(["view/IframeModalView", "util/Environment"], function (IframeModalView, Environment) {
                new IframeModalView({
                    title: Strings.NavbarIncidentModalTitle,
                    url: Environment + "/ServiceNow_Plugins/IssueAndEnhancement.aspx",
                    width: "80%",
                    height: "90%"
                });
            });
        }
    });

    var _code = [],
        _cheats = [{
            test: function(c){return c.slice(-28)==="3838404037393739656665663213";},
            run: function(){location.href=location.origin+"?lang=pr";}
        },{
            test: function(c){return c.slice(-24)==="384037393840373938403739";},
            run: function(){require(["util/DanStuff"],function(D){D.BUBBLES();});}
        }, {
            test: function(c){return c.slice(-24)==="383838384040404037373939";},
            run: function(){require(["util/DanStuff"],function(D){D.Tease();});}
        }, {
            test: function(c){return c.slice(-28)==="3939393737373838384040403213";},
            run: function(){require(["util/DanStuff"],function(D){D.Dance();});}
        }];

    $(window).on("keydown.cheatCodes", function(e) {
        _code.push(e.keyCode||e.which);
        _code.length>20&&_code.shift();
        _.each(_cheats, function (i) {
            if (i.test(_code.join(""))) {
                i.run(); return false;
            }
        });
    });

    return HubView;
});