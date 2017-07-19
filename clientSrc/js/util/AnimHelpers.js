/*
* AnimHelpers.js
*/

define(["jquery"], function ($) {
    "use strict";

    /**
    * Module containing generalized animation helpers
    *
    * @module AnimHelpers
    * @public
    * @type Object
    * @namespace util
    */
    return {

        /**
        * animates the argued element 'in'
        * opacity from 0 to 1
        * scale from 1.2 to 1
        *
        * @param {jQuery} $el - the element to animate in
        * @param {Function} cb - on complete callback
        * @param {Object} context
        *
        * @method FadeScaleIn
        * @public
        */
        FadeScaleIn: function ($el, cb, context) {
            $el.removeClass("fade-scale-out").addClass("fade-scale-in");

            $el.one("webkitAnimationEnd animationend", function () {
                cb.call(context || window);
            });
        },

        /**
        * animates the argued element 'in', specific for modal
        * opacity from 0 to 1
        * scale from 1.2 to 1
        *
        * @param {jQuery} $el - the element to animate in
        * @param {Function} cb - on complete callback
        * @param {Object} context
        *
        * @method FadeScaleIn
        * @public
        */
        ModalFadeScaleIn: function ($backdrop, $el, cb, context) {
            $backdrop.animate({opacity: 0.4}, {duration: 300});

            $el.removeClass("modal-fade-scale-out").addClass("modal-fade-scale-in");

            $el.one("webkitAnimationEnd animationend", function () {
                $el.addClass("material-dropshadow");
                cb && cb.call(context || window);
            });
        },

        /**
        * animates the argued element 'out'
        * opacity from 1 to 0
        * scale from 1 to 1.2
        *
        * @param {jQuery} $el - the element to animate out
        * @param {Function} cb - on complete callback
        * @param {Object} context
        *
        * @method FadeScaleOut
        * @public
        */
        FadeScaleOut: function ($el, cb, context) {
            $el.removeClass("fade-scale-in").addClass("fade-scale-out");

            $el.one("webkitAnimationEnd animationend", function () {
                cb.call(context || window);
            });
        },

        /**
        * animates the argued element 'out', specific for modal
        * opacity from 1 to 0
        * scale from 1 to 1.2
        *
        * @param {jQuery} $el - the element to animate out
        * @param {Function} cb - on complete callback
        * @param {Object} context
        *
        * @method FadeScaleOut
        * @public
        */
        ModalFadeScaleOut: function ($backdrop, $el, cb, context) {
            $backdrop.animate({opacity: 0}, {duration: 300});

            $el.removeClass("modal-fade-scale-in material-dropshadow").addClass("modal-fade-scale-out");

            $el.one("webkitAnimationEnd animationend", function () {
                cb.call(context || window);
            });
        },

        /**
        * animates the loading page out, assumes it is currently visible
        *
        * @param {Function} cb - on complete callback
        * @param {Object} context
        *
        * @method LoadingPageOut
        * @public
        */
        LoadingPageOut: function (cb, context) {
            var $loadingPage = $(".hub-page[data-page='loading']");
            $(".hub-page[data-page='desktop']").show();

            // wait a sec for iframes, otherwise you get really choppy animation
            setTimeout(function () {
                $loadingPage.find("#loading-bkg, #loading-slider").animate({opacity: 0}, {
                    duration: 2000,
                    complete: function () {
                        var $loadingContent = $loadingPage.find("#loading-content");
                        $loadingContent.addClass("loading-anim-out").one("webkitAnimationEnd animationend", function () {
                            $(".hub-page[data-page='loading']").remove();
                            $loadingContent.removeClass("loading-anim-out");
                            cb.call(context || window);
                        });
                    }
                });
            }, 1000);
        },

        /**
        * shakes an element
        *
        * @param {jQuery} $el
        * @param {Function} cb - on complete callback
        * @param {Object} context
        *
        * @method Shake
        * @public
        */
        Shake: function ($el, cb, context) {
            $el.addClass("error-shake").one("webkitAnimationEnd animationend", function () {
                $el.removeClass("error-shake");
                cb.call(context || window);
            });
        }
    };
});