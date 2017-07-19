/*
* DesktopOptionsView.js
*/

define(["view/View", "jquery", "i18n!nls/Hub"], function (View, $, Strings) {
    "use strict";

    /**
    * controls the menu for editing a desktop
    *
    * @class DesktopOptionsView
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
            "click .on-rename": "onRename",
            "click .on-delete": "onDelete",
            "click .on-share": "onShare",
            "click .on-clone": "onClone"
        },

        /**
        * init dom and events
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.$menuItem = params.$menuItem;

            this.close = params.close;

            this.setElement($(this.template("Desktop-Options", this.model.attributes)));

            if (this.model.get("IsShared") && this.model.get("IsOwner")) {
                this.$(".hb-desktop-option-row[data-action='share']")
                    .find(".desktop-option-txt").text(Strings.DesktopOptionUnShare);
            }

            if (this.model.get("IsShared") && !this.model.get("IsOwner")) {
                this.$(".hb-desktop-option-row[data-action='share']").remove();
                this.$(".hb-desktop-option-row[data-action='delete']").remove();
            }

            this.$el.appendTo($("#desktop")).css({
                top: params.top,
                left: params.left
            }).animate({opacity: 1}, {duration: 300});
        },

        /**
        * user clicked rename
        *
        * @method onRename
        * @private
        */
        onRename: function () {
            var $rename = $(this.template("Desktop-Name", this.model.attributes)),
                This = this;

            $rename.find(".desktop-confirm-btn").attr("title", Strings.DesktopRenameTooltip).end()
                .find(".desktop-cancel-btn").attr("title", Strings.DesktopRenameCancel).end()
                .find("input").val(this.model.get("Name")).end()
                .removeAttr("style")

            $rename.insertBefore(this.$menuItem);

            this.$menuItem.detach();

            $rename.find(".on-confirm").on("click.confirm", function (e) {
                var $input = $rename.find("input"),
                    val = $input.val();

                if (val) {
                    $(this).off(e);
                    $rename.find(".on-cancel").off("click.cancel");

                    require(["util/Ajax", "app", "view/ToastView"], $.proxy(function (Ajax, App, ToastView) {
                        Ajax.RenameDesktop(this.model.get("DesktopId"), val, function (success) {
                            if (success) {
                                this.$menuItem.insertBefore($rename);
                                
                                $rename.remove();
                                
                                this.model.set("Name", val);
                            } else {
                                this.$menuItem.insertBefore($rename);
                                
                                $rename.remove();
                                
                                new ToastView({
                                    message: Strings.DesktopRenameFailure,
                                    color: ToastView.prototype.ErrorColor,
                                    icon: "fa fa-exclamation-circle"
                                });
                            }
                        }, this);
                    }, This));
                } else {
                    $input.addClass("desktop-input-error").one("input.removeError", function () {
                        $input.removeClass("desktop-input-error");
                    });
                }
            });

            $rename.find(".on-cancel").on("click.cancel", $.proxy(function () {
                this.$menuItem.insertBefore($rename);
                $rename.remove();
            }, this));

            this.close();
            this.remove();
        },

        /**
        * user clicked delete 
        *
        * @method onDelete
        * @private
        */
        onDelete: function () {
            var desktops = require("app").UserModel.get("DesktopCollection").where({Group: "Personal"});

            if (desktops.length > 1) {
                require(["util/Ajax", "app", "view/ToastView", "view/ConfirmationView"], $.proxy(function (Ajax, App, ToastView, ConfirmationView) {
                    var confirmOptions = {};

                    confirmOptions[Strings.Delete] = $.proxy(function () {
                        Ajax.DeleteDesktop(this.model.get("DesktopId"), $.proxy(function (success) {
                            this.deleteCallback.call(this, success);
                        }, this));
                    }, this);

                    confirmOptions[Strings.Cancel] = function () {
                        // I don't think theres anything to do here...
                    };

                    new ConfirmationView({
                        title: Strings.ConfirmationTitle,
                        message: Strings.DeleteDesktopConfirmMessage.replace(/{{ Name }}/g, this.model.get("Name")),
                        options: confirmOptions,
                        width: 500,
                        height: 200
                    });
                }, this));
            } else {
                require(["view/ToastView"], function (ToastView) {
                    new ToastView({
                        message: Strings.LastDesktopDeleteError,
                        color: ToastView.prototype.ErrorColor,
                        icon: "fa fa-exclamation-circle"
                    });
                });
            }

            this.close();
            this.remove();
        },

        /**
        * callback from delete-desktop ajax request
        *
        * @param {Boolean} success
        *
        * @method deleteCallback
        * @private
        */
        deleteCallback: function (success) {
            if (success) {
                this.$menuItem.slideUp($.proxy(function () {
                    this.$menuItem.remove();
                    if (this.model.get("IsActive")) {
                        this.model.set("IsActive", false);
                        this.model.collection.remove(this.model);
                        var personal = require("app").UserModel.get("DesktopCollection").where({Group: "Personal"});
                        if (personal.length) {
                            personal[0].set("IsActive", true);
                            require("app").UserModel.trigger("desktop-change", personal[0]);
                        }
                    }
                }, this));
            } else {
                new ToastView({
                    message: Strings.DeleteDesktopError + this.model.get("Name"),
                    color: ToastView.prototype.ErrorColor,
                    icon: "fa fa-exclamation-circle"
                });
            }
        },

        /**
        * user clicked share
        *
        * @method onShare
        * @private
        */ 
        onShare: function () {
            require(["util/Ajax", "view/IframeModalView", "view/ToastView", "i18n!nls/Hub", "util/Environment"], 
            $.proxy(function (Ajax, IframeModalView, ToastView, Strings, Environment) {
                if (!this.model.get("IsShared")) {
                    new IframeModalView({
                        title: Strings.ShareDesktopModalTitle,
                        url: Environment + "/ManageSharedDesktop.aspx?client=true&DesktopId=" + this.model.get("DesktopId")
                    });
                } else {
                    Ajax.UnShareDesktop(this.model.get("DesktopId"), function (success) {
                        if (!success) {
                            new ToastView({
                                color: ToastView.prototype.ErrorColor,
                                message: Strings.DesktopUnShareFailure,
                                icon: "fa fa-exclamation-circle"
                            });
                        } else {
                            require("app").HubView.desktopMenuView.trigger("refresh");
                        }
                    }, this);
                }
            }, this));

            this.close();
            
            this.remove();
        },

        /**
        * user clicked the clone icon
        *
        * @method onClone
        * @private
        */
        onClone: function () {
            require(["util/Ajax", "app", "view/ConfirmationView", "i18n!nls/Hub", "view/ToastView"], 
                $.proxy(function (Ajax, App, ConfirmationView, Strings, ToastView) {
                    
                Ajax.CloneDesktop(this.model.get("DesktopId"), function (clonedDesktop) {
                    if (clonedDesktop) {
                        App.UserModel.get("DesktopCollection").add(clonedDesktop);

                        var options = {};

                        options[Strings.CloneSwitchYes] = function () {
                            var current = App.HubView.getActiveDesktopModel();
                            
                            current && current.set("IsActive", false);
                            
                            clonedDesktop.set("IsActive", true);
                        };

                        options[Strings.CloneSwitchNo] = function () {
                            // nothing to do here...
                        };

                        new ConfirmationView({
                            title: Strings.CloneSwitchTitle,
                            message: Strings.CloneSwitchMessage,
                            options: options
                        });
                    } else {
                        new ToastView({
                            message: Strings.CloneFailure,
                            color: ToastView.prototype.ErrorColor,
                            icon: "fa fa-exclamation-circle"
                        });
                    }
                }, this);

                this.close();
                
                this.remove();
            }, this));
        }
    });
});