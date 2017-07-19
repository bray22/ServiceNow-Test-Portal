/*
* ChartView.js
*/

define(["view/View", "text!widgets/cateams/templates.html"], function (View, templates) {
    "use strict";

    /**
    * provides parent functionality common to all CA-Team chart views
    *
    * @class ChartView
    * @extends View
    * @constructor
    * @namespace cateams
    * @public
    */
    return View.extend({

        /**
        * display an error icon on the DOM when errors occur
        *
        * @method displayError
        * @protected
        */
        displayError: function (msg) {
            this.$el.append(this.template("CATeam-Error", {
                Message: msg
            }, null, templates));
        },

        /**
        * display the loading spinner
        *
        * @param {jQuery} $target
        * @param {Function} calback
        *
        * @method showLoading
        * @private
        */
        showLoading: function ($target, callback) {
            $target.append(this.template("CATeam-Loading", null, null, templates));

            var $loader = $target.find(".cateam-loading");

            $loader.css("opacity", 0);

            $loader.animate({opacity: 1}, {
                duration: 250,
                complete: $.proxy(function () {
                    callback.call(this);
                }, this)
            });
        },

        /**
        * hide/remove the loading spinner
        *
        * @param {Function} callback
        *
        * @method hideLoading
        * @private
        */
        hideLoading: function (callback) {
            var $loader = this.$(".cateam-loading");
            
            if ($loader.length) {
                $loader.animate({opacity: 0}, {
                    duration: 250,
                    complete: $.proxy(function () {
                        $loader.remove();
                        callback.call(this);
                    }, this)
                });
            } else {
                callback.call(this);
            }
        }
    });
});