/*
* DevMenuView.js
*/

define(["view/View", "jquery", "util/Ajax"], function (View, $, Ajax) {
    "use strict";

    /**
    * quick methods for developers to force things
    *
    * @class DevMenuView
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
            "click #dev-force-heartbeat": "forceHeartbeat",
            "click #dev-remove-all": "removeAll",
            "click #dev-service-center": "serviceCenter",
            "click #dev-to-debug": "gotoDebug"
        },

        /**
        * init template
        *
        * @method initialize
        * @protected
        */
        initialize: function () {
            this.setElement($(this.template("Dev-Menu", {})));
            this.$el.appendTo($("#content-body"));
        },

        /**
        * forces a heartbeat to execute
        *
        * @method forceHeartbeat
        * @private
        */
        forceHeartbeat: function () {
            require("app").HeartBeat.process();
        },

        /**
        * removes all widgets from the desktop
        *
        * @method removeAll
        * @private
        */
        removeAll: function () {
            function onRemoveComplete() {
                if (++requestsComplete === count) {
                    desktopView.$el.find(".gs-w").each(function () {
                        desktopView.gridster.remove_widget($(this));
                    });
                }
            }

            var desktop = require("app").HubView.getActiveDesktopModel(),
                desktopView = require("app").HubView.getActiveDesktopView(),
                requestsComplete = 0;

            if (desktop && desktopView) {
                if (!desktop.get("ReadOnly")) {
                    var widgetCollection = desktop.get("WidgetCollection"),
                        count = widgetCollection.models.length;

                    for (var i = 0; i < count; i++) {
                        Ajax.RemoveWidget(widgetCollection.models[i].get("InstanceGuid"), onRemoveComplete);
                    }
                } else {
                    console.warn("silly developer, this desktop is readonly - you cannot remove widgets");
                }
            } else {
                console.warn("no active desktop... something is messed up... dang...");
            }
        },

        /**
        * open service center in a new window
        *
        * @method serviceCenter
        * @private
        */
        serviceCenter: function () {
            require(["util/Environment", "util/Util"], function (Environment, Util) {
                var win = window.open(Environment + "/ServiceCenter", "_blank");
                
                if (win) {
                    win.focus();
                } else {
                    Util.NotifyPopupBlocker();
                }
            });
        },

        /**
        * navigate to the /debug/ directory
        *
        * @method gotoDebug
        * @private
        */
        gotoDebug: function () {
            location.href = location.origin + "/debug/index.html";
        }
    });
});