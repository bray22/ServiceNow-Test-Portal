/*
* DesktopView.js
*/

define([
"require", 
"view/View", 
"view/WidgetView", 
"model/WidgetModel", 
"model/WidgetLayoutModel", 
"jquery", 
"gridster",
"underscore"], 
function (
require, 
View, 
WidgetView, 
WidgetModel, 
WidgetLayoutModel, 
$, 
Gridster, 
_) {

    "use strict";

    /**
    * encapsultes all gridster-desktop logic
    *
    * @class DesktopView
    * @constructor
    * @extends View
    * @namespace view
    * @public
    */
    return View.extend({

        /**
        * main initialization of gridster and the desktop
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.$gridsterContainer = params.$gridster;

            this.$el.appendTo(this.$gridsterContainer);

            this.initGridster();

            if (this.model.get("IsActive")) {
                this.initWidgets();
            } else {
                this.$el.detach();
            }

            this.model.on("change:IsActive", this.onToggleActive, this);

            this.model.on("add-new-widget", this.onAddNewWidget, this);

            this.model.on("resize", this.onWindowResize, this);

            this.model.get("WidgetCollection").on("add", this.onCollectionAdd, this);
        },

        /**
        * do "math" and determine how many columns we can fit
        *
        * @param {HubModel} hubModel - (optional) the application's model
        * @return {Number} - the number of columns that can current fit the window
        *
        * @method _getColumnCount
        * @private
        */
        getColumnCount: function (hubModel) {
            hubModel = hubModel || require("app").HubModel;
            return Math.floor($(window).width() / (hubModel.get("WidgetDimensionX") + (2 * hubModel.get("WidgetMarginX"))));
        },

        /**
        * initialize the desktop-gridster
        *
        * @method initGridster
        * @private
        */
        initGridster: function () {
            var hubModel = require("app").HubModel;
                
            this.columnCount = this.getColumnCount(hubModel);

            this.gridster = this.$el.addClass("gridster").gridster({
                namespace: "#desktop-" + this.model.get("DesktopId"),
                widget_selector: ".gridster-widget",
                widget_margins: [hubModel.get("WidgetMarginX"), hubModel.get("WidgetMarginY")],
                widget_base_dimensions: [hubModel.get("WidgetDimensionX"), hubModel.get("WidgetDimensionY")],
                min_cols: this.columnCount,
                max_cols: this.columnCount,
                helper: "clone",
                autogrow_cols: true,
                draggable: {
                    handle: ".widget-header *",
                    stop: $.proxy(function () {
                        this.model.get("WidgetCollection").trigger("evaluate-positions");
                        this.model.trigger("save");
                    }, this)
                },
                resize: {
                    enabled: !this.model.get("ReadOnly"),
                    min_size: [hubModel.get("WidgetMinimumX"), hubModel.get("WidgetMinimumY")],
                    max_size: [hubModel.get("WidgetMaximumX"), hubModel.get("WidgetMaximumY")],
                    stop: $.proxy(function () {
                        this.model.get("WidgetCollection").trigger("evaluate-positions");
                        this.model.trigger("save");
                    }, this)
                }
            }).data("gridster");

            if (this.model.get("ReadOnly")) {
                this.gridster.disable();
            }
        },

        /**
        * event-handler when model.IsActive changes in value
        *
        * @param {DesktopModel} model
        * @param {Boolean} value
        * @param {Object} params
        *
        * @method onToggleActive
        * @private
        */
        onToggleActive: function (model, value, params) {
            if (value) {
                this.$el.appendTo(this.$gridsterContainer);
                if (!this.widgetsInitialized) {
                    this.initWidgets();
                }
            } else {
                this.$el.detach();
            }
        },

        /**
        * initialize the existing widgets. if widgets are found with no layout data,
        * it was a temporary widget and should be removed. This happens when launching
        * directly into appmode, or following a deeplink.
        *
        * if the desktop was never displayed yet, and didn't start as the active desktop, retrieve
        * the desktop widget data, and re-execute this function (recursion!)
        *
        * @method initWidgets
        * @private
        */
        initWidgets: function () {
            if (this.model.get("Loaded") === false) {
                this.model.loadWidgets(this.initWidgets, this);
                return;
            }

            var widgets = this.model.get("WidgetCollection"),
                removals = [],
                debug = require("app").HubModel.get("Debug");

            this.model.get("WidgetCollection").each(function (widgetModel, index, collection) {
                if (widgetModel.get("LayoutCollection").length) {
                    widgetModel.set("WidgetView", new WidgetView({
                        model: widgetModel,
                        gridster: this.gridster,
                        desktop: this.model
                    }), {silent: true});
                } else {
                    removals.push(widgetModel);
                }
            }, this);

            if (removals.length) {
                require(["util/Ajax"], function (Ajax) {
                    _.each(removals, function (widgetModel) {
                        widgetModel.collection.remove(widgetModel, {silent: true});

                        if (widgetModel.get("InstanceGuid")) {
                            Ajax.RemoveWidget(widgetModel.get("InstanceGuid"), function (success) {
                                if (debug) {
                                    console.info("Removed previous temporary widget (%s), success: %s", 
                                        widgetModel.get("Name"), success);
                                }
                            });
                        } else if (debug) {
                            console.warn("DesktopView.initWidgets() - missing instance guid on temporary widget");
                        }
                    });
                });
            }

            this.widgetsInitialized = true;
        },

        /**
        * event-handler when a new widget is added from the content-library
        *
        * @param {WidgetModel} widgetModel
        *
        * @method onAddNewWidget
        * @private
        */
        onAddNewWidget: function (widgetModel) {
            var newWidgetModel = widgetModel.clone(),
                defaultSize = newWidgetModel.get("DefaultSize");

            newWidgetModel.generateGuid();

            newWidgetModel.get("LayoutCollection").add(new WidgetLayoutModel({
                X: 1,
                Y: 1,
                Width: defaultSize.get("X"),
                Height: defaultSize.get("Y"),
                ColumnWidth: this.gridster.cols
            }));

            this.model.get("WidgetCollection").add(newWidgetModel);

            // don't mess with key-names here, that's what the metrics server expects
            require("app").Metrics.WidgetAddToDesktop({
                pluginName: widgetModel.get("Name"),
                pluginId: widgetModel.get("Guid"),
                Instanceid: widgetModel.get("InstanceGuid")
            });
        },

        /**
        * widget-collection.add(widget) event-handler (creates the view)
        *
        * @param {WidgetModel} model
        * @param {WidgetCollection} collection
        * @param {Object} params
        *
        * @method onCollectionAdd
        * @private
        */
        onCollectionAdd: function (model, collection, params) {
            model.set("WidgetView", new WidgetView({
                model: model,
                gridster: this.gridster,
                desktop: this.model
            }), {silent: true, validate: false});

            this.model.get("WidgetCollection").trigger("evaluate-positions");
        },

        /**
        * the hub just triggered a resize event - re-evaulate column size and widget layouts
        *
        * note: "gridster.cols" is inaccurate (big surprise -.-) it doesn't goes lower than it's initial
        *       starting size, so I'm internally keeping track of the column-count instead.
        *
        * @method onWindowResize
        * @private
        */
        onWindowResize: function () {
            if (this.widgetsInitialized) {
                var columnCount = this.getColumnCount();
                if (columnCount !== this.columnCount) {
                    this.resizeReInit(columnCount);
                }
            }
        },

        /**
        * called from the re-size callback when its time to reinit gridster and widgets
        *
        * @param {Number} columnCount - the new column count
        *
        * @method resizeReInit
        * @private
        */
        resizeReInit: function (columnCount) {
            var previousCols = this.columnCount,
                debug = require("app").HubModel.get("Debug");

            this.gridster.destroy();

            this.gridster.options.min_cols = 
                this.gridster.options.max_cols = 
                this.gridster.cols = columnCount;

            this.model.get("WidgetCollection").each(function (widgetModel, index, collection) {
                var layout = widgetModel.getLayout(columnCount, previousCols),
                    previous = widgetModel.get("LayoutCollection").where({ColumnWidth: previousCols});

                if (layout) {

                    var $widget = this.$(".gridster-widget[data-instanceguid='" + widgetModel.get("InstanceGuid") + "']");

                    $widget.attr({
                        "data-col": layout.get("X") || 1, // weird 0-value error fix
                        "data-row": layout.get("Y"),
                        "data-sizex": layout.get("Width"),
                        "data-sizey": layout.get("Height")
                    });

                    if (previous.length) {

                        if ((previous[0].get("Width") !== layout.get("Width") || previous[0].get("Height") !== layout.get("Height"))
                            && widgetModel.get("ReloadOnResize")) {

                            $widget.find(".widget-iframe").attr("src", widgetModel.getWidgetUrl(layout));

                        }

                    }

                } else if (debug) {
                    console.warn("DesktopView.resizeReInit() - missing layout, widget: %s, columnWidth: %s",
                        widgetModel.get("Name"), columnCount);
                }
            }, this);

            this.gridster.init();

            this.$(".gs-resize-handle").remove();

            this.columnCount = columnCount;

            this.model.trigger("save");

            if (debug) {
                console.log("Re-initialized gridster with %s columns", columnCount);
            }
        }
    });
});