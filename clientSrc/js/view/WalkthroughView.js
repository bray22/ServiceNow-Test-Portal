/*
* WalkthroughView.js
*/

define(["view/View", "i18n!nls/Hub", "view/BalloonView", "jquery"], function (View, Strings, BalloonView, $) {
    "use strict";

    /**
    * controls all aspects of the new-user walkthrough
    *
    * @class WalkthroughView
    * @constructor
    * @extends View
    * @namespace view
    * @public
    */
    return View.extend({

        /**
        * initialize the walkthrough
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            if (params.step) {
                this.stepIndex = parseInt(params.step, 10);
            }

            require(["view/ConfirmationView"], $.proxy(function (ConfirmationView) {
                var options = {};

                options[Strings.Walkthrough_SkipOption] = function () {};

                options[Strings.Walkthrough_BeginOption] = $.proxy(this.onBeginWalkthrough, this);

                new ConfirmationView({
                    title: Strings.Walkthrough_Title,
                    message: Strings.Walkthrough_Message,
                    options: options,
                    width: 500,
                    height: 177,
                    hideCloseIcon: true
                });
            }, this));
        },

        /**
        * silly user agreed to begin the walkthrough.. fool! I WILL DEVOUR YOU!
        *
        * @method onBeginWalkthrough
        * @private
        */
        onBeginWalkthrough: function () {
            this.steps[this.stepIndex++].call(this, this.onNextStep);
        },

        /**
        * the user completed a step, good for freakin' you.
        *
        * @method onNextStep
        * @private
        */
        onNextStep: function () {
            if (this.stepIndex < this.steps.length) {
                this.steps[this.stepIndex++].call(this, this.onNextStep);
            }
        },

        /**
        * defines what index within all steps the user is currently at
        *
        * @property stepIndex
        * @type {Number}
        * @private
        */
        stepIndex: 0,

        /**
        * defines all of the walkthrough step implementations
        *
        * @property steps
        * @type {Array}
        * @private
        */
        steps: [

            // init the first step "my information"
            function step1 (onComplete) {
                require(["view/IframeModalView", "util/Environment", "app"], 
                    $.proxy(function (IframeModalView, Environment, App) {

                    var balloon,
                        userBalloon,
                        modal = new IframeModalView({
                            title: Strings.MyInformationTitle,
                            url: Environment + "/MyInfo.aspx?UserId=" + App.UserModel.get("UserId"),
                            width: 566,
                            height: 443,
                            closeIconText: Strings.Walkthrough_NextStep,
                            onClose: $.proxy(function () {
                                balloon.clear();
                                balloon = null;

                                userBalloon.clear();
                                userBalloon = null;

                                onComplete.call(this);
                            }, this),
                            onLoad: function () {
                                var position = this.$el.offset(),
                                    $userIcon = $("#hub-navbar-user"),
                                    userPosition = $userIcon.offset();

                                balloon = new BalloonView({
                                    message: Strings.Walkthrough_Step1_Message,
                                    x: position.left + this.$el.width() * 0.5,
                                    y: position.top,
                                    orientation: "top"
                                });

                                userBalloon = new BalloonView({
                                    message: Strings.Walkthrough_Step1_UserBalloonMessage,
                                    orientation: "left",
                                    x: userPosition.left + 20,
                                    y: userPosition.top - 20 + $userIcon.height() * 0.5
                                });
                            }
                        });
                }, this));
            },

            // init the second step, alert subscriptions
            function step2 (onComplete) {
                require(["view/IframeModalView", "util/Environment", "app"], 
                    $.proxy(function (IframeModalView, Environment, App) {

                    var balloon,
                        modal = new IframeModalView({
                            title: Strings.AlertMenuManageSubscriptionsTitle,
                            url: Environment + "/AlertsManager.aspx?UserId=" + App.UserModel.get("UserId"),
                            closeIconText: Strings.Walkthrough_NextStep,
                            onClose: $.proxy(function () {
                                balloon.clear();
                                balloon = null;
                                onComplete.call(this);
                            }, this),
                            onLoad: function () {
                                var position = this.$el.offset();

                                balloon = new BalloonView({
                                    message: Strings.Walkthrough_Step2_Message,
                                    x: position.left + this.$el.width() * 0.5,
                                    y: position.top,
                                    orientation: "top"
                                });
                            }
                        });
                }, this));
            },

            // init the third step, news channel subscriptions
            function step3 (onComplete) {
                require(["view/NewsChannelListView", "app", "collection/NewsCollection"], 
                    $.proxy(function (NewsChannelListView, App, NewsCollection) {

                    var balloon,
                        channelList = new NewsChannelListView({
                            title: Strings.NewsSubscribeChannels,
                            SubscribedList: App.HubView.NewsView.model,
                            closeIconText: Strings.Walkthrough_NextStep,
                            onClose: $.proxy(function () {
                                App.HubView.NewsView.trigger("refresh");
                                balloon.clear();
                                balloon = null;
                                onComplete.call(this);
                            }, this),
                            onLoad: function () {
                                var $target = this.$el,
                                    position = $target.offset();

                                balloon = new BalloonView({
                                    message: Strings.Walkthrough_Step3_Message,
                                    x: position.left + $target.width() * 0.5,
                                    y: position.top,
                                    orientation: "top"
                                });
                            }
                        });
                }, this));
            },

            // init the fourth step, desktop menu
            function step4 (onComplete) {
                var $target = $("#hub-navbar-desktops"),
                    position = $target.offset();

                new BalloonView({
                    message: Strings.Walkthrough_Step4_Message,
                    title: Strings.Walkthrough_Step4_Title,
                    x: position.left + $target.width() * 0.5,
                    y: position.top + $target.height(),
                    orientation: "bottom",
                    close: true,
                    onClose: $.proxy(onComplete, this),
                    closeIconText: Strings.Walkthrough_NextStep
                });
            },

            // init the fifth step, search-bar
            function step5 (onComplete) {
                var $target = $("#navbar-search"),
                    position = $target.offset();

                new BalloonView({
                    message: Strings.Walkthrough_Step5_Message,
                    title: Strings.Walkthrough_Step5_Title,
                    x: position.left + $target.width() * 0.5,
                    y: position.top + $target.height() + 13,
                    orientation: "bottom",
                    close: true,
                    onClose: $.proxy(onComplete, this),
                    closeIconText: Strings.Walkthrough_NextStep
                });
            },

            // init the sixth step, content-library
            function step6 (onComplete) {
                var $target = $("#hub-navbar-library"),
                    position = $target.offset();

                new BalloonView({
                    message: Strings.Walkthrough_Step6_Message,
                    title: Strings.Walkthrough_Step6_Title,
                    x: position.left + $target.width() * 0.5,
                    y: position.top + $target.height(),
                    orientation: "bottom",
                    close: true,
                    onClose: $.proxy(onComplete, this),
                    closeIconText: Strings.Walkthrough_NextStep
                });
            },

            // help and information
            function step7 (onComplete) {
                var $target = $("#hub-navbar-help"),
                    position = $target.offset();

                new BalloonView({
                    message: Strings.Walkthrough_Step7_Message,
                    title: Strings.Walkthrough_Step7_Title,
                    x: position.left + $target.width() * 0.5,
                    y: position.top + $target.height(),
                    orientation: "bottom",
                    close: true,
                    onClose: $.proxy(onComplete, this),
                    closeIconText: Strings.Walkthrough_NextStep
                });
            },

            // init the seventh step, alerts and notifications
            function step8 (onComplete) {
                var $target = $("#hub-navbar-alerts"),
                    position = $target.offset();

                new BalloonView({
                    message: Strings.Walkthrough_Step8_Message,
                    title: Strings.Walkthrough_Step8_Title,
                    x: position.left + $target.width() * 0.5,
                    y: position.top + $target.height(),
                    orientation: "bottom",
                    close: true,
                    onClose: $.proxy(onComplete, this),
                    closeIconText: Strings.Walkthrough_NextStep
                });
            },

            // init the eighth step, news and announcements
            function step9 (onComplete) {
                var $target = $("#hub-navbar-news"),
                    position = $target.offset();

                new BalloonView({
                    message: Strings.Walkthrough_Step9_Message,
                    title: Strings.Walkthrough_Step9_Title,
                    x: position.left + $target.width() * 0.5,
                    y: position.top + $target.height(),
                    orientation: "bottom",
                    close: true,
                    onClose: $.proxy(onComplete, this),
                    closeIconText: Strings.Walkthrough_NextStep
                });
            },

            // create a ticket
            function step10 (onComplete) {
                var $target = $("#hub-navbar-incident"),
                    position = $target.offset();

                new BalloonView({
                    message: Strings.Walkthrough_Step10_Message,
                    title: Strings.Walkthrough_Step10_Title,
                    x: position.left + $target.width() * 0.5,
                    y: position.top + $target.height(),
                    orientation: "bottom",
                    close: true,
                    onClose: $.proxy(onComplete, this),
                    closeIconText: Strings.Walkthrough_NextStep
                });
            },

            // init the ninth step, widget usage
            function step11 (onComplete) {
                require(["view/HtmlModalView", "owl", "jquery"], $.proxy(function (HtmlModalView, owl, $) {
                    new HtmlModalView({
                        title: Strings.Walkthrough_Step11_Title,
                        html: this.template("Walkthrough-Widgets"),
                        closeIconText: Strings.Walkthrough_NextStep,
                        width: 500,
                        height: 400,
                        onClose: $.proxy(onComplete, this),
                        onLoad: function () {
                            this.$("[data-src]").each(function () {
                                var $this = $(this);
                                $this.attr("src", $this.data("src"));
                            });

                            this.$(".owl-carousel").show().owlCarousel({ // the owl says hoot.
                                items: 1,
                                nav: true
                            });
                        }
                    });
                }, this));
            },

            // init the final step, closing remarks
            function step12 (onComplete) {
                require(["view/ConfirmationView"], $.proxy(function (ConfirmationView) {
                    var options = {};

                    options[Strings.Walkthrough_Step12_Button] = $.proxy(onComplete, this);

                    new ConfirmationView({
                        title: Strings.Walkthrough_Step12_Title,
                        message: Strings.Walkthrough_Step12_Message,
                        options: options,
                        hideCloseIcon: true,
                        width: 500,
                        height: 350
                    });
                }, this));
            },

            function step13 (onComplete) {
                // TODO: FIREWORKS!!!
            }
        ]
    });
});