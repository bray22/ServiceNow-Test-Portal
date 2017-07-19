/*
* DesktopMenuView.js
*/

define([
"require", 
"view/View", 
"jquery", 
"view/IframeAppmodeView", 
"i18n!nls/Hub", 
"view/DesktopOptionsView"], 
function (
require, 
View, 
$, 
IframeAppmodeView, 
Strings, 
DesktopOptionsView) {
    
    "use strict";

    /**
    * controls toggling desktops, creating new, sharing, etc...
    *
    * @class DesktopMenuView
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
            "click .on-switch-desktop": "onSwitchDesktop",
            "click #create-desktop-link": "onCreateDesktop",
            "click .on-desktop-options": "onDesktopOptions",
            "click #on-shared-desktops": "onViewShared"
        },

        /**
        * init DOM and events
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.$icon = params.$icon;

            this.$currentName = params.$currentName;

            this.initDesktopMenu();

            this.$("[data-toggle='tooltip']").tooltip({
                container: "body",
                trigger: "hover"
            });

            this.model.on("add", this.reInitDesktopMenu, this);

            this.model.on("remove", this.onRemoveDesktop, this);

            this.on("refresh", this.refreshMenu, this);

            this.model.each(function (desktopModel) {
                desktopModel.on("change:IsActive", this.onActiveChange, this);
                desktopModel.on("change:Name", this.onNameChange, this);
            }, this);

            this.model.on("add", function (desktopModel) {
                desktopModel.on("change:IsActive", this.onActiveChange, this);
                desktopModel.on("change:Name", this.onNameChange, this);
            }, this);
        },

        /**
        * request for the most up-to-date list of desktops, and re-render the menu
        *
        * @method refreshMenu
        * @private
        */
        refreshMenu: function () {
            require(["util/Ajax"], $.proxy(function (Ajax) {
                Ajax.GetDesktopList(function (collection) {
                    if (collection) {
                        collection.each(function (desktopModel) {
                            var existing = this.model.where({DesktopId: desktopModel.get("DesktopId")});

                            if (existing.length) {
                                existing[0].set("IsShared", desktopModel.get("IsShared"));
                                existing[0].set("Group", desktopModel.get("Group"));
                            }
                        }, this);

                        this.reInitDesktopMenu();
                    }
                }, this);
            }, this));
        },

        /**
        * collection callback when a desktop is removed
        *
        * @param {DesktopModel} desktopModel
        *
        * @method onRemoveDesktop
        * @private
        */
        onRemoveDesktop: function (desktopModel) {
            var $lineItem = this.$el.find(".hb-desktop-menu-item[data-desktopid='" + desktopModel.get("DesktopId") + "']");
            $lineItem.slideUp(function () {
                $lineItem.remove();
            });
        },

        /**
        * model callback when a desktop.IsActive changes
        *
        * @param {DesktopModel} desktop Model
        *
        * @method onActiveChange
        * @private
        */
        onActiveChange: function (desktopModel, active) {
            if (active) {
                this.$currentName.text(desktopModel.get("Name"));

                $("head title").text(desktopModel.get("Name") + " | " + Strings.TheHubName);
                
                if (!desktopModel.get("ReadOnly")) {
                    if (this.switchRequest) {
                        this.switchRequest.abort();
                    }

                    require(["util/Ajax", "app"], $.proxy(function (Ajax, App) {
                        this.switchRequest = Ajax.SetActiveDesktop(desktopModel.get("DesktopId"), function (success) {
                            this.switchRequest = undefined;

                            if (App.HubModel.get("Debug")) {
                                console.log("%s saved active desktop", success ? "Successfully" : "Failed to");
                            }
                        }, this);
                    }, this));
                }
            }
        },

        /**
        * model callback when desktop.Name changes
        *
        * @param {DesktopModel} desktopModel
        * @param {String} name
        *
        * @method onNameChange
        * @private
        */
        onNameChange: function (desktopModel, name) {
            var $lineItem = this.$el.find(".hb-desktop-menu-item[data-desktopid='" + desktopModel.get("DesktopId") + "']");
            $lineItem.find(".hb-desktop-menu-item-name").text(name);
            if (desktopModel.get("IsActive")) {
                this.$currentName.text(name);
                $("head title").text(desktopModel.get("Name") + " | " + Strings.TheHubName);
            }
        },

        /**
        * populate the user's desktop menu
        *
        * @method initDesktopMenu
        * @private
        */
        initDesktopMenu: function () {
            var desktops = _.groupBy(this.model.models, function (model) {
                return model.get("Group");
            });

            var activeDesktop = this.model.where({IsActive: true});

            if (activeDesktop.length) {
                this.$currentName.text(activeDesktop[0].get("Name"));
                $("head title").text(activeDesktop[0].get("Name") + " | " + Strings.TheHubName);
            } else if (require("app").HubModel.get("Debug")) {
                console.error("No initial active desktops");
            }

            var $menuTarget = this.$("#desktop-menu-list");

            // keep the initial order that the server gave us, not groupBy order
            this.model.each(function (desktopModel) {
                var group = desktopModel.get("Group");

                if (desktops[group]) {
                    $menuTarget.append(View.prototype.template("Desktop-Menu-Group", desktopModel.attributes));

                    _.each(desktops[group], function (desktop) {
                        var $menuItem = $(View.prototype.template("Desktop-Menu-Item", desktop.attributes)).appendTo($menuTarget);
                        if (desktop.get("ReadOnly")) {
                            $menuItem.find(".hb-desktop-menu-item-options").remove();
                        }
                    });

                    delete desktops[group];
                }
            });
        },

        /**
        * when the desktop collection changes, re-render the menu 
        *
        * @method reInitDesktopMenu
        * @private
        */
        reInitDesktopMenu: function () {
            this.undelegateEvents();

            var active = this.model.where({IsActive: true}),
                activeId = (active.length ? active[0].get("DesktopId") : null);

            this.$("#desktop-menu-list").children().remove();

            this.initDesktopMenu();

            if (activeId) {
                var set = this.model.where({DesktopId: activeId});
                if (set.length) {
                    set[0].set("IsActive", true, {silent: true});
                }
            }

            this.delegateEvents();
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
                this.optionsView && this.optionsView.$el.animate({opacity: 0}, {
                    duration: 200,
                    complete: $.proxy(function () {
                        this.optionsView.remove();
                        this.optionsView = undefined;
                    }, this)
                });

                this.$el.animate({opacity: 0}, {
                    duration: 200,
                    complete: $.proxy(function () {
                        this.$el.hide();
                        cb && cb();
                    }, this)
                });
            };

            this.$el.css({
                top: offset.top + this.$icon.height() + 15,
                left: offset.left
            });

            this.$el.show().animate({opacity: 1}, {
                duration: 200
            });
        },

        /**
        * user clicked the 'switch desktop' link
        *
        * @method onSwitchDesktop
        * @private
        */
        onSwitchDesktop: function (event) {
            var desktopId = $(event.target).closest(".hb-desktop-menu-item").data("desktopid"),
                activeDesktop = this.model.where({IsActive: true}),
                totalWidgets = 0;

            if (activeDesktop.length) {
                activeDesktop[0].set("IsActive", false);
            }

            // if the user was on a shared-desktop preview - remove it
            // (selecting a desktop from the shared-desktop menu, does not add to the user's collection)
            $(".desktop-preview").remove();

            var nextDesktop = this.model.where({DesktopId: desktopId});
            if (nextDesktop.length) {
                nextDesktop[0].set("IsActive", true);
                require("app").UserModel.trigger("desktop-change", nextDesktop[0]);
            }

            this.close && this.close();
        },

        /**
        * user clicked "create a new desktop"
        *
        * @method createDesktop
        * @private
        */
        onCreateDesktop: function () {
            if (this.$(".hb-desktop-name").length) {
                return;
            }

            var $create = $(this.template("Desktop-Name"));

            $create.find(".on-confirm").on("click.create", function cb_confirmClick (e) {
                var name = $create.find("input").val();
                if (name) {
                    $(this).off(e);

                    require(["app", "view/ToastView", "util/Ajax"], function cb_getModules (App, ToastView, Ajax) {

                        Ajax.CreateDesktop(name, function cb_createDesktop (DesktopModel) {

                            $create.find("[data-toggle='tooltip']").tooltip("hide");

                            $create.animate({opacity: 0}, {
                                duration: 300,
                                complete: function cb_opacityAnimate() {
                                    $create.slideUp(function cb_slideUp () {
                                        $create.remove();

                                        if (DesktopModel) {
                                            App.UserModel.get("DesktopCollection").each(function cb_desktopEach (desktop) {
                                                desktop.set("IsActive", false);
                                            });

                                            App.UserModel.get("DesktopCollection").add(DesktopModel);

                                            require("app").UserModel.trigger("desktop-change", DesktopModel);
                                        } else {
                                            new ToastView({
                                                color: ToastView.prototype.ErrorColor,
                                                timer: false,
                                                icon: "fa fa-exclamation-circle",
                                                message: Strings.DesktopCreateErrorMessage
                                            });
                                        }
                                    }); // create.slideUp
                                } // animate.complete
                            }); // create.animate
                        }); // Ajax.create()
                    }); // require()
                } else {
                    $create.find("input").addClass("desktop-input-error").one("input.removeErrorClass", function (e) {
                        $(this).removeClass("desktop-input-error");
                    });
                }
            });

            $create.find(".on-cancel").one("click.cancel", function (e) {
                $create.find("[data-toggle='tooltip']").tooltip("hide");
                $create.animate({opacity: 0}, {
                    duration: 300,
                    complete: function cb_opacityAnimte () {
                        $create.slideUp(function cb_clideUp () {
                            $create.remove();
                        });
                    }
                });
            });

            this.$("#desktop-menu-list").prepend($create);

            $create.slideDown();

            $create.find("[data-toggle='tooltip']").tooltip({
                container: "body",
                trigger: "hover"
            });
        },

        /**
        * user clicked the desktop options icon
        *
        * @method onDesktopOptions
        * @private
        */
        onDesktopOptions: function (e) {
            var $target = $(e.target),
                desktopId = $target.closest(".hb-desktop-menu-item").data("desktopid"),
                App = require("app"),
                desktopModel = this.model.where({DesktopId: desktopId})[0];

            if (this.optionsView) {
                this.optionsView.remove();
            }

            if (desktopModel) {
                this.optionsView = new DesktopOptionsView({
                    model: desktopModel,
                    left: this.$el.offset().left + this.$el.width(),
                    top: $target.offset().top,
                    $menuItem: $target.closest(".hb-desktop-menu-item"),
                    close: $.proxy(function () {
                        this.optionsView = undefined;
                    }, this)
                });
            } else if (App.HubModel.get("Debug")) {
                console.error("DesktopMenuView.onDesktopOptions() - unable to determine desktop model");
            }
        },

        /**
        * user wants to view all of the shared desktops
        *
        * @method onViewShared
        * @private
        */
        onViewShared: function () {
            this.close && this.close();
            
            require(["util/Environment"], function (Environment) {
                new IframeAppmodeView({
                    title: Strings.SharedDesktopsTitle,
                    url: Environment + "/TheHub/SharedDesktops.aspx?isClient=true"
                });
            });
        }
    });
});