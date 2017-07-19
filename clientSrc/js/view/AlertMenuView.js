/*
* AlertMenuView.js
*/

define(["require", "view/View", "i18n!nls/Hub", "jquery"], function (require, View, Strings, $) {
    "use strict";

    /**
    * controls the UI containing alerts
    *
    * @class AlertMenuView
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
            "click .on-manage-subscriptions": "onSubscriptions",
            "click .on-clear-list": "onClearAlerts",
            "click .on-view-all": "onViewAll",
            "click .on-view-alert": "onViewAlert",
            "click .on-dismiss-alert": "onDismiss"
        },

        /**
        * init template and handlers
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.$icon = params.$icon;

            this.$count = params.hubView.$("#hb-alert-count-txt");

            var $target = this.$("#alert-menu-body-inner");

            this.model.each(function (alertModel, index, collection) {
                this.renderItem(alertModel, $target, {});
            }, this);

            if (this.model.models.length === 0) {
                this.renderEmptyMessage();
            }

            this.updateCount();

            this.model.on("add", this.renderAlert, this);
            
            this.model.on("remove", this.onRemoveAlert, this);

            this.model.on("clear", this.onClearAlerts, this);
        },

        /**
        * render an alert model to the menu
        *
        * @param {AlertModel} alertModel
        * @param {jQuery} $target
        *
        * @method renderItem
        * @private
        */
        renderItem: function (alertModel, $target, params) {
            var $el = $(this.template("Alert-Item", alertModel.attributes));

            if (!params.add) {
                $el.appendTo($target);
            } else {
                $el.prependTo($target);
            }

            if (!alertModel.get("Url")) {
                $el.find(".on-view-alert").removeClass("on-view-alert");
            } else {
                $el.find(".on-view-alert").addClass("with-link");
            }

            if (alertModel.get("Status") === "N") {
                $el.addClass("hb-new-alert-item");
            }

            if (params.add) {
                this.updateCount();
            }

            $el.find(".hb-alert-item-icon").addClass("plugin" + alertModel.get("PluginId") + "-icon");

            $el.find("[data-toggle='tooltip']").tooltip({
                container: "body",
                show: true,
                trigger: "hover"
            });
        },

        /**
        * internally called to update the count of new alerts on the navbar
        *
        * @method updateCount
        * @private
        */
        updateCount: function () {
            var count = this.model.where({Status: "N"}).length;

            this.$count.parent().toggle(count > 0);
            
            this.$count.text(count > 99 ? "99+" : count);
        },

        /**
        * called from the hub view to display the help menu
        *
        * @param {Function} cb - callbacks to hubView to remove the global "hide" click handler
        *
        * @method show
        * @public
        */
        show: function (cb) {
            var offset = this.$icon.offset();

            this.close = function () {
                this.$el.animate({opacity: 0}, {
                    duration: 200,
                    complete: $.proxy(function () {
                        this.$el.hide();
                        cb();
                    }, this)
                });
            };

            this.$el.css({
                top: offset.top + this.$icon.height() + 15,
                left: offset.left - this.$el.width() + this.$icon.width()
            });

            this.$el.show().animate({opacity: 1}, {
                duration: 200
            });

            require("app").LoadPluginIcons();
        },

        /**
        * collection callback when a new alert is added
        *
        * @method addAlert
        * @private
        */
        renderAlert: function (alertModel, collection, params) {
            this.$(".hb-empty-alert-message").remove();
            this.renderItem(alertModel, this.$("#alert-menu-body-inner"), params);
        },

        /**
        * collection callback when an alert is removed
        *
        * @param {AlertModel} alertModel
        *
        * @method onRemoveAlert
        * @private
        */
        onRemoveAlert: function (alertModel) {
            this.$("hb-alert-item[data-alertid=" + alertModel.get("AlertId") + "]").remove();
            
            if (this.model.models.length === 0) {
                this.renderEmptyMessage();
            }
        },

        /**
        * renderes the empty-alerts message when there are no alerts in the collection
        *
        * @method renderEmptyMessage
        * @private
        */
        renderEmptyMessage: function () {
            this.$("#alert-menu-body-inner").append($("<div></div>", {
                addClass: "hb-empty-alert-message",
                text: Strings.EmptyAlertsMessage
            }));
        },

        /**
        * user clicked on the subscription link
        *
        * @method onSubscriptions
        * @private
        */
        onSubscriptions: function () {
            require(["view/IframeModalView", "app", "util/Environment"], 
            function (IframeModalView, App, Environment) {
                new IframeModalView({
                    title: Strings.AlertMenuManageSubscriptionsTitle,
                    url: Environment + "/AlertsManager.aspx?UserId=" + App.UserModel.get("UserId")
                });

                App.Metrics.ManageAlertsClicked({});
            });
        },

        /**
        * user clicked the view all link
        *
        * @method onViewAll
        * @private
        */
        onViewAll: function () {
            require(["view/IframeModalView", "app", "util/Environment"], 
            function (IframeModalView, App, Environment) {
                new IframeModalView({
                    title: Strings.AlertMenuViewAllTitle,
                    url: Environment + "/NotificationsList.aspx?client=true&UserId=" + App.UserModel.get("UserId")
                });

                App.Metrics.ViewAllAlertsClicked({});
            });
        },

        /**
        * user clicked an alert title
        * (this will not fire if there is no url on the alert model)
        *
        * @method onViewAlert
        * @private
        */
        onViewAlert: function (e) {
            var $alert = this.$(e.target).closest(".hb-alert-item"),
                alertId = $alert.data("alertid"),
                alertModel = this.model.where({AlertId: alertId}),
                app = require("app");

            if (alertModel.length) {
                alertModel[0].set("Status", "V");

                this.updateCount();

                var openMode = alertModel[0].get("LinkOpenMode"),
                    modelArgs = {
                        title: alertModel[0].get("Title"),
                        url: alertModel[0].get("Url")
                    };

                if (openMode === "modal") {
                    require(["view/IframeModalView"], function (IframeModalView) {
                        new IframeModalView(modelArgs);
                    });
                } else if (openMode === "appmode") {
                    require(["view/IframeAppmodeView"], function (IframeAppmodeView) {
                        new IframeAppmodeView(modelArgs);
                    });
                } else {
                    var win = window.open(alertModel[0].get("Url"), "_blank");
                    if (win) {
                        win.focus();
                    } else {
                        require(["util/Util"], function (Util) {
                            Util.NotifyPopupBlocker();
                        });
                    }
                }

                app.Metrics.NotificationIconClicked({});

            } else if (app.HubModel.get("Debug")) {
                console.warn("AlertMenuVew.onViewAlert() - AlertModel not found, id: %s", alertId);
            }
        },

        /**
        * user dismissed an alert
        *
        * @method onDismiss
        * @private
        */
        onDismiss: function (e) {
            var $alert = this.$(e.target).closest(".hb-alert-item"),
                alertId = $alert.data("alertid"),
                alertModel = this.model.where({AlertId: alertId}),
                app = require("app");

            if (alertModel.length) {
                $alert.find("[data-toggle='tooltip']").tooltip("hide");

                this.model.remove(alertModel[0]);

                $alert.remove();

                this.updateCount();

                require(["util/Ajax", "view/ToastView"], function (Ajax, ToastView) {
                    Ajax.DismissAlert(alertId, function (success) {
                        if (!success) {
                            new ToastView({
                                message: Strings.AlertSaveErrorMsg,
                                color: ToastView.prototype.ErrorColor,
                                icon: "fa fa-bell-slash",
                                timer: 0
                            });
                        }
                    });
                });

                app.Metrics.DismissAlertClicked({});
            } else if (app.HubModel.get("Debug")) {
                console.warn("AlertMenuView.onDismiss() - AlertModel not found, id: %s", alertId);
            }
        },

        /**
        * user clicked the clear alerts link
        *
        * @method onClearAlerts
        * @private
        */
        onClearAlerts: function () {
            if (this.model.models.length) {
                var app = require("app");
                
                this.model.reset();

                this.$(".hb-alert-item").remove();

                this.updateCount();

                this.renderEmptyMessage();

                require(["util/Ajax", "view/ToastView"], function (Ajax, ToastView) {
                    Ajax.DismissAllAlerts(function (success) {
                        if (!success) {
                            new ToastView({
                                message: Strings.AlertSaveErrorMsg,
                                color: ToastView.prototype.ErrorColor,
                                icon: "fa fa-bell-slash",
                                timer: 0
                            });
                        }
                    });
                });

                app.Metrics.DismissAlertClicked({});
            }
        }
    });
});