/*
* BalloonView.js
*/

define(["view/View", "require", "jquery"], function (View, require, $) {
    "use strict";

    /**
    * creates a floating balloon at the argued location/orientation
    *
    * constructor parameters:
    *
    * @param {Number} x - absolute page position X axis
    * @param {Number} y - absolute page position Y axis,
    * @param {String} message - the balloon message to be displayed
    * @param {String} orientation - "top|bottom|left|right"
    * @param {String} title - (optional) a title to display inside the balloon
    * @param {Boolean} close - (optional) displays the close icon
    * @param {String} closeIconText - changes the 'X' close-icon to the text you argue
    * @param {Function} onClose - (optional) callback made when the balloon closes
    *
    * @class BalloonView
    * @extends View
    * @namespace view
    * @constructor
    * @public
    */
    return View.extend({

        events: {
            "click .on-close": "clear"
        },

        /**
        * create the DOM
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            if (typeof params.x === "number" || typeof params.y === "number") {
                this.setElement(this.template("Hub-Balloon", {
                    Message: params.message,
                    Title: params.title || ""
                }));

                this.orientation = params.orientation = (params.orientation || "top");

                this.onClose = params.onClose || function () {};

                if (params.close) {
                    this.$(".hub-balloon-close-icon").show();
                }

                if (params.title) {
                    this.$(".hub-balloon-title").show();
                }

                if (!params.close && !params.title) {
                    this.$(".hub-balloon-header").hide();
                }

                if (params.closeIconText) {
                    this.$(".hub-balloon-close-icon").removeClass("fa fa-times").text(params.closeIconText);
                }

                this.$("[data-orient]").hide();

                this.$("[data-orient='" + params.orientation + "']").show();

                this.positionAndRender(params.x, params.y, params.orientation);
            } else if (require("app").HubModel.get("Debug")) {
                console.warn("BalloonView.initialize(x: %s, y: %s) - position is mandatory", 
                    params.x, params.y);
            }
        },

        /**
        * assign position, dynamically based on orientation and argued position
        *
        * @param {Number} x - aboslute X axis
        * @param {Number} y - absolute Y axis
        * @param {String} orientation - "left|top|right|bottom"
        *
        * @method positionAndRender
        * @private
        */
        positionAndRender: function(x, y, orientation) {

            // invisibly render the balloon so we can get dimensions first
            this.$el.css("opacity", 0).appendTo("body");

            // need to wait for the browser to draw in order to get accurate dimensions
            setTimeout($.proxy(function () {

                var location = {left: "", top: ""},
                    dimensions = {
                        width: this.$el.width(),
                        height: this.$el.height()
                    };

                // remove temporary stuff we added for our dimensional-draw
                this.$el.detach().removeAttr("style");

                if (orientation === "top") {

                    location.left = (x - dimensions.width * 0.5) + "px";
                    location.top = (y - dimensions.height) + "px";

                } else if (orientation === "bottom") {

                    location.left = (x - (dimensions.width * 0.5)) + "px";
                    location.top = y + "px";

                } else if (orientation === "left") {

                    location.left = (x - dimensions.width) + "px";
                    location.top = (y + dimensions.height * 0.5) + "px";

                } else if (orientation === "right") {

                    location.left = (x + dimensions.width) + "px";
                    location.top = (y + dimensions.height * 0.5) + "px";

                }

                this.$el.css(location)
                    .find(".hub-balloon-inner")
                    .addClass(this.bubbleClass[orientation])
                    .end()
                    .appendTo("body");

            }, this), 1);
        },

        /**
        * defines the bubble animation class used with different orientations
        *
        * @property bubbleClass
        * @type {Object}
        * @private
        */
        bubbleClass: {
            top: "anim-bubble-up",
            bottom: "anim-bubble-down",
            left: "anim-bubble-left",
            right: "anim-bubble-right"
        },

        /**
        * defines the bubble-out animation class used with different orientations
        *
        * @property antiBubbleClass
        * @type {Object}
        * @private
        */
        antiBubbleClass: {
            top: "anim-anti-bubble-up",
            bottom: "anim-anti-bubble-down",
            left: "anim-anti-bubble-left",
            right: "anim-anti-bubble-right"
        },

        /**
        * animate the balloon out, optional callback when complete
        *
        * @method clear
        * @public
        */
        clear: function () {
            this.$el.find(".hub-balloon-inner")
                .removeClass(this.bubbleClass[this.orientation])
                .addClass(this.antiBubbleClass[this.orientation])
                .on("webkitAnimationEnd animationend", $.proxy(function () {
                    this.remove();
                    this.onClose();
                }, this));
        }
    });
});