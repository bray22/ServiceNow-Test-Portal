/*
* DesktopModel.js
*/

define([
"model/Model", 
"collection/WidgetCollection", 
"model/WidgetLayoutModel"], 
function (
Model, 
WidgetCollection,
WidgetLayoutModel) {

    "use strict";

    /**
    * defines all attributes related to a desktop
    *
    * @class DesktopModel
    * @constructor
    * @extends Model
    * @namespace model
    * @public
    */
    return Model.extend({

        /**
        * defines default null-values for all model attributes
        *
        * @return {Object}
        *
        * @method defaults
        * @protected
        */
        defaults: function () {
            return {
                DesktopId: -1,
                Name: "",
                Group: "",
                IsShared: false,
                IsActive: false,
                IsOwner: true,
                ReadOnly: false,
                WidgetCollection: [],
                Loaded: false // not from server, determines if lazy-loaded widget data have been downloaded yet
            };
        },

        /**
        * initialize inner collection
        *
        * @method initialize
        * @protected
        */
        initialize: function () {
            this.set("WidgetCollection", new WidgetCollection(this.get("WidgetCollection")), {silent: true});

            this.on("save", this.save, this);

            this.get("WidgetCollection").on("remove", this.onRemoveWidget, this);
            
            this.get("WidgetCollection").on("update", this.save, this);

            if (this.get("IsActive")) {
                this.set("Loaded", true, {silent: true});
            }
        },

        /**
        * inactive desktops during client boot-up does not recieve widget data (payload optimization)
        * these desktops will only load widgets when its time to switch to them
        *
        * @param {Function} onComplete
        * @param {Object} context
        * 
        * @method loadWidgets
        * @public
        */
        loadWidgets: function (onComplete, context) {
            require(["util/Ajax"], $.proxy(function (Ajax) {
                Ajax.GetWidgetCollection(this.get("DesktopId"), function (widgetData) {
                    var success = widgetData !== null;

                    if (widgetData) {
                        this.get("WidgetCollection").reset(widgetData);
                        this.set("Loaded", true, {silent: true});
                    }

                    onComplete.call(context || window, success);
                }, this);
            }, this));
        },

        /**
        * this is used for saving - which is a trimmed down model with only the values the server cares about
        *
        * @return {Object}
        *
        * @method serialize
        * @public
        */
        serialize: function () {
            return {
                DesktopId: this.get("DesktopId"),
                UserId: require("app").UserModel.get("UserId"), // TODO: possibly problematic with shared desktops
                WidgetCollection: this.get("WidgetCollection").serialize()
            };
        },

        /**
        * overriden from backbone to forward save to Ajax.js and automate toast error messages
        *
        * @param {Function} onComplete
        *
        * @method save
        * @protected
        */
        save: function (onComplete) {
            require(["app", "util/Ajax", "view/ToastView", "i18n!nls/Hub", "util/Util"], $.proxy(function (App, Ajax, Toast, Strings, Util) {
                
                Ajax.SaveDesktopContent(this, function (success) {
                    success = Util.ParseBool(success);

                    if (success) {
                        if (App.HubModel.get("Debug")) {
                            console.log("Successfully saved desktop, id: %s", this.get("DesktopId"));
                        }

                        if (typeof onComplete === "function") {
                            onComplete(success);
                        }
                    } else if (require("app").HubModel.get("Debug")) {
                        console.error("Failed to save desktop contents");
                    }
                }, this);

            }, this));
        },

        /**
        * event handler to the remove callback, 
        * removes the widget server side, then saves the desktop (to persist the new widget positions)
        *
        * @param {WidgetModel} widgetModel
        *
        * @method onRemoveWidget
        * @private
        */
        onRemoveWidget: function (widgetModel) {
            require(["util/Ajax"], $.proxy(function (Ajax) {
                Ajax.RemoveWidget(widgetModel.get("InstanceGuid"), function (success) {
                    this.get("WidgetCollection").trigger("evaluate-positions");
                }, this);
            }, this));
        }
    });
});