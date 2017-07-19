/*
* HubModel.js
*/

define(["model/Model"], function (Model) {
    "use strict";

    /**
    * All attributes relating to TheHub as an application
    *
    * @class HeartbeatModel
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
            Version: "",
            Debug: false,
            HeartbeatInterval: 120000,
            WidgetMarginX: 4,
            WidgetMarginY: 4,
            WidgetDimensionX: 200,
            WidgetDimensionY: 200,
            WidgetMinimumX: 1,
            WidgetMinimumY: 1,
            WidgetMaximumX: 1,
            WidgetMaximumY: 1,
            ExpirationTimeout: 28800000, // 8hr default
            NewsPageSize: 15,
            IsMaintenanceBreak: false,
            MetricsDB: "test",
            WikiWrapperUrl: "https://engineering.sites.emc.com/operationalprograms/thehub/SiteAssets/WikiPageWrapper.aspx?IsDlg=1&Name="
        },

        /**
        * HubModel validate - only called during the initial-startup process (so we don't have to be super-detailed here)
        * the string error message here is not placed on the UI, the user will be transferred to the fatal-error screen
        *
        * @param {Object} params - temporary copy of the attributes
        * @return {String||undefined} - validation will be considered a failure if any truthy value is returned
        *
        * @method validate
        * @protected
        */
        validate: function (params) {
            if (!params.Version || !params.WidgetDimensionX) {
                return "Invalid HubModel";
            }
            return undefined;
        }
    });
});