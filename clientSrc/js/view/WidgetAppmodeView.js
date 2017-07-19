/*
* WidgetAppmodeView.js
*/

define(["require", "view/View", "jquery"], function (require, View, $) {
    "use strict";

    /**
    * Encapsulates all view logic for interacting with the AppMode template
    *
    * @class WidgetAppmodeView
    * @module WidgetAppmodeView
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
            "click .on-close-appmode": "onCloseAppmode",
            "click .on-deeplink": "onDeeplink",
            "click .on-help": "onHelp"
        },

        /**
        * initialize template and events
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.setElement(this.template("Appmode", this.model.attributes));

            if (!this.model.get("Alias")) {
                this.$(".appmode-title-initial").hide();
            }

            this.model.on("change:AppmodeTitle", this.onTitleChange, this);

            if (this.model.get("InstanceGuid")) {
                this.loadInstance();
            } else {
                this.loadTemporary(function () {
                    this.loadInstance();
                });
            }
        },

        /**
        * load a widget's appmode that already has an instance
        *
        * @method loadInstance
        * @private
        */
        loadInstance: function () {
            if (this.model.get("NoIframe") === false) {
                this.$(".widget-appmode-iframe").attr("src", this.model.getAppmodeUrl());
            } else {
                this.$(".widget-appmode-iframe").remove();

                require([this.model.get("Module")], $.proxy(function (Module) {
                    this.module = new Module({
                        model: this.model,
                        appmode: true,
                        el: this.$(".widget-appmode-height-set")
                    });
                }, this));
            }

            $("#content-body").append(this.$el);

            if (this.model.get("DeepLinkMode") === require("app").HubModel.get("DeepLinkEnum").Disabled) {
                this.$(".appmode-deeplink").hide();
            }

            if (!this.model.getHelpUrl()) {
                this.$(".appmode-help").hide();
            }

            this.$("[data-toggle='tooltip']").tooltip({
                trigger: "hover",
                container: "body"
            });
        },

        /**
        * save a widget that has no instance, then load appmode
        *
        * @method loadTemporary
        * @private
        */
        loadTemporary: function (callback) {
            var app = require("app");

            this.model.generateGuid();

            require(["util/Ajax", "view/ToastView", "i18n!nls/Hub"], $.proxy(function (Ajax, ToastView, Strings) {
                Ajax.SaveTemporaryWidget(app.HubView.getActiveDesktopModel().get("DesktopId"), this.model, function (success) {
                    if (success) {
                        callback.call(this);
                    } else {
                        new ToastView({
                            message: Strings.TemporaryAppmodeSaveFailure,
                            color: ToastView.prototype.ErrorColor,
                            icon: "fa fa-exclamation-triangle",
                            timer: false
                        });
                    }
                }, this);
            }, this));
        },

        /**
        * model callback when "AppmodeTitle" changes in value
        * note: will not change the title if the user set an alias
        *
        * @param {WidgetModel} model
        * @param {String} val - the new name
        *
        * @method onTitleChange
        * @private
        */
        onTitleChange: function (model, val) {
            var $title = model.get("Alias") ? this.$(".appmode-title-initial") : this.$(".appmode-title");

            $title.animate({opacity: 0}, {
                duration: 300,
                complete: function () {
                    $title.text(val);
                    $title.animate({opacity: 1}, {duration: 300});
                }
            });
        },

        /**
        * user just clicked the close-appmode button
        *
        * @method onCloseAppmode
        * @private
        */
        onCloseAppmode: function () {
            this.$("[data-toggle='tooltip']").tooltip("hide");
            this.model.off(null, null, this);
            this.$el.animate({opacity: 0}, {
                duration: 350,
                complete: $.proxy(function () {
                    this.remove();
                    require("app").Expiration.Start();
                }, this)
            });
        },

        /**
        * user just clicked the deeplink button
        *
        * @method onDeeplink
        * @private
        */
        onDeeplink: function () {
            var deepLink = require("app").HubModel.get("DeepLinkEnum"),
                mode = this.model.get("DeepLinkMode");

            if (mode === deepLink.NoSave) {
                this.noSaveDeepLink();
            } else if (mode === deepLink.WithSave) {
                this.withSaveDeepLink();
            }
        },

        /**
        * this widget does not need to save data, request for a hash and display it to the user
        *
        * @method noSaveDeepLink
        * @private
        */
        noSaveDeepLink: function () {
            if (this.deepLinkrequest) {
                return;
            }

            require(["util/Ajax", "view/ToastView", "app", "i18n!nls/Hub"], $.proxy(function (Ajax, ToastView, App, Strings) {
                this.deepLinkrequest = Ajax.GenerateDeepLink(this.model.get("Guid"), function (hash) {
                    this.deepLinkrequest = undefined;
                    
                    if (hash) {
                        var url = location.origin + "?dlh=" + hash;
                        new ToastView({
                            message: Strings.DeepLinkMessage + "<a href='" + url + "' target='_blank'>" + url + "</a>",
                            color: ToastView.prototype.InfoColor,
                            icon: "fa fa-exchange",
                            timer: false
                        });
                    } else {
                        new ToastView({
                            message: Strings.DeepLinkFailure,
                            color: ToastView.prototype.ErrorColor,
                            icon: "fa fa-exclamation-circle",
                            timer: false
                        });
                    }
                }, this);
            }, this));
        },

        /**
        * this widget needs to save data, message into the widget telling it to start it's deeplink process
        *
        * @method withSaveDeepLink
        * @private
        */
        withSaveDeepLink: function () {
            var $iframe = this.$(".widget-appmode-iframe");
            
            if ($iframe.length) {
                $iframe[0].contentWindow.postMessage(JSON.stringify({
                    event: "share",
                    environment: location.origin
                }), "*");
            }
        },

        /**
        * user clicked the help button
        *
        * @method onHelp
        * @private
        */
        onHelp: function () {
            var url = this.model.getHelpUrl();
            if (url) {
                require(["view/IframeModalView"], $.proxy(function (IframeModalView) {
                    new IframeModalView({
                        title: this.model.get("Name"),
                        url: url,
                        height: "90%",
                        width: "80%"
                    });
                }, this));
            }
        }
    });
});