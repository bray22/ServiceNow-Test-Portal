/*
* ToastView.js
*/

define(["view/View"], function (View) {
    "use strict";

    /**
    * displays a simple toast-message
    *
    * @class ToastView
    * @module ToastView
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
            "click .hb-toast-close": "onDismiss"
        },

        /**
        * color used for 'successful' messages
        * access this property through the prototype, "ToastView.prototype.SuccessColor"
        *
        * @property SuccessColor
        * @default #AEF2AC
        * @readonly
        * @public
        */
        SuccessColor: "#AEF2AC",

        /**
        * color used for 'informational' messages
        * access this property through the prototype, "ToastView.prototype.InfoColor"
        *
        * @property InfoColor
        * @default #ACD3F2
        * @readonly
        * @public
        */
        InfoColor: "#ACD3F2",

        /**
        * color used for 'warning' messages
        * access this property through the prototype, "ToastView.prototype.WarningColor"
        *
        * @property WarningColor
        * @default #F2E5AC
        * @readonly
        * @public
        */
        WarningColor: "#F2E5AC",

        /**
        * color used for 'error' messages
        * access this property through the prototype, "ToastView.prototype.ErrorColor"
        *
        * @property ErrorColor
        * @default #F2ACBB
        * @readonly
        * @public
        */
        ErrorColor: "#F2ACBB",

        /**
        * initialize template
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.setElement(this.template("Toast-Message", {
                Text: params.message || ""
            }));

            if (params.icon) {
                this.$el.find(".hb-toast-icon").addClass(params.icon);
            }

            if (params.color) {
                this.$el.css("background-color", params.color);
            }

            this.$el.prependTo($("#toast-container"));

            this.$el.animate({opacity: 1}, {duration: 300});

            if (params.timer !== false) {
                setTimeout($.proxy(function () {
                    this.onDismiss();
                }, this), typeof params.timer === "number" ? params.timer : 10000);
            }
        },

        /**
        * user clicked the dismiss button, or the timer has called this
        *
        * @method onDismiss
        * @private
        */
        onDismiss: function () {
            if (!this.isDismissed) {
                this.isDismissed = true;

                this.$el.animate({opacity: 0}, {
                    duration: 300,
                    complete: $.proxy(function () {
                        this.$el.slideUp(300, $.proxy(function () {
                            this.remove();
                        }, this));
                    }, this)
                });
            }
        }
    });
});