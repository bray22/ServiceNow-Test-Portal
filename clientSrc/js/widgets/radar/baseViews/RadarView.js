/*
* RadarView.js
*/

define([
"require", 
"view/View", 
"widgets/radar/util/RadarAjax", 
"text!widgets/radar/templates.html", 
"moment",
"app",
"underscore",
"jquery"], 
function (
require, 
View, 
RadarAjax, 
templates, 
moment, 
App, 
_, 
$) {

    "use strict";

    /**
    * provides parent functionality shared among all radar views
    *
    * @class RadarView
    * @extends View
    * @constructor
    * @namespace radar
    * @public
    */
    return View.extend({

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
            $target.append(this.template("Radar-Loading", null, null, templates));

            var $loader = $target.find(".radar-loading");

            $loader.css("opacity", 0);

            $loader.animate({opacity: 1}, {
                duration: 250,
                complete: $.proxy(function () {
                    callback && callback.call(this);
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
            var $loader = this.$(".radar-loading");
            
            if ($loader.length) {
                $loader.animate({opacity: 0}, {
                    duration: 250,
                    complete: $.proxy(function () {
                        $loader.remove();
                        callback && callback.call(this);
                    }, this)
                });
            } else {
                callback.call(this);
            }
        },

        /**
        * append the timestamp UI to the argued element
        *
        * @param {String} chart - chart-type
        *
        * @method polltime
        * @protected
        */
        polltime: function (chart) {
            this.$el.append(this.template("Widget-With-Polltime", null, null, templates));

            this.$origEl = $(this.$el);

            this.setElement(this.$el.find(".radar-program-widget-chart-content-inner"));

            RadarAjax.GetPolltime(chart, function (data) {
                if (data && data.length) {
                    this.$origEl.find(".radar-program-widget-polltime-inner").append(this.template("Polltime", {
                        Timestamp: moment(data[0].UpdateTime).format("MMM Do, hh:mm a")
                    }, null, templates));
                } else {
                    if (App.HubModel.get("Debug")) {
                        console.warn("No Radar polltime data returned: '%s'", chart);
                    }
                    this.$origEl.find(".radar-program-widget-polltime-inner").hide();
                }
            }, this);
        },

        /**
        * overriden backbone.remove() - since we changed what this.$el internally points to
        *
        * @method remove
        * @protected
        */
        remove: function () {
            if (this.$origEl) {
                this.$origEl.remove();
            }
            View.prototype.remove.apply(this, arguments);
        },

        /**
        * replaces the widget's content with an error icon
        *
        * @method displayError
        * @protected
        */
        displayError: function (msg) {
            this.$el.children().remove();
            this.$el.append(this.template("Radar-Widget-Error", {
                Message: msg || ""
            }, null, templates));
        }
    });
});