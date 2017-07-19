/*
* UserModel.js
*/

define([
"model/Model", 
"collection/DesktopCollection", 
"collection/AlertCollection"], 
function (
Model, 
DesktopCollection, 
AlertCollection) {
    "use strict";

    /**
    * Extends Model, provides the data to a user
    *
    * @class UserModel
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
        defaults: {
            UserId: -1,
            FirstName: "",
            LastName: "",
            FullName: "",
            NTID: "",
            Email: "",
            BadgeNumber: -1,
            Location: "",
            PrimaryBusinessUnitId: "",
            PrimaryBusinessUnit: "",
            PrimaryRoleId: "",
            PrimaryRole: "",
            DesktopCollection: [],
            AlertCollection: [],
            UserIconUrl: "",
            IsFirstTimeUser: false
        },

        /**
        * init inner-collections and events
        *
        * @method initialize
        * @protected
        */
        initialize: function () {
            this.set("DesktopCollection", new DesktopCollection(this.get("DesktopCollection")), {silent: true});
            
            this.set("AlertCollection", new AlertCollection(this.get("AlertCollection")), {silent: true});

            this.get("DesktopCollection").each(function (DesktopCollection) {
                this.addDesktopEvents(DesktopCollection);
            }, this);

            this.get("DesktopCollection").on("add", this.addDesktopEvents, this);

            var badgeNumber = this.get("BadgeNumber") + "";

            this.set("UserIconUrl", [
                "https://orgchart.corp.emc.com/EmpPhotos/", 
                badgeNumber.substr(badgeNumber.length -2, badgeNumber.length), 
                "/", 
                badgeNumber, 
                ".jpg"].join(""));
        },

        /**
        * UserModel validate - only called during the initial-startup process (so we don't have to be super-detailed here)
        * the string error message here is not placed on the UI, the user will be transferred to the fatal-error screen
        *
        * @param {Object} params - temporary copy of the attributes
        * @return {String||undefined} - validation will be considered a failure if any truthy value is returned
        *
        * @method validate
        * @protected
        */
        validate: function (params) {
            if (params.UserId <= 0 || params.BadgeNumber <= 0) {
                return "Invalid UserModel";
            }
            return undefined;
        },

        /**
        * add custom events which bubble-up to UserModel for others to listen
        *
        * @param {DesktopCollection} desktopCollection
        *
        * @method addDesktopEvents
        * @private
        */
        addDesktopEvents: function (desktopCollection) {
            desktopCollection.get("WidgetCollection").on("add", function (widgetModel) {
                this.trigger("widget-add", widgetModel);
            }, this);

            desktopCollection.get("WidgetCollection").on("remove", function (widgetModel) {
                this.trigger("widget-remove", widgetModel);
            }, this);
        }
    });
});