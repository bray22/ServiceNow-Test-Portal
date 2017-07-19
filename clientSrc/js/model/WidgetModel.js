/*
* WidgetModel.js
*/

define([
"model/Model", 
"model/SizeModel", 
"collection/LayoutCollection", 
"collection/SizeCollection", 
"util/Environment", 
"model/WidgetLayoutModel", 
"underscore"],
function (
Model, 
SizeModel, 
LayoutCollection, 
SizeCollection, 
Environment, 
WidgetLayoutModel, 
_) {
        
    "use strict";

    /**
    * Extends Model, and defines all information and flags used by a widget
    *
    * @class WidgetModel
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
                PluginId: -1,
                ApplicationId: -1,
                Name: "",
                Alias: "",
                WidgetTitle: "", // not from server
                AppmodeTitle: "", // not from server
                WidgetUrl: "",
                ConfigUrl: "",
                HelpUrl: "",
                ImageUrl: "",
                Description: "",
                Guid: "",
                InstanceGuid: "",
                ConfigNumber: 0,
                PopularityRank: 0,
                AuthorName: "",
                AuthorEmail:"",
                Version: "",
                ReloadOnResize: true,
                NoIframe: false,
                UseDefaultHeader: true,
                ConfigReload: false,
                DeepLinkMode: 1,
                OpenConfig: false,
                Module: "",
                ModuleArgs: "",
                Tags: [],
                DefaultSize: new SizeModel(),
                ActiveLayout: null, // not from server
                SizeCollection: [],
                LayoutCollection: [],
                RoleTags: [],
                BusinessUnitTags: []
            };
        },

        /**
        * convert arrays into backbone collections
        *
        * @method initialize
        * @protected
        */
        initialize: function () {
            var setArgs = {silent: true, validate: false};

            // init inner-models/collections
            this.set("DefaultSize", new SizeModel(this.get("DefaultSize")), setArgs);
            this.set("SizeCollection", new SizeCollection(this.get("SizeCollection")), setArgs);
            this.set("LayoutCollection", new LayoutCollection(this.get("LayoutCollection")), setArgs);

            // fix up the registration slop..
            this.set("HelpUrl", this.get("HelpUrl").trim(), setArgs);
            this.set("Alias", this.get("Alias").trim(), setArgs);
            this.set("Name", this.get("Name").trim(), setArgs);

            // set client-only attributes
            this.set("WidgetTitle", this.get("Alias") || this.get("Name"), setArgs);
            this.set("AppmodeTitle", this.get("Alias") || this.get("Name"), setArgs);
            this.set("AppmodeTitleInitial", this.get("Name"), setArgs);

            // clean urls and check if they need a hostname
            this.set("ImageUrl", this.get("ImageUrl").trim(), {silent: true});
            if (this.get("ImageUrl") && this.get("ImageUrl").indexOf("http") !== 0) {
                this.set("ImageUrl", Environment + this.get("ImageUrl"), setArgs);
            }

            this.set("WidgetUrl", this.get("WidgetUrl").trim(), {silent: true});
            if (this.get("WidgetUrl") && this.get("WidgetUrl").indexOf("http") !== 0) {
                this.set("WidgetUrl", Environment + this.get("WidgetUrl"), setArgs);
            }

            this.set("ConfigUrl", this.get("ConfigUrl").trim(), {silent: true});
            if (this.get("ConfigUrl") && this.get("ConfigUrl").indexOf("http") !== 0) {
                this.set("ConfigUrl", Environment + this.get("ConfigUrl"), setArgs);
            }

            // key-value pairs starts as strings in this.. lets fix that
            _.each(this.get("BusinessUnitTags"), function (item) {
                item.Key = parseInt(item.Key, 10);
            });

            // removes the circular reference on destroy
            this.on("destroy", function () {
                this.unset("View");
            }, this);
        },

        /**
        * validate model attributes on change events
        * note: the string messages here are not for the UI, only console.
        *
        * @param {Object} attributes - temporary un-set attributes for validation
        *
        * @method validate
        * @protected
        */
        validate: function (attributes) {
            if (!attributes.Name || typeof attributes.Name !== "string") {
                return "widget name is invalid.";
            }

            if (attributes.Alias) {
                if (attributes.AppmodeTitle !== this.get("AppmodeTitle")) {
                    this.set("AppmodeTitleInitial", attributes.AppmodeTitle, {slient: true, validate: false});
                    this.set("AppmodeTitle", attributes.Alias, {silent: true, validate: false});
                    return 1;
                }
            }
        },

        /**
        * retrieve the instance configuration associated with this widget model
        *
        * @param {Function} onComplete
        * @param {Object} context
        *
        * @method getInstanceConfig
        * @protected
        */
        getInstanceConfig: function (onComplete, context) {
            require(["util/Ajax"], $.proxy(function (Ajax) {
                if (this.get("InstanceConfig")) {
                    onComplete.call(context || window, this.get("InstanceConfig"));
                } else {
                    Ajax.GetInstanceConfig(this.get("InstanceGuid"), this.get("ConfigNumber"), function (config) {
                        if (config) {
                            this.set("InstanceConfig", config);
                            onComplete.call(context || window, config);
                        } else {
                            onComplete.call(context || window, null);
                        }
                    }, this);
                } 
            }, this));
        },

        /**
        * save an updated configuration
        *
        * @param {String} Configuration
        * @param {Function} onComplete
        * @param {Object} context
        * 
        * @method setInstanceConfig
        * @protected
        */
        setInstanceConfig: function (Configuration, onComplete, context) {
            this.set("InstanceConfig", Configuration);

            require(["util/Ajax"], $.proxy(function (Ajax) {
                Ajax.SetInstanceConfig(this.get("InstanceGuid"), Configuration, function (configNumber) {
                    if (configNumber) {
                        this.set("ConfigNumber", configNumber);
                        onComplete && onComplete.call(context || window, true);
                    } else {
                        onComplete && onComplete.call(context || window, false);
                    }
                }, this);
            }, this));
        },

        /**
        * get the configuration associated with all widgets of this type for the user
        *
        * @param {Function} onComplete
        * @param {Object} context
        *
        * @method getGlobalConfig
        * @protected
        */
        getGlobalConfig: function (onComplete, context) {
            if (this.get("GlobalConfig")) {
                onComplete(this.get("GlobalConfig"));
            } else {
                require(["util/Ajax"], $.proxy(function (Ajax) {
                    Ajax.GetGlobalConfig(this.get("Guid"), function (config) {
                        if (config) {
                            this.set("GlobalConfig", config);
                        }
                        onComplete.call(context || window, config);
                    }, this);
                }, this));
            }
        },

        /**
        * set the configuration associated with all widgets of this type for the user
        *
        * @param {String} Configuration
        * @param {Function} onComplete
        * @param {Object} context
        *
        * @method getGlobalConfig
        * @protected
        */
        setGlobalConfig: function (Configuration, onComplete, context) {
            require(["util/Ajax"], $.proxy(function (Ajax) {
                Ajax.SetGlobalConfig(this.get("Guid"), Configuration, function (success) {
                    if (success) {
                        this.set("GlobalConfig", Configuration);
                    }
                    onComplete.call(context || window, success);
                }, this);
            }, this));
        },

        /**
        * constructs the widget url used for a external widget
        *
        * @param {LayoutModel} layoutModel - the model representing this widget's current layout on the desktop
        * @return {String} 
        *
        * @method getWidgetUrl
        * @public
        */
        getWidgetUrl: function (layoutModel) {
            var url = [this.get("WidgetUrl")];

            if (url[0]) {
                url[0] = url[0].replace("[HUBAUTHTOKEN]", this.get("InstanceGuid"));

                url.push(url[0].indexOf("?") !== -1 ? "&guid=" : "?guid=");

                url.push(this.get("InstanceGuid"));

                if (layoutModel) {
                    url.push("&w=" + layoutModel.get("Width"));

                    url.push("&h=" + layoutModel.get("Height"));
                }

                url.push("&full=false");

                url.push("&cfg=" + this.get("ConfigNumber"));
            }

            return url.join("");
        },

        /**
        * constructs the configuration url used for a external widget
        *
        * @param {LayoutModel} layoutModel - the model representing this widget's current layout on the desktop
        * @return {String} 
        *
        * @method getConfigUrl
        * @public
        */
        getConfigUrl: function (layoutModel) {
            var url = [this.get("ConfigUrl")];

            if (url[0]) {
                url[0] = url[0].replace("[HUBAUTHTOKEN]", this.get("InstanceGuid"));

                url.push(url[0].indexOf("?") !== -1 ? "&guid=" : "?guid=");

                url.push(this.get("InstanceGuid"));

                if (layoutModel) {
                    url.push("&w=" + layoutModel.get("Width"));
                    url.push("&h=" + layoutModel.get("Height"));
                }

                url.push("&full=false");

                url.push("&cfg=" + this.get("ConfigNumber"));
            }

            return url.join("");
        },

        /**
        * constructs the appmode url used for a external widget
        *
        * @param {LayoutModel} layoutModel - the model representing this widget's current layout on the desktop
        * @return {String} 
        *
        * @method getAppmodeUrl
        * @public
        */
        getAppmodeUrl: function () {
            var url = [this.get("WidgetUrl")];

            if (this.get("DeepLinkRouteData")) {
                if (this.get("DeepLinkRouteData").indexOf("http") === 0) {
                    url.clear();
                    url.push(decodeURIComponent(this.get("DeepLinkRouteData")));
                } else {
                    url.push(url.join("").indexOf("?") !== -1 ? "&dlrd=" : "?dlrd=");
                    url.push(this.get("DeepLinkRouteData"));
                }
            }

            if (url[0]) {
                url.push(url.join("").indexOf("?") !== -1 ? "&guid=" : "?guid=");
                url.push(this.get("InstanceGuid"));
                url.push("&full=true");
                url.push("&cfg=");
                url.push(this.get("ConfigNumber"));
            }

            if (this.get("DeepLinkHash")) {
                url.push("&dlh=");
                url.push(this.get("DeepLinkHash"));
            }

            if (this.get("SwarmArray")) {
                url.push("&SwarmArray=");
                url.push(this.get("SwarmArray"));
            }

            if (this.get("SwarmHost")) {
                url.push("&SwarmHost=");
                url.push(this.get("SwarmHost"));
            }

            if (this.get("SwarmTestbed")) {
                url.push("&SwarmTestbed=");
                url.push(this.get("SwarmTestbed"));
            }

            return url.join("").replace("[HUBAUTHTOKEN]", this.get("InstanceGuid"));
        },

        /**
        * build the help wiki url
        *
        * @return {String}
        *
        * @method getHelpUrl
        * @public
        */
        getHelpUrl: function () {
            var url = this.get("HelpUrl");

            if (url) {
                if (url.indexOf("engineering.sites.emc.com") !== -1) {
                    url = require("app").HubModel.get("WikiWrapperUrl") + url.substring(url.lastIndexOf('/') + 1);
                }
            }

            return url;
        },

        /**
        * overriden clone method to deal with inner-collections / inner-models
        *
        * @return {WidgetModel}
        *
        * @method clone
        * @public
        */
        clone: function () {
            var model = Model.prototype.clone.call(this);

            model.get("LayoutCollection").reset();

            model.get("SizeCollection").reset(this.get("SizeCollection").toJSON());
            
            model.set("DefaultSize", new SizeModel({
                X: this.get("DefaultSize").get("X"),
                Y: this.get("DefaultSize").get("Y"),
                Enabled: true
            }));
            
            return model;
        },

        /**
        * set a new instance guid to this model - will throw warnings if there is already an instance guid set
        *
        * Note: AVERT YOUR GAZE! THIS CODE WAS TAKEN FROM THE ORIGINAL OUTSYSTEMS IMPLEMENTATION!
        *
        * @method generateGuid
        * @public
        */
        generateGuid: function () {
            if (!this.get("InstanceGuid")) {
                var d = new Date().getTime(),
                    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        var r = (d + Math.random() * 16) % 16 | 0;
                        d = Math.floor(d / 16);
                        return (c === 'x' ? r : (r&0x3|0x8)).toString(16); 
                    });

                    // AHHH!! IT HURTS MY EYES!! WHO DOES BIT-OPERATIONS IN JS!?

                this.set("InstanceGuid", uuid, {silent: true});
                this.bustConfigCache();
            } else if (require("app").HubModel.get("Debug")) {
                console.warn("WidgetModel.generateGuid() - model already has an instance guid assigned");
            }
        },

        /**
        * generates a new config number, outsystems will then not use the cached config
        *
        * @method bustConfigCache
        * @public
        */
        bustConfigCache: function () {
            this.set("ConfigNumber", parseInt(Math.random() * 999999, 10), {silent: true});
        },

        /**
        * get the layout for the argued columnWidth
        *
        * @param {Number} columnWidth - gridster column count
        * @param {Number} previousSize - the previous column count, or null
        * @return {WidgetLayoutModel}
        *
        * @method getLayout
        * @public
        */
        getLayout: function(columnWidth, previousSize) {
            var layout = this.get("LayoutCollection").where({ColumnWidth: columnWidth}),
                previous = this.get("LayoutCollection").where({ColumnWidth: previousSize}),
                create = false,
                output = null;

            // use the existing layout
            if (layout.length) {

                output = layout[layout.length -1];

            // desktop got bigger, clone the current and set the new width
            } else if (columnWidth > previousSize) {
                if (previous.length) {
                    var cloned = previous[0].clone();

                    cloned.set("ColumnWidth", columnWidth);

                    this.get("LayoutCollection").add(cloned);

                    output = cloned;
                } else {
                    create = true;
                }
            } else {
                create = true;
            }

            if (create) {
                output = this.makeNewLayout(columnWidth, previousSize);
                this.get("LayoutCollection").add(output);
            }

            return output;
        },

        /**
        * generate a new layout for this widget, guess the best possible location among the other widgets
        *
        * @param {Number} columnWidth - column width
        * @param {Number} previous - previous column width 
        * @return {WidgetLayout}
        *
        * @method makeNewLayout
        * @private
        */
        makeNewLayout: function (columnWidth, previous) {
            var width, 
                height,
                positionX,
                previousLayout;

            if (previous) {
                previousLayout = this.get("LayoutCollection").where({ColumnWidth: previous});
                
                if (previousLayout.length) {
                    width = previousLayout[0].get("Width");
                    height = previousLayout[0].get("Height");
                    positionX = previousLayout[0].get("X");
                } else {
                    width = this.get("DefaultSize").get("X");
                    height = this.get("DefaultSize").get("Y");
                }

                if (positionX + width > columnWidth) {
                    positionX = columnWidth - width;
                }
            }

            return new WidgetLayoutModel({
                ColumnWidth: columnWidth,
                X: positionX,
                Y: 1, // gridster will determine this and 'evaluate-positions' event will fix it
                Width: width,
                Height: height
            });
        },

        /**
        * trim down this widget's attributes to only what's needed to persist
        *
        * @method serialize
        * @public
        */
        serialize: function () {
            return {
                PluginId: this.get("PluginId"),
                Guid: this.get("Guid"),
                InstanceGuid: this.get("InstanceGuid"),
                ConfigNumber: this.get("ConfigNumber"),
                LayoutCollection: this.get("LayoutCollection").toJSON()
            };
        }
    });
});