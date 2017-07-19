/*
* ConfirmationView.js
*/

define(["view/ModalView", "jquery"], function (ModalView, $) {
    "use strict";

    /**
    * a simple modal-view to wrap confirmation dialog logic
    *
    * @class ConfirmationView
    * @module ConfirmationView
    * @constructor
    * @extends ModalView
    * @namespace view
    * @public
    */
    return ModalView.extend({

        /**
        * init dom and events
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            ModalView.prototype.initialize.apply(this, arguments);

            this.setContent(this.template("Confirmation-Dialog", {
                Message: params.message
            }));

            this.$(".hub-modal-body-inner").addClass("confirmation-modal");

            for (var i in params.options) {
                var $opt = $(this.template("Confirmation-Dialog-Button", {
                    ButtonText: i
                }));

                $opt.on("click.selectOption", params.options[i]);

                this.setFooter($opt);
            }

            if (params.hideCloseIcon) {
                this.forceInteraction();
            }
        }
    });
});