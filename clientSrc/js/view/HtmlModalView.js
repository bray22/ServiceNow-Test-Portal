/*
* HtmlModalView.js
*/

define(["view/ModalView", "jquery"], function (ModalView, $) {
    "use strict";

    /**
    * A modal for those who those who want to display pre-built html
    *
    * @class HtmlModalView
    * @module HtmlModalView
    * @namespace view
    * @constructor
    * @extends ModalView
    * @public
    */
    return ModalView.extend({

        /**
        * initialize dom 
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            ModalView.prototype.initialize.apply(this, arguments);

            this.setContent(params.html);
        }
    });
});