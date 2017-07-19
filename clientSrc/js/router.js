/*
* router.js
*/

define([
    "require", 
    "backbone", 
    "i18n!nls/Hub", 
    "jquery",
    "underscore",
    "view/ExpirationView", 
    "util/Ajax",
    "view/View",
    "view/HubView",
    "util/Util",
    "util/AnimHelpers"], 
    function (require, 
        Backbone, 
        Strings, 
        $,
        _,
        ExpirationView, 
        Ajax, 
        View, 
        HubView, 
        Util, 
        AnimHelpers) {

    "use strict";

    /**
    * The router, or "App" is the heart of the entire application, it handles the hash-navigation,
    * it composes the HubView, HubModel, UserModel, WidgetCollection, ServiceCollection
    * Through the App, a developer should be able to get to any model or view within the entire application
    *
    * You can get the app at any time using: "require('app')"
    * eg: require("app").WidgetCollection.where({Name: "HubTV"});
    * eg: require("app").HubModel.get("Debug");
    * eg: require("app").HubView.getActiveDesktopModel().get("WidgetCollection")
    * eg: require("app").UserModel.get("BadgeNumber")
    * eg: require("app").HubView.getActiveDesktopModel().trigger("save");
    *
    * @class Router
    * @extends Backbone.Router
    * @public
    * @constructor
    * @module App
    */
    var _router = Backbone.Router.extend({

        /**
        * defines all hash-navigations, and their respective methods to call when triggered
        *
        * @property routes
        * @type Object
        * @private
        */
        routes: {
            home: "navToDesktop",
            fatalerror: "navToFatal",
            loading: "navToLoading",
            invalid: "navToInvalid",
            maintenance: "navToMaintenance",
            "!": "devError"
        },

        /**
        * defines a list of all possible body-classes
        *
        * @property bodyClass
        * @type String
        * @private
        */
        bodyClass: [
            "hub-ready",
            "initial-load",
            "invalid-browser", 
            "fatal-error",
            "maintenance"
        ].join(" "),

        // ==========================================================================================================
        // ===========================================LOAD PRECEDURES================================================
        // ==========================================================================================================

        /**
        * beginning of start-up procedures
        *   - first localize any string tokens in the critical render, 
        *   - check for a valid browser before moving on
        *
        * @method _startup
        * @private
        */
        _loaded: false,
        _startup: function (cb) {
            this._localizeDom(View.prototype.localize);

            _router._loaded = true;

            if (Util.IsValidBrowser()) {
                this._loadStartup(Util.ParseQueryString(location.href), cb);
            } else {
                _router.navigate("invalid", {trigger: true});
            }
        },

        /**
        * replace string tokens within critical-render elements,
        * warning: browser reflow nightmare.
        *
        * @method _localizeDom
        * @private
        */
        _localizeDom: function (localize) {
            $("#fatalerror").html(localize.call(null, $("#fatalerror").html(), Strings));
            $("#desktop").html(localize.call(null, $("#desktop").html(), Strings));
            $("#invalid").html(localize.call(null, $("#invalid").html(), Strings));
            $("#maintenance").html(localize.call(null, $("#maintenance").html(), Strings));
        },

        /**
        * retrieve hub/user models - begin application contruction
        *
        * @param {Object} params - query string parameters
        * @param {Function} cb - on complete callback
        *
        * @method _loadStartup
        * @private
        */
        _loadStartup: function (params, cb) {
            this._initSession(params, $.proxy(function (token, userId) {
                this._loadAppModels(token, userId, params, cb);
            }, this));
        },

        /**
        * go to an SSO-outsystems page, to init the OS-session
        *
        * @param {Object} params - url parameters, possibly with EmployeeID acting as a backend override
        * @param {Function} cb - callback when complete
        *
        * @method _initSession
        * @private
        */
        _initSession: function (params, cb) {
            require(["util/Environment"], $.proxy(function (Environment) {

                // no environment url?
                if (!Environment) {
                    var href = location.href;
                    // did the user skip the server logic? (where we get the environment cookie)
                    if (href.indexOf(".html")) {
                        var query = href.indexOf("?") !== -1 ? href.substr(href.indexOf("?"), href.length) : "";
                        location.href = location.origin + query;
                    } else {
                        // dead-end :(
                        _router.navigate("fatalerror", {trigger: true});
                    }
                    return;
                }

                // if we don't get a message within 10 seconds - display a friendly message
                var slowTimeout = setTimeout(function () {
                    $("#loading-slow-message").text(Strings.SlowLoadingMessage).animate({opacity: 1}, {
                        duration: 500
                    });
                }, 10000);

                // if we don't get a message within 30 seconds - consider it a timeout failure
                var timeout = setTimeout($.proxy(function () {
                    $(window).off("message").off("onmessage");

                    console.error("SSO Authentication timeout.");

                    this.navigate("fatalerror", {trigger: true});
                }, this), 30000);

                // listen for messages coming from our SSO/Session iframe, with a token and userId
                $(window).on("message onmessage", $.proxy(function (e) {
                    var data;

                    try {
                        data = JSON.parse(e.originalEvent.data);
                    } catch (e) {
                        data = undefined;
                    } finally {
                        if (data && data.event && data.event === "auth.hubtoken") {
                            $(window).off(e);

                            clearTimeout(timeout);
                            clearTimeout(slowTimeout);

                            if (data.token) {
                                cb(data.token, data.userId);
                            } else {
                                console.error("Session failed to initialize, message: %o", data);
                                this.navigate("fatalerror", {trigger: true});
                            }
                        } else if (data && data.event && data.event === "login.redirect") {
                            $(window).off(e);
                            window.location = Environment + "/ClientSession/LoginInit.aspx?target=" + btoa(window.location.href);
                        }
                    }
                }, this));

                // add the iframe to the DOM, and begin the process
                var $sessionFrame = $("<iframe></iframe>", {
                    id: "session-init",
                    src: Environment + "/ClientSession/InitSsoJwt.aspx"
                }).appendTo("body");

                // refresh said iframe every hour, to ensure our cookies stay tasty
                setInterval($.proxy(function () {
                    this.attr("src", this.attr("src"));
                }, $sessionFrame), 3600000);

            }, this));
        },

        /**
        * called after the outsystems session has been initialized
        * load the Hub/User models
        *
        * @param {String} token
        * @param {Number} userId
        * @param {Object} params - url arguments
        * @param {Function} onComplete
        *
        * @method _loadAppModels
        * @private
        */
        _loadAppModels: function (token, userId, params, onComplete) {
            Ajax.GetStartUp(token, userId, function (HubModel, UserModel) {
                
                this._loaded = true;

                if (HubModel && HubModel.isValid() && UserModel && UserModel.isValid()) {
                    
                    this.HubModel = HubModel;

                    this.UserModel = UserModel;

                    _router.Metrics.UserLogin({
                        isNew: UserModel.get("IsFirstTimeUser")
                    });

                    if (HubModel.get("IsMaintenanceBreak")) {
                        this.navigate("maintenance", {trigger: true, replace: true});
                        return;
                    }

                    if (params.debug !== undefined) {
                        HubModel.set("Debug", Util.ParseBool(params.debug));
                    }

                    define("debug", [], HubModel.get("Debug"));

                    // immediately "load" the debug "module" for all contexts moving forward
                    require(["debug"], $.proxy(function (debug) {
                        if (params.newuser !== undefined) {
                            UserModel.set("IsFirstTimeUser", Util.ParseBool(params.newuser));
                        }

                        if (debug) {
                            console.info("Debug Mode Enabled");
                        }

                        this.HubView = new HubView({
                            model: {
                                HubModel: HubModel,
                                UserModel: UserModel
                            },
                            el: $("#desktop"),
                            query: params
                        });

                        this._loadCollections(Ajax, UserModel);

                        this.HeartBeat.Start();
                        
                        this.Expiration.Start();

                        onComplete();
                    }, this));

                } else {

                    this.navigate("fatalerror", { trigger: true });

                }

            }, this);
        },

        /**
        * load widget/service collections,
        * not needed for the main start-up process, but need to get this going as soon as possible,
        * widgetCollection is the largest/longest request we have
        *
        * @param {Object} Ajax
        * @param {UserModel} UserModel
        *
        * @method _loadCollections
        * @private
        */
        _loadCollections: function (Ajax, UserModel) {
            Ajax.GetContentLibraryWidgets(function (WidgetCollection) {
                if (WidgetCollection) {
                    this.WidgetCollection = WidgetCollection;
                    this.HubView.trigger("widget-load", WidgetCollection);
                } else if (this.HubModel.get("Debug")) {
                    console.error("Invalid WidgetCollection");
                }
            }, this);

            Ajax.GetServices(function (ServiceCollection) {
                if (ServiceCollection) {
                    this.ServiceCollection = ServiceCollection;
                } else if (this.HubModel.get("Debug")) {
                    console.error("Invalid ServiceCollection");
                }
            }, this);
        },

        // ==========================================================================================================
        // ===========================================NAVIGATIONS====================================================
        // ==========================================================================================================

        /**
        * go to the last-used desktop
        *
        * @method navToDesktop
        * @private
        */
        navToDesktop: function () {
            if (this._loaded === false) {
                this._startup(function () {
                    AnimHelpers.LoadingPageOut(function () {
                        $("body").removeClass(_router.bodyClass).addClass("hub-ready");
                        _router.HubView.trigger("load-complete");
                    });
                });
            } else {
                // TODO... already loaded, toggle current page
            }
        },

        /**
        * go to the fatal-error screen
        * note: this will check if we attempted to load yet (if the user refreshed on the fatalerror hash)
        *       if so, re-navigate to "home" and try again.
        *
        * @method navToFatal
        * @private
        */
        navToFatal: function () {
            if (this._loaded === false) {
                _router.navigate("home", {trigger: true, replace: true});
            } else {
                _router.HeartBeat.Stop();

                $(".hub-page").hide();

                $(".hub-page[data-page='fatal']").show();

                $("body").removeClass(_router.bodyClass).addClass("fatal-error");
            }
        },

        /**
        * for testing/dev purposes only - brings the initial-loading screen up
        *
        * @method navToLoading
        * @private
        */
        navToLoading: function () {
            $(".hub-page").hide();

            $(".hub-page[data-page='loading']").show();

            $("body").removeClass(_router.bodyClass).addClass("initial-load");
        },

        /**
        * for testing/dev purposes only - brings up the invalid-browser screen
        *
        * @method navToInvalid
        * @private
        */
        navToInvalid: function () {
            if (this._loaded === false) {
                _router.navigate("home", {trigger: true, replace: true});
            } else {
                _router.HeartBeat.Stop();

                $(".hub-page").hide();

                $(".hub-page[data-page='invalid']").show();

                $("body").removeClass(_router.bodyClass).addClass("invalid-browser");
            }
        },

        /**
        * when the site property flag "IsMaintenanceBreak" is true, or becomes true through the HeartBeat, this 
        * navigation will be triggered, landing the user on a "come back later" page
        *
        * @method navToMaintenance
        * @private
        */
        navToMaintenance: function () {
            if (this._loaded === false) {
                _router.navigate("home", {trigger: true, replace: true});
            } else {
                _router.HeartBeat.Stop();

                $(".hub-page").hide();

                $(".hub-page[data-page='maintenance']").show();

                $("body").removeClass(_router.bodyClass).addClass("maintenance");
            }
        },

        /**
        * stops silly developers from doing href="#!" - which is incompatible here, and is bad-practice
        * if you are reading this, try doing href='javascript:;' instead.
        *
        * @method devError
        * @private
        */
        devError: function () {
            if (_router.HubModel.get("Debug")) {
                $("body").html("<h2>Hey sloppy developer, you just triggered a '#!' hash navigation - ya know thats bad practice now-a-days...</h2>");
            }
        },


        // ==========================================================================================================
        // ===========================================APPLICATION METHODS============================================
        // ==========================================================================================================


        /**
        * sub-module for controlling the application's heartbeat
        * The heartbeat provides updates for client and server
        * Alerts, News, maintenance flagging, etc...
        *
        * @submodule HeatBeat
        * @public
        */
        HeartBeat: {

            /**
            * determine if the TheHub is on maintence break
            *
            * @param {HeartbeatModel} HeartbeatModel
            * @return {boolean} returns true if we don't need to process any more heartbeat actions
            *
            * @method _processMaintenance
            * @submodule HeartBeat
            * @private
            */
            _processMaintenance: function (HeartbeatModel) {
                var stopProcess = false;

                if (HeartbeatModel.get("IsMaintenanceBreak")) {
                    require(["view/ConfirmationView"], function (ConfirmationView) {
                        var options = {};

                        options[Strings.MaintenanceKeepWorking] = function () {};

                        options[Strings.MaintenanceTakeABreak] = function () {
                            _router.navigate("maintenance", {trigger: true, replace: false});
                            _router.HeartBeat.Stop();
                        };

                        new ConfirmationView({
                            title: Strings.MaintenanceTitle,
                            message: Strings.MaintenanceMessage,
                            options: options
                        });
                    });

                    stopProcess = true;
                }

                return stopProcess;
            },

            /**
            * process new alerts
            *
            * @param {HeartbeatModel} HeartbeatModel
            *
            * @method _processAlerts
            * @submodule HeartBeat
            * @private
            */
            _processAlerts: function (HeartbeatModel) {
                var userAlerts = _router.UserModel.get("AlertCollection");

                HeartbeatModel.get("Alerts").each(function (alertModel, index, collection) {
                    var existing = userAlerts.where({AlertId: alertModel.get("AlertId")});
                    if (existing.length === 0) {
                        userAlerts.add(alertModel);
                    }
                });
            },

            /**
            * process new news articles
            *
            * @param {HeartbeatModel} HeartbeatModel
            *
            * @method _processNews
            * @submodule HeartBeat
            * @private
            */
            _processNews: function (HeartbeatModel) {
                var userNews = _router.HubView.NewsView.model;
                HeartbeatModel.get("News").each(function (hbChannel) {
                    var userChannel = userNews.where({ChannelId: hbChannel.get("ChannelId")});
                    if (userChannel.length) {
                        hbChannel.get("ArticleCollection").each(function (hbArticle) {
                            var article = userChannel[0].get("ArticleCollection").where({ArticleId: hbArticle.get("ArticleId")});

                            if (!article.length) {
                                userChannel[0].get("ArticleCollection").add(hbArticle);
                            }
                        });
                    }
                });
            },

            /**
            * if a user sits on the hub with a broadcast message visible, and waits long enough for
            * a heartbeat to come back with the same messages, this array storing their ID's prevents duplicate
            * messages from being seen
            *
            * @property seenBroadcasts
            * @type Array
            * @private
            */
            seenBroadcasts: [],

            /**
            * process new broadcast messages
            *
            * @param {HeartbeatModel} HeartbeatModel
            *
            * @method _processBroadcasts
            * @submodule HeartBeat
            * @private
            */
            _processBroadcasts: function (HeartbeatModel) {
                var messages = HeartbeatModel.get("Broadcasts");

                if (messages.length) {
                    require(["view/ConfirmationView"], function (ConfirmationView) {
                        var message = [],
                            options = {},
                            dismissIdList = [];

                        HeartbeatModel.get("Broadcasts").each(function (msg) {
                            if (_router.HeartBeat.seenBroadcasts.indexOf(msg.get("Id")) === -1) {
                                message.push(View.prototype.template("BroadcastMessage", msg.attributes));
                                dismissIdList.push(msg.get("Id"));
                                _router.HeartBeat.seenBroadcasts.push(msg.get("Id"));
                            }
                        });

                        if (message.length) {
                            options[Strings.BroadcastMessagingConfirm] = function () {
                                Ajax.DismissBroadcastMessages(dismissIdList, function (success) {
                                    if (_router.HubModel.get("Debug")) {
                                        console.info("%s dismissed broadcast messages", success ? "Successfully" : "Failed to");
                                    }
                                });
                            };

                            new ConfirmationView({
                                title: Strings.BroadcastMessagingTitle,
                                message: message.join("<br/>"),
                                options: options,
                                hideCloseIcon: true
                            });
                        }
                    });
                }
            },

            /**
            * internally called to begin, and process the heartbeat,
            * if there is a maintenaince - does not process alerts/news
            *
            * @method process
            * @submodule HeartBeat
            * @private
            */
            process: function () {
                var postData = {
                    UserId: _router.UserModel.get("UserId"),
                    AlertIdList: _router.UserModel.get("AlertCollection").getIdList(),
                    ArticleIdList: _router.HubView.NewsView.model.getIdList()
                };

                Ajax.HeartBeat(postData, function (HeartbeatModel) {
                    var debug = _router.HubModel.get("Debug");

                    if (debug) {
                        console.log("heartbeat update: %o", HeartbeatModel);
                    }

                    if (!HeartbeatModel) {
                        if (debug) {
                            console.warn("Invalid HeartbeatModel");
                        }
                        return;
                    }

                    if (_router.HeartBeat._processMaintenance(HeartbeatModel)) {
                        return;
                    }

                    _router.HeartBeat._processAlerts(HeartbeatModel);

                    _router.HeartBeat._processNews(HeartbeatModel);

                    _router.HeartBeat._processBroadcasts(HeartbeatModel);
                });
            },

            /**
            * the setInterval handle property
            *
            * @property timer
            * @type Integer
            * @submodule HeartBeat
            * @private
            */
            timer: null,

            /**
            * start the heartbeat
            *
            * @method Start
            * @submodule HeartBeat
            * @public
            */
            Start: function () {
                if (!_router.HeartBeat.timer) {
                    _router.HeartBeat.timer = setInterval(_router.HeartBeat.process, _router.HubModel.get("HeartbeatInterval"));
                }
            },

            /**
            * stop/pause the heartbeat
            *
            * @method Stop
            * @submodule HeartBeat
            * @public
            */
            Stop: function () {
                if (_router.HeartBeat.timer) {
                    clearInterval(_router.HeartBeat.timer);
                    _router.HeartBeat.timer = null;
                }
            }
        },

        /**
        * sub-module controlling client-expiration
        *
        * @submodule Expiration
        * @public
        */
        Expiration: {

            /**
            * the setTimout handle property
            *
            * @property timer
            * @type Integer
            * @submodule Expiration
            * @private
            */
            timer: null,

            /**
            * start the expiration timer
            *
            * @method Start
            * @submodule Expiration
            * @public
            */
            Start: function () {
                if (!_router.Expiration.timer) {
                    setTimeout(_router.Expiration.Execute, _router.HubModel.get("ExpirationTimeout"));
                }
            },

            /**
            * stop the expiration timer
            *
            * @method Stop
            * @submodule Expiration
            * @public
            */
            Stop: function () {
                if (_router.Expiration.timer) {
                    clearTimeout(_router.Expiration.timer);

                    _router.Expiration.timer = null;

                    _router.HeartBeat.Stop();
                    
                    require(["util/Messaging"], function (Messaging) {
                        Messaging.Stop();
                    });
                }
            },

            /**
            * reset the expiration timeout
            *
            * @method Reset
            * @submodule Expiration
            * @public
            */
            Reset: function () {
                if (_router.Expiration.timer) {
                    clearTimeout(_router.Expiration.timer);
                    _router.Expiration.timer = null;
                }
                _router.Expiration.Start();
            },

            /**
            * display the expiration message
            *
            * @method Execute
            * @submodule Expiration
            * @public
            */
            Execute: function () {
                _router.Expiration.timer = null;
                if (!_router.Expiration.ExpirationView) {
                    _router.Expiration.ExpirationView = new ExpirationView();
                }
            }
        },

        /**
        * sub-module for logging user metrics
        *
        * @submodule Metrics
        * @public
        */
        Metrics: {

            /**
            * user logged in
            *
            * @method UserLogin
            * @submodule Metrics
            * @public
            */
            UserLogin: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "User_Login"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user added a widget
            *
            * @method WidgetAddToDesktop
            * @submodule Metrics
            * @public
            */
            WidgetAddToDesktop: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Widget_AddToDesktop"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user removed a widget
            *
            * @method WidgetRemove
            * @submodule Metrics
            * @public
            */
            WidgetRemove: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Widget_Remove"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user resized a widget
            *
            * @method WidgetResized
            * @submodule Metrics
            * @public
            */
            WidgetResized: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Widget_Resize"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user laucned widget appmode
            *
            * @method WidgetAppmodeViewed
            * @submodule Metrics
            * @public
            */
            WidgetAppmodeViewed: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Widget_AppMode"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user focused on the search bar
            *
            * @method SearchBarClicked
            * @submodule Metrics
            * @public
            */
            SearchBarClicked: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_Search"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user launched a service
            *
            * @method ServiceClicked
            * @submodule Metrics
            * @public
            */
            ServiceClicked: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_Service"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user viewed an alert
            *
            * @method NotificationIconClicked
            * @submodule Metrics
            * @public
            */
            NotificationIconClicked: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_ViewAlerts"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user clicked on manage alerts
            *
            * @method ManageAlertsClicked
            * @submodule Metrics
            * @public
            */
            ManageAlertsClicked: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_ManageAlerts"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user viewed all alerts
            *
            * @method ViewAllAlertsClicked
            * @submodule Metrics
            * @public
            */
            ViewAllAlertsClicked: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_ViewAllAlerts"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user dismissed an alert
            *
            * @method DismissAlertClicked
            * @submodule Metrics
            * @public
            */
            DismissAlertClicked: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_DismissAlert"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user viewed all services
            *
            * @method ViewAllServicesClicked
            * @submodule Metrics
            * @public
            */
            ViewAllServicesClicked: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_ViewAllServices"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user clicked on my info
            *
            * @method MyInfoClicked
            * @submodule Metrics
            * @public
            */
            MyInfoClicked: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_MyInfo"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user opened the content library
            *
            * @method ContentLibraryClicked
            * @submodule Metrics
            * @public
            */
            ContentLibraryClicked: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_ContentLibraryOpen"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user closed the content library
            *
            * @method ContentLibraryClosed
            * @submodule Metrics
            * @public
            */
            ContentLibraryClosed: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_ContentLibraryClose"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user clicked on the help menu
            *
            * @method HelpClicked
            * @submodule Metrics
            * @public
            */
            HelpClicked: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_Help"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * user searched the content library
            *
            * @method ContentLibrarySearch
            * @submodule Metrics
            * @public
            */
            ContentLibrarySearch: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "Click_ContentLibrarySearch"
                }, args), _router.Metrics._onComplete, _router);
            },

           /**
           * deeplink params in main url during initialization
           *
           * @method DeepLinkHit
           * @submodule Metrics
           * @public
           */
            DeepLinkHit: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "DeepLink_Hit"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * log a HubJS metric
            *
            * @param {String} origin
            * @param {String} eventName
            *
            * @method HubJS
            * @submodule Metrics
            * @public
            */
            HubJS: function (args) {
                Ajax.FireMetricEvent(_.extend({
                    actionType: "HubJS"
                }, args), _router.Metrics._onComplete, _router);
            },

            /**
            * callback when any metric request comes back
            *
            * @method _onComplete
            * @submodule Metrics
            * @private
            */
            _onComplete: function () {
                // TODO: handle request callback
            }
        },

        /**
        * retrieve the plugin-icon stylesheet 
        * (I don't like this... outsystems doesn't make it easy)
        *
        * @method LoadPluginIcons
        * @public
        */
        _iconsLoaded: false,
        LoadPluginIcons: function () {
            if (!this._iconsLoaded) {
                Ajax.GetPluginStylesheet(function (stylesheet) {
                    if (stylesheet) {
                        $("<style></style>", {
                            id: "plugin-icon",
                            type: "text/css",
                            text: stylesheet
                        }).appendTo("head");

                        this.WidgetCollection.each(function (widgetModel) {
                            widgetModel.set("Icon", "plugin" + widgetModel.get("PluginId") + "-icon");
                        });
                    } else if (_router.HubModel.get("Debug")) {
                        console.error("Router.LoadPluginIcons() - failed");
                    }
                }, this);

                this._iconsLoaded = true;
            }
        }
    });

    return _router = new _router();
});