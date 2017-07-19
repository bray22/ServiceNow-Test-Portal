/*
* WidgetView.js
*/

define(["require", "view/View", "i18n!nls/Hub", "underscore", "model/WidgetLayoutModel", "util/Ajax"], 
function(require, View, Strings, _, WidgetLayoutModel, Ajax) {
    "use strict";

    /**
    * Extends View, and defines the functionality do display and interact with a widget
    *
    * @class WidgetView
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
            "click .on-size-switch": "onChangeSize",
            "click .on-appmode": "onAppmode",
            "click .on-settings": "onSettings",
            "click .on-submitbug": "onSubmitBug",
            "click .on-help": "onHelp",
            "click .on-remove": "onRemove",
            "click .on-rename": "onRename",
            "mouseenter .widget-title[data-nofit='1']": "onMouseTitleIn",
            "mouseleave .widget-title[data-nofit='1']": "onMouseTitleOut",
            "click .on-email-author": "onEmailAuthor",
            "mouseenter .widget-footer-trigger": "onShowFooter",
            "mouseleave .widget-inner": "onHideFooter"
        },

        /**
        * initialize DOM elements
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.myGridster = params.gridster;
            
            this.myDesktop = params.desktop;

            var layout = this.model.getLayout(this.myGridster.cols, null),
                html = this.template("Widget", _.extend({
                    CurrentSize: layout.get("Width") + "x" + layout.get("Height")
                }, this.model.attributes, layout.attributes));

            this.model.set("ActiveLayout", layout);

            if (require("app").HubModel.get("Debug")) {
                console.log("Initializing '%s' widget:\n\t X: %s, Y: %s, Width: %s, Height: %s, ColumnWidth: %s", 
                    this.model.get("Name"), 
                    layout.get("X"), 
                    layout.get("Y"), 
                    layout.get("Width"), 
                    layout.get("Height"), 
                    this.myGridster.cols);

                this.model.on("invalid", function (model, msg) {
                    console.warn("WidgetModel: %o, validation error: %s", model, msg);
                });
            }

            this.setElement(params.gridster.add_widget(html, layout.get("Width"), layout.get("Height"), layout.get("X"), layout.get("Y")));

            this.initSizes();

            this.initFooter();

            this.initTitle();

            this.initContents(layout);

            this.$(".gs-resize-handle").remove();

            this.model.on("change:Name", this.onNameChange, this);

            this.model.on("change:Alias", this.onNameChange, this);

            this.model.on("configure", this.onSettings, this);

            this.model.on("appmode", this.onAppmode, this);

            this.model.on("bug", this.onSubmitBug, this);

            this.model.on("help", this.onHelp, this);

            this.model.on("delete", this.onRemove, this);

            if (this.myDesktop.get("ReadOnly")) {
                this.setToReadOnly();
            }

            this.$("[data-toggle='tooltip']").tooltip({
                container: "body",
                trigger: "hover",
                delay: {
                    show: 500,
                    hide: 0
                }
            });
        },

        /**
        * entry point to initialize the iframe/1x1/noiframe widget content
        *
        * @param {WidgetLayoutModel} layout - the current layout determined in .initialize()
        *
        * @method initContents
        * @private
        */
        initContents: function (layout) {
            this.$(".config-header-rename-input").val(this.model.get("Alias") ? this.model.get("Alias") : this.model.get("Name"))

            if (this.model.get("NoIframe") === false) {
                this.$(".no-iframe-content, .no-iframe-config").remove();

                if (!this.isNoContent1x1()) {
                    this.$(".widget-iframe").attr("src", this.model.getWidgetUrl(layout));
                } else {
                    this.$(".widget-body-inner").prepend(this.template("Widget-NoContent", this.model.attributes));

                    if (layout.get("Width") === 1 && layout.get("Height") === 1) {
                        this.$(".widget-iframe").hide();
                    } else {
                        this.$(".widget-iframe").attr("src", this.model.getWidgetUrl(layout));
                        this.$(".widget-no1x1-content").hide();
                    }
                }
            } else if (this.model.get("Module")) {
                this.$(".widget-iframe, .widget-config-iframe").remove();

                this.addNoIframeClass(layout);

                require([this.model.get("Module")], $.proxy(function (WidgetModule) {
                    this.module = new WidgetModule({
                        model: this.model,
                        el: $("<div class='widget-noiframe-element'></div>").appendTo(this.$(".no-iframe-content")),
                        appmode: false,
                        config: false
                    });
                }, this));
            } else if (require("app").HubModel.get("Debug")) {
                console.error("WidgetView.initContents() - unable to init widget content");
            }
        },

        /**
        * the possible class list for no-firame widgets
        *
        * @property noIframeClassList
        * @private
        */
        noIframeClassList: [
            "size-1x1", 
            "size-1x2",
            "size-1x3",
            "size-2x1",
            "size-2x2",
            "size-2x3",
            "size-3x1",
            "size-3x2",
            "size-3x3",
            "size-4x1",
            "size-4x2",
            "size-4x3"].join(" "),

        /**
        * for no-iframes, update the content-class so the widget can have a responsive mechanism
        *
        * @param {WidgetLayoutModel} layout - the current layout
        *
        * @method addNoIframeClass
        * @private
        */
        addNoIframeClass: function (layout) {
            this.$(".widget-body")
                .removeClass(this.noIframeClassList)
                .addClass("size-" + layout.get("Width") + "x" + layout.get("Height"));
        },

        /**
        * determines in this widget is a 1x1 with no content
        * TODO: poor implementation purposely done due to current widget registration data
        *
        * @return {Boolean}
        *
        * @method isNoContent1x1
        * @private
        */
        isNoContent1x1: function () {
            var collection = this.model.get("SizeCollection"),
                has1x1 = !!collection.where({X: 1, Y: 1, Enabled: true}).length,
                hasAppmode = !!collection.where({X: 999, Y: 999, Enabled: true}).length;

            return this.model.get("ImageUrl") && has1x1 && hasAppmode;
        },

        /**
        * removes any footer icons which do not belong for this widget
        *
        * @method initFooter
        * @private
        */
        initFooter: function () {
            if (!this.model.get("HelpUrl")) {
                this.$(".on-help").remove();
            }

            if (!this.model.get("SizeCollection").where({X: 999, Y: 999, Enabled: true}).length) {
                this.$(".on-appmode").remove();
            }
        },

        /**
        * inserts the size-dropdown 
        *
        * @method initSizes
        * @private
        */
        initSizes: function () {
            var $sizes = this.$(".widget-size-items");

            _.each(this.model.get("SizeCollection").where({Enabled: true}), function (model, index) {
                if (model.get("X") !== 999 && model.get("Y") !== 999) {
                    $sizes.append(this.template("Widget-Size-Item", model.attributes));
                }
            }, this);
        },

        /**
        * called during init on a readonly desktop
        *
        * @method setToReadyOnly
        * @private
        */
        setToReadOnly: function () {
            this.$(".current-size-btn, .on-remove, .on-settings, .widget-drag-handle .fa").remove();
        },

        /**
        * helper function to retrieve the current layout model
        * note: theres a server error adding duplicates, the error handling here will return the last in the list
        *
        * @return {WidgetLayoutModel}
        *
        * @method getCurrentSize
        * @private
        */
        getCurrentSize: function () {
            var size = this.model.get("LayoutCollection").where({ColumnWidth: this.myGridster.cols});

            if (size.length) {
                return size[size.length -1];
            } else {
                return undefined;
            }
        },

        /**
        * model change:Name callback, update the name on the DOM
        *
        * @param {WidgetModel} model
        * @param {String} name
        *
        * @method onNameChange
        * @private
        */
        onNameChange: function (model, name) {
            this.$(".widget-title-text").text(model.get("Alias") || model.get("Name"));
        },

        /**
        * user re-named the widget from the config page
        *
        * @method onRename
        * @private
        */
        onRename: function (model) {
            var alias = this.$(".config-header-rename-input").val();

            if (alias.length) {
                var widgetRenameData = {
                    WidgetInstanceGUID: this.model.get("InstanceGuid"),
                    NewName: alias
                };

                require(["util/Ajax"], $.proxy(function (Ajax) {
                    Ajax.RenameWidget(widgetRenameData, function (widgetData) {
                        var success = widgetData !== null;

                        if (success) {
                            this.model.set({
                                Alias: alias,
                                AppmodeTitle: alias
                            });

                            this.model.trigger("check-title");
                        } else {
                            if (require("app").HubModel.get("Debug")) {
                                console.error("WidgetView.onRename() - could not rename the widget");
                            }
                        }
                    }, this);
                }, this));
            }
        },

        /**
        * the user just clicked a new size from the dropdown
        *
        * @method onChangeSize
        * @private
        */
        onChangeSize: function (e) {
            var $target = $(e.target),
                w = $target.data("widgetsizex"),
                h = $target.data("widgetsizey"),
                sizeText = w + "x" + h,
                $sizeBtn = this.$(".current-size-txt"),
                currentLayout = this.getCurrentSize(),
                canResize = ((currentLayout.get("X") + w -1) <= this.myGridster.cols);

            if (!canResize) {
                this.resizeFail();
                return;
            }

            if ($sizeBtn.text() !== sizeText) {
                $sizeBtn.text(sizeText);

                try {
                    // TODO: this is throwing exceptions... but still works.. hmm.
                    this.myGridster.resize_widget(this.$el, w, h, true, function () {});
                } catch(e) {}

                if (currentLayout) {
                    currentLayout.set({ Width: w, Height: h });
                } else if (require("app").HubModel.get("Debug")) {
                    console.error("WidgetView.onChangeSize() - did not find a layout at this column width");
                }

                if (currentLayout) {
                    this.model.set("ActiveLayout", currentLayout);

                    this.model.trigger("resize", w, h);

                    if (this.model.get("NoIframe") === false && this.model.get("ReloadOnResize") === true) {
                        
                        if (this.$el.hasClass("configure")) {
                            this.$(".widget-config-iframe").attr("src", this.model.getConfigUrl(currentLayout));
                        } else {
                            this.$(".widget-iframe").attr("src", this.model.getWidgetUrl(currentLayout));

                            if (this.isNoContent1x1()) {
                                if (w === 1 && h === 1) {
                                    this.$(".widget-no1x1-content ").show();
                                    this.$(".widget-iframe").hide();
                                } else {
                                    this.$(".widget-no1x1-content ").hide();
                                    this.$(".widget-iframe").show();
                                }
                            }
                        }

                    } else {
                        this.addNoIframeClass(currentLayout);
                    }

                } // if (currentLayout)

                this.model.collection.trigger("evaluate-positions");

                this.myDesktop.trigger("save");

                require("app").Metrics.WidgetResized({
                    pluginId: this.model.get("Guid"),
                    Instanceid: this.model.get("InstanceGuid"),
                    pluginName: this.model.get("Name")
                });
            }
        },

        /**
        * the user attempted to resize, when there weren't enough columns to do so
        *
        * @method resizeFail
        * @private
        */
        resizeFail: function () {
            require(["util/AnimHelpers"], $.proxy(function (AnimHelpers) {
                AnimHelpers.Shake(this.$el, function () {});
            }, this));
        },

        /**
        * user just launched this widget into appmode
        *
        * @method onAppmode
        * @private
        */
        onAppmode: function () {
            var app = require("app");

            require(["view/WidgetAppmodeView"], $.proxy(function (WidgetAppmodeView) {
                new WidgetAppmodeView({
                    model: this.model
                });

                require("app").Metrics.WidgetAppmodeViewed({
                    pluginId: this.model.get("Guid"),
                    Instanceid: this.model.get("InstanceGuid"),
                    pluginName: this.model.get("Name")
                });
            }, this));
        },

        /**
        * user just clicked for widget settings
        *
        * @method onSettings
        * @private
        */
        onSettings: function () {
            var currentSize = this.getCurrentSize();

            if (!this.$el.hasClass("configure")) {
                this.showSettings(currentSize);
            } else {
                this.hideSettings(currentSize);
            }
        },

        /**
        * slide up the settings page
        *
        * @param {SizeModel} currentSize - currnet layout info
        *
        * @method showSettings
        * @private
        */
        showSettings: function (currentSize) {
            this.$(".config-iframe-backdrop").show().end().addClass("configure");

            this.$(".config-iframe-backdrop").animate({opacity: 0.5}, {duration: 300});

            if (!this.model.get("NoIframe")) {
                this.$(".widget-config-iframe").attr("src", this.model.getConfigUrl(currentSize));
            } else {
                if (this.configModule) {
                    this.configModule.remove();
                    this.configModule = undefined;
                }

                require([this.model.get("Module")], $.proxy(function (Module) {
                    this.configModule = new Module({
                        el: $("<div class='widget-noiframe-element'></div>").appendTo(this.$(".no-iframe-config")),
                        model: this.model,
                        appmode: false,
                        config: true
                    });
                }, this));
            }
        },

        /**
        * slide down the settings page
        *
        * @param {SizeModel} currentSize - current layout info
        *
        * @method hideSettings
        * @private
        */
        hideSettings: function (currentSize) {
            this.$el.removeClass("configure");

            // wait for transition to finish
            setTimeout($.proxy(function () {
                this.$(".config-iframe-backdrop").animate({opacity: 0}, {
                    duration: 300,
                    complete: $.proxy(function () {
                        this.$(".config-iframe-backdrop").hide();

                        if (!this.model.get("NoIframe")) {
                            this.model.bustConfigCache();

                            this.$(".widget-iframe").attr("src", this.model.getWidgetUrl(currentSize));

                            this.$(".widget-config-iframe").removeAttr("src");
                        } else {
                            if (this.configModule) {
                                this.configModule.remove();
                                this.configModule = undefined;
                            }

                            if (this.module) {
                                this.module.remove();
                                this.module = undefined;
                            }

                            require([this.model.get("Module")], $.proxy(function (Module) {
                                this.module = new Module({
                                    model: this.model,
                                    el: $("<div class='widget-noiframe-element'></div>").appendTo(this.$(".no-iframe-content")),
                                    config: false,
                                    appmode: false
                                });
                            }, this));
                        }
                    }, this)
                });
            }, this), 200);
        },

        /**
        * user just clicked the 'submit a bug'
        *
        * @method onSubmitBug
        * @private
        */
        onSubmitBug: function () {
            var FormattingObj = {
                CreateIncidentForm: {
                    ConfigurationItemDisplay: "TheHub",
                    BuildingDisplay: "Application Services",
                    LabDisplay: "Application Services",
                    CategoryDisplay: "OS/Software",
                    AdditionalDescrip: "Browser: " + navigator.userAgent + "\nWidgetName: " + this.model.get("Name")
                },
                HiddenFields: {
                    ConfigurationItem: false,
                    Building: false,
                    Lab: false,
                    Category: false,
                    Program: false,
                    Project: false,
                    DeviceName: false,
                    RequestedBy: false,
                    BusinessUnit: false
                }
            };
            
            require(["view/IframeModalView", "util/Environment"], $.proxy(function (IframeModalView, Environment) {
                new IframeModalView({
                    title: Strings.WidgetSubmitBug,
                    url: Environment + 
                        "/ServiceNow_Plugins/CreateIncident_V2.aspx?FormattingObj=" + encodeURI(JSON.stringify((FormattingObj))),
                    height: "90%"
                });
            }, this))
            ;

        },

        /**
        * user just clicked the help icon
        *
        * @method onHelp
        * @private
        */
        onHelp: function () {
            var url = this.model.getHelpUrl();

            if (url) {
                require(["view/IframeModalView"], $.proxy(function (Modal) {
                    new Modal({
                        title: Strings.WidgetHelpModalTitle + this.model.get("Name"),
                        url: url,
                        height: "90%",
                        width: "80%"
                    });
                }, this));
            } else if (require("app").HubModel.get("Debug")) {
                console.error("WidgetView.onHelp() - missing help url for widget: %s", this.model.get("Name"));
            }
        },

        /**
        * user just clicked the remove button
        *
        * @method onRemove
        * @private
        */
        onRemove: function () {
            this.$("[data-toggle='tooltip']").tooltip("hide");

            if (this.module) {
                this.module.remove();
            }

            if (this.configModule) {
                this.configModule.remove();
            }

            require("app").Metrics.WidgetRemove({
                pluginName: this.model.get("Name"),
                pluginId: this.model.get("Guid"),
                Instanceid: this.model.get("InstanceGuid")
            });

            this.myGridster.remove_widget(this.$el);

            this.remove();

            this.model.collection.remove(this.model);
        },

        /**
        * does the center + scrolling logic at all different sizes
        *
        * @method initTitle
        * @private
        */
        initTitle: function () {
            function _determine() {
                var $title = this.$(".widget-title-text"),
                    titleWidth = $title.width(),
                    $parent = this.$(".widget-title"),
                    parentWidth = $parent.width();

                $parent.attr("data-nofit", titleWidth > parentWidth ? 1 : 0);
            }

            // the title changed
            this.model.on("change:Name", _determine, this);

            // manually-called from alias after the dom has been updated
            this.model.on("check-title", _determine, this);

            // widget size has changed
            this.model.on("resize", function () {
                // wait for gridster animation to finish
                setTimeout($.proxy(_determine, this), 500);
            }, this);


            // TODO: gotta wait for dom construction to finish
            // timer might be problematic, may want router to trigger an event so we can listen
            setTimeout($.proxy(function () {
                _determine.call(this);
            }, this), 1000);
        },

        /**
        * user moused over the title which was already determined to have 'ticker' style
        * set a hard-left on the title, and let the css-transition do the rest
        *
        * @method onMouseTitleIn
        * @private
        */
        onMouseTitleIn: function () {
            var $title = this.$(".widget-title-text"),
                titleWidth = $title.width(),
                containerWidth = this.$(".widget-title").width();

            $title.css("left", (containerWidth - titleWidth -10) + "px");
        },

        /**
        * user moused out of the title, undo the mouseenter
        * (we just need to remove the hard-set left position)
        *
        * @method onMouseTitleOut
        * @private
        */
        onMouseTitleOut: function () {
            this.$(".widget-title-text").removeAttr("style");
        },

        /**
        * user clicks the e-mail author link
        *
        * @method onEmailAuthor
        * @private
        */
        onEmailAuthor: function () {
            window.location.href = "mailto:" + this.model.get("AuthorEmail");
        },


        /**
        * user's mouse is on the footer-trigger, slide the widget-nav up
        *
        * @method onShowFooter
        * @private
        */
        $nav: undefined,
        onShowFooter: function () {
            if (!this.$nav) {
                this.$nav = this.$(".widget-navigation");
            }

            this.$nav.addClass("show-nav").one("mouseleave.hide", $.proxy(this.onHideFooter, this));
        },

        /**
        * user moved out of the footer, or fast enough to be out of the widget entirely, hide the footer
        *
        * @method onHideFooter
        * @private
        */
        onHideFooter: function () {
            this.$nav && this.$nav.removeClass("show-nav").off("mouseleave.hide");
        }
    });
});