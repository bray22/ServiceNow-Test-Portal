/*
* ModalView.js
*/

define(["require", "view/View", "jquery", "util/AnimHelpers"], function (require, View, $, AnimHelpers) {
    "use strict";

    var _modalQueue = [];

    function _checkQueue () {
        if (_modalQueue.length) {
            _modalQueue.shift().render();
        }
    }

    function _nullfn () {}

    /**
    * abstract view controlling the shared model logic
    *
    * @class ModalView
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
            "click .on-close": "onClose",
            "click .on-nav-back": "onNavBack",
            "click .on-deeplink": "onDeepLink",
            "click .on-close-deeplink": "onCloseDeepLink",
            "click .on-deeplink-link": "onFollowDeepLink",
            "click .on-deeplink-copy": "onDeeplinkCopy"
        },

        /**
        * init template
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            if (params.customEvents) {
                this.events = $.extend({}, params.customEvents, this.events);
            }

            this.setElement(this.template("Modal-View", params));

            this.params = params;

            this.history = [];

            this.$backdrop = $(this.template("Modal-Backdrop"));

            this.$backdrop.one("click.backdropClose", $.proxy(this.onClose, this));

            this.$el.data("view", this);

            this.closeCallback = params.onClose || _nullfn;

            this.loadCallback = params.onLoad || _nullfn;

            this.setDimensions(params);

            this.setDeepLink(params);

            this.initRender(params);
        },

        /**
        * initialization step, sets the dimensions from argued parameters
        *
        * @param {Object} params - argued from initialization
        *
        * @method setDimensions
        * @private
        */
        setDimensions: function (params) {
            var dimensions = {};

            if (params.width) {
                if (typeof params.width === "number") {
                    params.width = Math.clamp(params.width, 100, window.innerWidth - 100) + "px";
                }
                dimensions.width = params.width;
            }

            if (params.height) {
                if (typeof params.height === "number") {
                    params.height = Math.clamp(params.height, 100, window.innerHeight - 100) + "px";
                }
                dimensions.height = params.height;
            }

            if (params.closeIconText) {
                this.$(".fa-times").removeClass("fa fa-times").text(params.closeIconText);
            }

            this.$el.css(dimensions);
        },

        /**
        * initialization step, initializes the deeplink, if supplied
        *
        * @param {Object} params - argued from initialization
        *
        * @method setDeepLink
        * @private
        */
        setDeepLink: function (params) {
            var debug = require("debug");

            if (params.deepLinkData && params.guid) {
                if (debug) {
                    console.info("ModalView.initialize() - deeplink data suppplied.\n\tguid: %s, data: %o", 
                        params.guid, params.deepLinkData);
                }

                try {
                    this.deepLinkData = JSON.parse(params.deepLinkData);
                    this.guid = params.guid;
                } catch (e) {
                    this.deepLinkData = undefined;
                    if (debug) {
                        console.error("ModalView.initialize() - deeplink data failed to parse.");
                    }
                } finally {
                    this.$(".hub-modal-deeplink").toggle(this.deepLinkData !== undefined);
                }
            }
        },

        /**
        * initialize the render process, considering the possible behaviors of "stacking" argument
        *
        * @param {Object} params - argued from initialization
        *
        * @method initRender
        * @private
        */
        initRender: function (params) {
            var $currentModals = $(".hub-modal"),
                modalOnScreen = !!$currentModals.length,
                debug = require("debug");

            if (!modalOnScreen) {
                this.render();
            } else {
                if (params.stacking === "none") {
                    if (debug) {
                        console.warn("ModalView.initialize() - there is a modal on-screen and stacking is set to none, the modal will not display");
                    }
                } else if (params.stacking === "queue") {
                    if (debug) {
                        console.info("ModalView.initialize() - there is a modal on-screen and stacking is set to queue, this modal will display when the current is closed");
                    }
                    _modalQueue.push(this);
                } else if (params.stacking === "replace") {
                    if (debug) {
                        console.info("ModalView.initialize() - there is a modal on-screen and stacking is set to replace, any queued/displayed modals will be removed");
                    }

                    _modalQueue.clear();

                    var This = this;
                    $currentModals.each(function (index, item) {
                        $(this).data("view").close(index === $currentModals.length -1 ? function () {
                            This.render();
                        } : undefined);
                    });
                } else if (params.stacking === "update") {
                    if (debug) {
                        console.info("ModalView.initialize() - there is a modal on-screen and stacking is set to update, the current modal will be updated to this one");
                    }

                    $currentModals.last().data("view").update(params);
                } else if (params.stacking === "stack") {
                    if (debug) {
                        console.error("ModalView.initialize() - there is a modal on-screen and stacking is set to stack, this modal will be stacked on-top (THIS IS BAD PRACTICE AND SHOULD BE CHANGED)");
                    }

                    this.renderStacked();
                }
            }
        },

        /**
        * render a new modal on top of any others
        *
        * @method renderStacked
        * @private
        */
        renderStacked: function () {
            delete this.$backdrop;

            this.$el.appendTo("body");

            AnimHelpers.ModalFadeScaleIn(undefined, this.$el, function () {
                this.loadCallback();
            }, this);
        },

        /**
        * public method to update this current, on-screen modal to the new parameters
        *
        * @param {Object} params {width, height, title, url}
        *
        * @method update
        * @public
        */
        update: function (params) {
            this.params = params;

            this.$el.addClass("hub-modal-transition");

            this.setDimensions(params);

            if (params.title) {
                this.$el.find(".hub-modal-title").text(params.title);
            }

            if (params.url) {
                var $frame = this.$el.find("iframe");
                if ($frame.length) {
                    if (params.url.indexOf("http") === -1) {
                        require(["util/Environment"], function (Environment) {
                            /*$frame.off("load.navigation").one("load", $.proxy(function () {
                                $frame.on("load.navigation", $.proxy(this.onIframeSrcChange, this));
                            }, this));*/
                            $frame.attr("src", Environment + params.url);
                        });
                    } else {
                        /*$frame.off("load.navigation").one("load", $.proxy(function () {
                            $frame.on("load.navigation", $.proxy(this.onIframeSrcChange, this));
                        }, this));*/
                        $frame.attr("src", params.url);
                    }
                }
            } else if (params.html) {
                this.$el.find(".hub-modal-body-inner").html(params.html);
            }
        },

        /**
        * renders the modal to the dom
        *
        * @method render
        * @private
        */
        render: function () {
            this.$backdrop.appendTo("body");

            this.$el.appendTo("body");

            AnimHelpers.ModalFadeScaleIn(this.$backdrop, this.$el, function () {
                this.loadCallback();
            }, this);
        },

        /**
        * called from dirived children to set the modal's body
        *
        * @param {jQuery || Html} bodyContent - html or jquery selection of what will be the content of this modal
        *
        * @method setContent
        * @protected
        */
        setContent: function (bodyContent) {
            if (bodyContent) {
                this.$(".hub-modal-body-inner").append(bodyContent);
            } else if (require("debug")) {
                console.error("ModalView.setContent(%s) - invalid argument", typeof bodyContent);
            }
        },

        /**
        * called from dirived children to set the modal's footer
        *
        * @param {jQuery || Html} footerContent - html or jquery select of what will be in the footer
        *
        * @method setFooter
        * @protected
        */
        setFooter: function (footerContent) {
            if (footerContent) {
                this.$(".hub-modal-footer").show().append(footerContent);
            } else if (require("debug")) {
                console.error("ModalView.setFooter(%s) - invalid argument", typeof footerContent);
            }
        },

        /**
        * removes the close icon, and removes the backdrop-close handler, 
        * user must interact with content in order to close the modal
        *
        * @method forceInteraction
        * @protected
        */
        forceInteraction: function () {
            this.$(".hub-modal-close").remove();
            this.$backdrop && this.$backdrop.off("click.backdropClose");
        },

        /**
        * toggled via the IframeModalView to turn on the iframe listening logic
        *
        * @param {jQuery} $iframe - the iframe to listen to
        *
        * @method navigation
        * @protected
        */
        navigation: function ($iframe) {
            this.$iframe = $iframe;
            $iframe.on("load.navigation", $.proxy(this.onIframeSrcChange, this));
        },

        /**
        * event listener for when the navigation iframe changes source
        *
        * @method onIframeSrcChange
        * @private
        */
        onIframeSrcChange: function (e) {
            this.params.url = $(e.target).attr("src");
            this.history.push(this.params);
            this.$(".hub-modal-navigation").toggle(this.history.length > 1);
        },

        /**
        * user clicked the nav-back button
        *
        * @method onNavBack
        * @private
        */
        onNavBack: function () {
            this.$iframe.off("load.navigation").one("load", $.proxy(function () {
                this.$iframe.on("load.navigation", $.proxy(this.onIframeSrcChange, this));
            }, this));

            this.history.pop()

            this.update(this.history[this.history.length -1]);

            this.$(".hub-modal-navigation").toggle(this.history.length > 1);
        },

        /**
        * user just clicked on the deeplink icon
        *
        * @method onDeepLink
        * @private
        */
        onDeepLink: function () {
            this.$(".hub-modal-deeplink").addClass("thinking");

            var $current = this.$(".hub-modal-deeplink-msg");

            function _generate () {
                require(["util/Ajax", "view/ToastView", "i18n!nls/Hub"], $.proxy(function (Ajax, ToastView, Strings) {
                    Ajax.GenerateDataDeepLink(this.guid, this.deepLinkData, function (hash) {
                        this.$(".hub-modal-deeplink").removeClass("thinking");

                        if (hash) {
                            var $deeplinkMsg = $(this.template("Modal-Deeplink-Message", {
                                URL: location.origin + "/?dlh=" + hash
                            })).insertBefore(this.$(".hub-modal-body"));

                            $deeplinkMsg.slideDown();
                        } else {
                            new ToastView({
                                message: Strings.ModalDeepLinkError,
                                color: ToastView.prototype.ErrorColor,
                                timer: false,
                                icon: "fa fa-exclamation-circle"
                            });
                        }
                    }, this);
                }, this));
            }

            if ($current.length) {
                $current.slideUp(400, $.proxy(_generate, this));
            } else {
                _generate.call(this);
            }
        },

        /**
        * user clicked the "close deeplink message" icon
        *
        * @method onCloseDeepLink
        * @private
        */
        onCloseDeepLink: function () {
            var $msg = this.$(".hub-modal-deeplink-msg");
            $msg.slideUp(400, function () {
                $msg.remove();
            });
        },

        /**
        * user clicked the deep link url, follow the url in a new tab
        *
        * @method onFollowDeepLink
        * @private
        */
        onFollowDeepLink: function (e) {
            var win = window.open(e.target.innerText, "_blank");

            if (win) {
                win.focus();
            } else {
                require(["util/Util"], function (Util) {
                    Util.NotifyPopupBlocker();
                });
            }
        },

        /**
        * copy the deeplink url to the clip board
        * note: class selector - there can only be one ('should' only be one, but I needed the highlander quote)
        *
        * @method onDeeplinkCopy
        * @private
        */
        onDeeplinkCopy: function () {
            document.querySelector(".deeplink-copy-data").select();
                
            var success = document.execCommand("copy");

            require(["view/ToastView", "i18n!nls/Hub"], function (ToastView, Strings) {
                if (success) {
                    new ToastView({
                        color: ToastView.prototype.InfoColor,
                        message: Strings.ModalDeepLinkCopySuccess,
                        icon: "fa fa-files-o",
                        timer: 2000
                    });
                } else {
                    new ToastView({
                        color: ToastView.prototype.ErrorColor,
                        message: Strings.ModalDeepLinkCopyFailure,
                        icon: "fa fa-files-o"
                    });
                }
            });
        },

        /**
        * user clicked the close button
        *
        * @param {Function} onComplete - optional argument internally used to callback when close animation completes
        *
        * @method onClose
        * @private
        */
        onClose: function (onComplete) {
            AnimHelpers.ModalFadeScaleOut(this.$backdrop, this.$el, function () {
                this.remove();
                this.$backdrop && this.$backdrop.remove();
                this.closeCallback();
                onComplete && typeof onComplete === "function" && onComplete();
                _checkQueue();
            }, this);
        },

        /**
        * proxy to the private 'onClose' method
        *
        * @param {Function} onComplete - optional argument used to callback when close animation completes
        *
        * @method close
        * @public
        */
        close: function (onComplete) {
            this.onClose(onComplete);
        }
    });
});