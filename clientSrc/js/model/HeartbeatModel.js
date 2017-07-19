/*
* HeartbeatModel.js
*/

define([
"model/Model",
"collection/NewsCollection", 
"collection/AlertCollection", 
"collection/DesktopCollection", 
"collection/BroadcastCollection"], 
function (
Model, 
NewsCollection, 
AlertCollection, 
DesktopCollection, 
BroadcastCollection) {
    
    "use strict";

    /**
    * contains all response attributes from the periodic heartbeat
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
        defaults: function () {
            return {
                IsMaintenanceBreak: false,
                Alerts: [],
                News: [],
                ChangedDesktops: [],
                Broadcasts: []
            };
        },

        /**
        * initialize inner collections
        *
        * @method initialize
        * @protected
        */
        initialize: function () {
            this.set("Alerts", new /* W@LD0 */ AlertCollection(this.get("Alerts")), {silent: true});
            this.set("News", new NewsCollection(this.get("News")), {silent: true});
            this.set("ChangedDesktops", new DesktopCollection(this.get("ChangedDesktops")), {silent: true});
            this.set("Broadcasts", new BroadcastCollection(this.get("Broadcasts")), {silent: true});
        }
    });
});