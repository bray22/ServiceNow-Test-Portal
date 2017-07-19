/*
* IframeAppmodeView.js
*/

define(["view/View"], function (View) {
    "use strict";

    /**
    * a generic appmode for any iframe
    *
    * @class IframeAppmodeView
    * @module IframeAppmodeView
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
            "click .on-close-appmode": "quitAppmode"
        },

        /**
        * init dom and events
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.setElement(this.template("Iframe-Appmode", params));

            $("#content-body").append(this.$el);

            this.onClose = params.onClose || function () {};

            this.$("[data-toggle='tooltip']").tooltip({
                trigger: "hover",
                container: "body"
            });

            require("app").UserModel.once("desktop-change", $.proxy(function () {
                this.quitAppmode(null, true);
            }, this));    
        },

        /**
        * quit out of appmode
        *
        * @param {Event} e
        * @param {Boolean} noCallback - override this from calling the "onClose" callback
        *
        * @method quitAppmode
        * @private
        */
        quitAppmode: function (e, noCallback) {
            this.$el.find("[data-toggle='tooltip']").tooltip("hide");

            this.$el.animate({opacity: 0}, {
                duration: 350,
                complete: $.proxy(function () {
                    this.remove();
                    
                    require("app").Expiration.Start();

                    if (!noCallback) {
                        this.onClose();
                    }
                }, this)
            });
        }
    });
});