/*
* Messaging.js
*/

define(["jquery", "i18n!nls/Hub"], function ($, Strings) {
    "use strict";

    /*

        All window messages are listened to and processed here.

        Widgets should never attempt to call methods directly through window.parent,
        instead they should include Hub.js and use the public methods there to interact with TheHub

    */

    var debug,
        App,
        MessageActions = {

            /**
            * navigate a modal to ServiceNow and create an ESM ticket
            *
            * @param {String} url
            *
            * @method modal.createincident
            * @private
            * @module Messaging
            */
            "modal.createincident": function (data) {
                require(["view/IframeModalView", "util/Environment"], function (IframeModalView, Environment) {
                    var url = data.url;

                    if (url.indexOf("http") !== 0) {
                        url = Environment + url;
                    }

                    new IframeModalView({
                        title: Strings.CreateIncidentTitle,
                        url: url
                    });
                });
            },

            /**
            * open an iframe-modal
            *
            * @param {String} url
            * @param {String} Title
            * @param {String||Number} Width
            * @param {String||Number} Height
            * @param {Object} DeepLinkData
            * @param {String} GUID
            *
            * @method modal.custom
            * @private
            * @module Messaging
            */
            "modal.custom": function (data) {
                require(["view/IframeModalView", "util/Environment"], function (IframeModalView, Environment) {
                    var url = data.url;

                    if (url.indexOf("http") !== 0) {
                        url = Environment + url;
                    }

                    new IframeModalView({
                        title: data.options.Title || data.options.title || "",
                        url: url,
                        width: data.options.Width || data.options.width || undefined,
                        height: data.options.Height || data.options.height || undefined,
                        deepLinkData: data.options.DeepLinkData || data.options.deepLinkData || undefined,
                        guid: data.options.GUID || data.options.guid || undefined,
                        stacking: data.options.Stacking || data.options.stacking || undefined
                    });
                });
            },

            /**
            * spawn appmode pointing to the argued url
            *
            * @param {String} title
            * @param {String} url
            *
            * @method appmode
            * @private
            * @module Messaging
            */
            "appmode": function (data) {
                require(["view/IframeAppmodeView", "util/Environment"], function (IframeAppmodeView, Environment) {
                    var url = data.url;

                    if (url.indexOf("http") !== 0) {
                        url = Environment + url;
                    }

                    new IframeAppmodeView({
                        title: data.title,
                        url: url
                    });
                });
            },

            /**
            * spawns a widget by name to the current desktop
            *
            * @param {String} val - name of the widget
            *
            * @method spawnwidget.name
            * @private
            * @module Messaging
            */
            "spawnwidget.name": function (data) {
                var widget = App.WidgetCollection.where({Name: data.val});

                if (widget.length) {
                    App.HubView.onAddNewWidget(widget[0]);
                } else if (debug) {
                    console.warn("spawnwidget.name - cannot find widget by name: %s", data.val);
                }
            },

            /**
            * spawn a widget by guid to the current desktop
            *
            * @param {String} val - guid
            *
            * @method spawnwidget.guid
            * @private
            * @module Messaging
            */
            "spawnwidget.guid": function (data) {
                var widget = App.WidgetCollection.where({Guid: data.val});

                if (widget.length) {
                    App.HubView.onAddNewWidget(widget[0]);
                } else if (debug) {
                    console.warn("spawnwidget.guid - cannot find widget by guid: %s", data.val);
                }
            },

            /**
            * resize an existing widget on the user's desktop
            *
            * @param {String} guid - instance guid of the widget
            * @param {Number} X - requested width
            * @param {Number} Y - requested height
            *
            * @method widget.resize
            * @private
            * @module Messaging
            */
            "widget.resize": function (data) {
                function _logError() {
                    if (debug) {
                        console.warn.apply(null, arguments);
                    }
                }

                var desktop = App.HubView.getActiveDesktopModel();

                if (desktop) {
                    var widget = desktop.get("WidgetCollection").where({InstanceGuid: data.guid});
                    if (widget.length) {
                        var layout = widget[0].get("SizeCollection").where({
                            X: data.width, 
                            Y: data.height, 
                            Enabled: true
                        });

                        if (layout.length) {
                            widget[0].get("WidgetView")
                                .$(".size-switch[data-widgetsizex='" + data.width + "'][data-widgetsizey='" + data.height + "']")
                                .trigger("click");
                        } else {
                            _logError("argued widget size is not enabled in widget registration");
                        }
                    
                    } else {
                        _logError("unable to locate widget by instance guid: %s", data.guid);
                    }
                } else {
                    _logError("No active desktop found");
                }
            },

            /**
            * rename an existing widget on the user's desktop
            *
            * @param {String} guid - instance guid
            * @param {String} name - the new widget name
            *
            * @method widget.rename
            * @private
            * @module Messaging
            */
            "widget.rename": function (data) {
                function _logError() {
                    if (debug) {
                        console.warn.apply(null, arguments);
                    }
                }

                var desktop = App.HubView.getActiveDesktopModel();

                if (desktop) {
                    var widget = desktop.get("WidgetCollection").where({InstanceGuid: data.guid});
                    if (widget.length) {
                        widget[0].set({
                            Name: data.name,
                            AppmodeTitle: data.name
                        });
                    } else {
                        _logError("unable to locate widget by instance guid: %s", data.guid);
                    }
                } else {
                    _logError("No active desktop found");
                }
            },

            /**
            * open the content-library
            *
            * @method FSCL
            * @private
            * @module Messaging
            */
            "FSCL": function (data) {
                var app = require("app");
                app.HubView.ContentLibraryView.trigger("show");
                app.LoadPluginIcons();
            },

            /**
            * launch a model pointing to the configuration page of a wage
            *
            * @param {String} guid - instance guid
            *
            * @method configwidget
            * @private
            * @module Messaging
            */
            "configwidget": function (data) {
                require(["view/IframeModalView"], 
                    function (IframeModalView) {
                        var desktop = App.HubView.getActiveDesktopModel(),
                            widget = desktop.get("WidgetCollection").where({InstanceGuid: data.instanceGuid});

                        if (widget.length) {
                            new IframeModalView({
                                title: Strings.ConfigureWidgetModalTitle,
                                url: widget[0].getConfigUrl()
                            });
                        }
                    });
            },

            /**
            * open the livewire tab-thingy
            *
            * @method hubchat
            * @private
            * @module Messaging
            */
            "hubchat": function (data) {
                $("#livewire").addClass("show");
            },

            /**
            * close all popups
            *
            * @method closehubpopup
            * @private
            * @module Messaging
            */
            "closehubpopup": function (data) {
                $("#livewire, #devmenu").removeClass("show");
                $(".modal-close, .hub-modal-close.on-close").trigger("click");
            },

            /**
            * close appmode
            *
            * @method closeappmode
            * @private
            * @module Messaging
            */
            "closeappmode": function (data) {
                $(".on-close-appmode").trigger("click");
            },

            /**
            * refresh a widget's content iframe
            *
            * @param {String} instanceGuid
            *
            * @method widgetrefresh
            * @private
            * @module Messaging
            */
            "widgetrefresh": function (data) {
                var $widgetIframe = $(".gridster-widget[data-instanceguid=" + data.instanceGuid + "]").find("iframe");
                if ($widgetIframe.length) {
                    $widgetIframe.each(function () {
                        var $iframe = $(this),
                            src = $iframe.attr("src");

                        if (src && data.cfg) {
                            src = src.replace(/cfg=\d*/,"cfg=" + data.cfg);
                        }

                        $iframe.attr("src", src);
                    });

                    if (data.cfg) {
                        var desktop = require("app").HubView.getActiveDesktopModel();
                        if (desktop) {
                            var widgetModel = desktop.get("WidgetCollection").where({InstanceGuid: data.instanceGuid});
                            if (widgetModel.length) {
                                widgetModel[0].set("ConfigNumber", data.cfg);
                            } else if (debug) {
                                console.warn("widgetrefresh - widget model not found");
                            }
                        } else if (debug) {
                            console.warn("widgetrefresh - No active desktop");
                        }
                    }
                } else if (debug) {
                    console.warn("widgetrefresh - Widget Instance Guid not found: %s", data.instanceGuid);
                }
            },

            /**
            * toggle client-expiration on/off
            *
            * @param {Boolean} val - true: enabled, false: disabled
            *
            * @method expiration.enabled
            * @private
            * @module Messaging
            */
            "expiration.enabled": function (data) {
                App.Expiration[data.val ? "Start" : "Stop"]();
            },

            /**
            * Reset the client expiration timer
            *
            * @method expiration.reset
            * @private
            * @module Messaging
            */
            "expiration.reset": function (data) {
                App.Expiration.Reset();
            },

            /**
            * authenticate a widget, generate a one-time token for a widget to auth against outsystems
            *
            * @param {String} guid
            *
            * @method auth.generatetoken
            * @private
            * @module Messaging
            */
            "auth.generatetoken": function (data) {
                require(["util/Ajax", "util/Environment"], function (Ajax, Environment) {
                    Ajax.GenerateToken(function (token) {
                        if (token) {
                            $(".widget-appmode-iframe[src*='guid=" + data.guid + "']").each(function () {
                                this.contentWindow.postMessage(JSON.stringify({
                                    event: "auth.tokengenerated",
                                    ssoToken: token,
                                    domain: Environment
                                }), "*");
                            });
                        } else if (debug) {
                            console.error("auth.generatetoken - unable to retrieve token");
                        }
                    });
                });
            },

            /**
            * get the user profile
            *
            * @param {String} guid - responding iframe's guid
            *
            * @method auth.getuser
            * @private
            * @module Messaging
            */
            "auth.getuser": function (data) {
                require(["util/Ajax"], function (Ajax) {
                    Ajax.GetUserProfile(function (profile) {
                        if (profile) {
                            $("iframe[src*='guid=" + data.guid + "']").each(function () {
                                this.contentWindow.postMessage(JSON.stringify({
                                    event: "auth.userreturned",
                                    profile: profile
                                }), "*");
                            });
                        } else if (debug) {
                            console.error("auth.getuser - unable to retrieve profile data");
                        }
                    });
                });
            },

            /**
            * refresh appmode
            *
            * @param {String} instanceGuid
            *
            * @method appmoderefresh
            * @private
            * @module Messaging
            */
            "appmoderefresh": function (data) {
                if (data.instanceGuid) {
                    var $appmodeIframe = $(".widget-appmode-iframe[src*='" + data.instanceGuid + "']");
                    if ($appmodeIframe.length) {
                        $appmodeIframe.attr("src", $appmodeIframe.attr("src").replace(/cfg=\d*/, "cfg=" + data.cfg));
                    }
                } else if (debug) {
                    console.warn("Widget Instance Guid not found: %s", data.instanceGuid);
                }
            },

            /**
            * save incoming data, and spawn a modal with the link
            *
            * note: not liking this implementation, totally hacking around and re-using other components improperly
            * (the event handlers in ModalView takes care of copy/toast messages)
            *
            * @param {String} guid
            * @param {String} json
            *
            * @method modal.deeplink
            * @private
            * @module Messaging
            */
            "modal.deeplink": function (data) {
                require(["util/Ajax", "view/ToastView", "i18n!nls/Hub", "view/HtmlModalView"], 
                function (Ajax, ToastView, Strings, HtmlModalView) {

                    Ajax.GenerateDataDeepLink(data.guid, data.json, function (hash) {
                        if (hash) {
                            var url = location.origin + "?dlh=" + hash;

                            var $content = $(ToastView.prototype.template.call(ToastView.prototype, "Modal-Deeplink-Message", {
                                URL: url
                            }));

                            $content.find(".title-row").remove();

                            $content.removeAttr("style");

                            new HtmlModalView({
                                title: Strings.ModalDeepLinkTitle,
                                html: $content,
                                width: 670,
                                height: 108
                            });
                        } else {
                            new ToastView({
                                color: ToastView.prototype.ErrorColor,
                                message: Strings.DeepLinkFailure,
                                timer: false,
                                icon: "fa fa-exclamation-circle"
                            });
                        }
                    });

                });
            },

            /**
            * remove alerts
            *
            * @method alerts.clear
            * @private
            * @module Messaging
            */
            "alerts.clear": function (data) {
                require("app").HubView.alertMenuView.model.trigger("clear");
            },

            /**
            * refresh the desktop-menu
            *
            * @method refresh.desktopmenu
            * @private
            * @module Messaging
            */
            "refresh.desktopmenu": function (data) {
                require("app").HubView.desktopMenuView.trigger("refresh");
            },

            /**
            * display a toast message
            *
            * @param {String} message
            * @param {String} icon
            * @param {String} color
            * @param {Boolean||Number} timer
            *
            * @method toast
            * @private
            * @module Messaging
            */
            "toast": function (data) {
                if (typeof data.message === "string") {
                    require(["view/ToastView"], function (ToastView) {
                        new ToastView(data);
                    });
                } else if (debug) {
                    console.error("Messaging.toast - message is not of type 'string': %o", data);
                }
            },

            /**
            * refresh the news menu - called when an article is deleted
            *
            * @method refresh.news
            * @private
            * @module Messaging
            */
            "refresh.news": function (data) {
                require("app").HubView.NewsView.model.trigger("refresh");
            },

            /**
            * switch to the specified desktop, called from the shared-desktop menu
            *
            * @method switch-desktop
            * @private
            * @module Messaging
            */
            "switch-desktop": function (data) {
                var app = require("app"),
                    debug = app.HubModel.get("Debug"),
                    currentDesktop = app.UserModel.get("DesktopCollection").where({IsActive: true});

                if (!data.desktopid) {
                    if (debug) {
                        console.error("Messaging.switch-desktop(desktopid: %s) - invalid argument", data.desktopid);
                    }
                    return;
                }

                $(".on-close-appmode").trigger("click");

                if (!currentDesktop.length && debug) {
                    console.warn("Messaging.switch-desktop() - no active desktop found");
                }

                if (currentDesktop.length) {
                    currentDesktop[0].set("IsActive", false);
                }

                require(["util/Ajax", "view/DesktopView"], function (Ajax, DesktopView) {
                    Ajax.GetSharedDesktop(data.desktopid, function (desktopModel) {
                        desktopModel.set({
                            IsActive: true,
                            ReadOnly: true
                        });

                        $(".desktop-preview").remove();

                        new DesktopView({
                            model: desktopModel,
                            el: $("<div></div>", {
                                id: "desktop-" + desktopModel.get("DesktopId"),
                                addClass: "gridster-desktop desktop-preview"
                            }),
                            $gridster: $("#gridster-container-inner")
                        });

                        $("#desktop-name").text(Strings.SharedDesktopPreview + desktopModel.get("Name"));
                    });
                });
            },

            // called when the session-init iframe gets refreshed
            "auth.hubtoken": function (data) {
                // nothing is actually needed here, but we define the message callback anyways
                // as to not confuse any of the run-time with other messaging callbacks.
            },

            // called when the messenger needs to know the location's host
            "gethostname": function (data) {
                $("iframe[src*='guid=" + data.guid + "']").each(function () {
                    this.contentWindow.postMessage(JSON.stringify({
                        event: "gethost.response",
                        hostname: location.hostname
                    }), "*");
                });
            },

            // called when the messenger needs to know the backend api url
            "getapibaseurl": function (data) {
                require(["util/Environment"], function (Environment) {
                    $("iframe[src*='guid=" + data.guid + "']").each(function () {
                        this.contentWindow.postMessage(JSON.stringify({
                            event: "getapibaseurl.response",
                            baseurl: Environment
                        }), "*");
                    });
                });
            }
    };

    /**
    * entry point to process all window messages
    *
    * @method processMessage
    * @private
    */
    function processMessage(e) {
        var data;

        if (e.originalEvent.data) {
            try {
                data = JSON.parse(e.originalEvent.data);
            } catch (e) {
                data = undefined;
            } finally {
                if (data) {
                    if (debug) {
                        console.info("Received window message: %o", data);
                    }

                    if (typeof MessageActions[data.event] === "function") {
                        MessageActions[data.event](data);
                        require("app").Metrics.HubJS({
                            eventName: data.event,
                            //could use URL ctor and return .host - but certain browsers like IE don't support URL object 
                            eventOrigin: e.originalEvent.origin.substr(e.originalEvent.origin.indexOf('//') + 2)
                        });
                    } else if (debug) {
                        console.error("unknown window message, %o", data);
                    }
                } else if (debug) {
                    console.error("Received window message, failed to parse data");
                }
            }
        }
    }

    return {

        /**
        * begin listening to iframe messages 
        *
        * @method Start
        * @module Messaging
        * @public
        */
        Start: function () {
            App = require("app");
            debug = App.HubModel.get("Debug");
            $(window).on("message onmessage", processMessage);
        },

        /**
        * stop listening to iframe messages
        * ..not sure when this would be neccessary, but what's a Start() without a Stop()?
        *
        * @method Stop
        * @module Messaging
        * @public
        */
        Stop: function () {
            $(window).off("message").off("onmessage");
        }
    };
});