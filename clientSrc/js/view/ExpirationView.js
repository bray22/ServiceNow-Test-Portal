/*
* ExpirationView.js
*/

define(["view/View", "jquery"], function (View, $) {
    "use strict";

    /**
    * controls the client-expiration UI
    *
    * @class ExpirationView
    * @extends View
    * @namespace view
    * @constructor
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
            "click #expiration-reload": function () {
                document.location.reload(true);
            }
        },

        /**
        * init the dom
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.setElement($(this.template("Client-Expiration")));
            this.$el.appendTo("body");
            $("#desktop").addClass("expiration-blur");
            $("iframe").attr("src", "about:blank");
        }
    });
});