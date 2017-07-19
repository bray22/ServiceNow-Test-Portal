/*
* NewsChannelList.js
*/

define(["view/ModalView", "util/Ajax", "i18n!nls/Hub", "jquery"], function (ModalView, Ajax, Strings, $) {
    "use strict";

    /**
    * controls the logic of viewing a news channel
    *
    * @class NewsChannelList
    * @constructor
    * @extends View
    * @namespace view
    * @public
    */
    return ModalView.extend({

        /**
        * initialize the dom
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.events = _.extend({}, this.events, {
                "click .on-toggle-subscribe": "onToggleSubscribe"
            });

            ModalView.prototype.initialize.apply(this, arguments);

            this.setContent($(this.template("News-Channel-Subscriber")));

            Ajax.GetNewsChannelList(function (channelCollection) {
                if (channelCollection) {
                    var $target = this.$(".channel-list-inner");

                    channelCollection.each(function (channelModel) {
                        var $item = $(this.template("News-Channel-Subscribe-Item", channelModel.attributes)).appendTo($target);

                        if (!channelModel.get("Icon")) {
                            $item.find(".subscribe-channel-icon").css("position", "relative")
                                .append(this.template("News-Channel-No-Icon"));
                        }

                        if (params.SubscribedList.where({
                            ChannelId: channelModel.get("ChannelId"),
                            IsSubscribed: true}).length) {
                            $item.addClass("subscribed");
                        }
                    }, this);

                    this.channelCollection = channelCollection;
                } else {
                    require(["view/ToastView"], function (ToastView) {
                        new ToastView({
                            message: Strings.NewsNoChannelList,
                            color: ToastView.prototype.ErrorColor,
                            icon: "fa fa-exclamation-circle"
                        });
                    });
                }
            }, this);
        },

        /**
        * toggle the subscription of the clicked-on channel
        *
        * @method onToggleSubscribe
        * @private
        */
        onToggleSubscribe: function (e) {
            var $target = $(e.target);

            if (!$target.hasClass("news-channel-subscribe-item")) {
                $target = $target.closest(".news-channel-subscribe-item");
            }
                
            var channelId = $target.data("channelid"),
                isSubscribed = $target.hasClass("subscribed");

            $target.toggleClass("subscribed");

            var channelModel = this.channelCollection.where({ChannelId: channelId});

            if (channelModel.length) {
                if (!channelModel[0].get("IsMandatory")) {
                    Ajax.SetNewsSubscription(channelId, !isSubscribed, function (success) {
                        if (!success) {
                            $target.toggleClass("subscribed");
                            require(["view/ToastView"], function (ToastView) {
                                new ToastView({
                                    message: Strings.NewsSubscriptionFailure,
                                    color: ToastView.prototype.ErrorColor,
                                    icon: "fa fa-exclamation-circle"
                                });
                            });
                        }

                    });
                } else {
                    require(["view/ToastView"], function (ToastView) {
                        new ToastView({
                            message: Strings.NewsMandatoryChannel,
                            color: ToastView.prototype.InfoColor,
                            icon: "fa fa-comment-o"
                        });
                    });
                }
            }
        }
    });
});