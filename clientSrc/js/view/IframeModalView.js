/*
* IframeModalView.js
*/

define(["view/ModalView", "jquery"], function (ModalView, $) {
    "use strict";

    /**
    * a generic modal with an iframe
    *
    * @class IframeModalView
    * @module IframeModalView
    * @constructor
    * @extends ModalView
    * @namespace view
    * @public
    */
    return ModalView.extend({

        /**
        * initialize a modal, set title and iframe url
        *
        * @method initialize
        * @private
        */
        initialize: function (params) {
            ModalView.prototype.initialize.apply(this, arguments);

            this.setContent(this.template("Iframe-Modal-Content", {
                Url: params.url
            }));

            this.navigation(this.$("iframe"));
        }
    });
});