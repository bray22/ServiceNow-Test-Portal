/*
* NewsView.js
*/

define([
"require", 
"view/View", 
"util/Ajax", 
"util/AnimHelpers", 
"jquery", 
"i18n!nls/Hub", 
"underscore"], 
function (
require, 
View, 
Ajax, 
AnimHelpers, 
$, 
Strings, 
_) {
    
    "use strict";

    /**
    * controls all aspects of the news menu
    *
    * @class NewsView
    * @constructor
    * @namespace view
    * @extends View
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
            "click .on-close": "onHide",
            "click .on-view-channel": "onViewChannel",
            "click .on-view-article": "onViewArticle",
            "change #news-select-all": "onSelectAll",
            "click .on-mark-all": "onMarkAll",
            "click .on-new-channel": "onCreateChannel",
            "click .on-manage-channels": "onManageChannels",
            "click .on-subscribe": "onSubscribeChannels",
            "click .on-new-article": "onNewArticle",
            "input .on-article-search": "onArticleSearch",
            "click .on-previous-page": "onPreviousPage",
            "click .on-select-page": "onSelectPage",
            "click .on-next-page": "onNextPage"
        },

        /**
        * init dom, events, do jumping jacks, etc...
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.populateChannels();

            this.$icon = params.$countIcon;

            this.updateTotalCount();

            this.updateChannelCount();

            this.$(".on-view-channel").eq(0).click();

            this.on("show", this.onShow, this);

            this.on("hide", this.onHide, this);
            
            this.on("toggle", function (cb) {
                this.trigger(this.isVisible ? "hide" : "show", cb);
            }, this);

            this.model.on("add", this.onAddChannel, this);

            this.model.on("refresh", this.refreshChannels, this);

            this.$("[data-toggle='tooltip']").tooltip({
                show: true,
                trigger: "hover",
                container: "body"
            });
        },

        /**
        * called on collection.add() - a new channel was added (through the heartbeat)
        *
        * @method addChannel
        * @private
        */
        onAddChannel: function (channelModel) {
            this.$("#news-channel-list-list").append(this.template("Channel-List-Item", channelModel.attributes));

            this.updateChannelCount();

            this.updateTotalCount();

            channelModel.get("ArticleCollection").on("add", this.onAddArticle, this);
        },

        /**
        * callback when an article is added through the heartbeat
        *
        * @method onAddArticle
        * @private
        */
        onAddArticle: function (articleModel, articleCollection) {
            var acitveChannelId = this.$(".active-channel").data("channelid");

            if (articleModel.get("ChannelId") === acitveChannelId) {
                this.populateArticles(articleCollection.models);
            }

            this.updateChannelCount();

            this.updateTotalCount();
        },

        /**
        * determines how many unread articles are badged on the navbar
        *
        * @method updateTotalCount
        * @private
        */
        updateTotalCount: function () {
            var total = 0;

            this.model.each(function (channel) {
                total += channel.get("ArticleCollection").where({Status: "N"}).length;
            });

            this.$icon.parent().toggle(total > 0);

            this.$icon.text(total > 99 ? "99+" : total);
        },

        /**
        * update the count badges for each channel
        *
        * @method updateChannelCount
        * @private
        */
        updateChannelCount: function () {
            this.model.each(function (channel) {
                var $el = this.$(".news-channel-list-item[data-channelid='" + channel.get("ChannelId") + "']"),
                    count = channel.get("ArticleCollection").where({Status: "N"}).length;

                $el.find(".news-channel-count")
                    .text(count).end()
                    .toggleClass("zero", count === 0);
            }, this);
        },

        /**
        * populate the side-bar list of subscribed channels
        *
        * @method populateChannels
        * @private
        */
        populateChannels: function () {
            var $target = this.$("#news-channel-list-list");

            this.model.each(function (channelModel) {
                $target.append(this.template("Channel-List-Item", channelModel.attributes));
                channelModel.get("ArticleCollection").on("add", this.onAddArticle, this);
            }, this);
        },

        /**
        * request for a new list of channels, and re-render the channel list
        *
        * @method refreshChannels
        * @private
        */
        refreshChannels: function () {
            require(["util/Ajax", "app"], $.proxy(function (Ajax, App) {
                var activeId = this.$(".news-channel-list-item.active-channel").data("channelid");

                Ajax.GetNews(function (NewsCollection) {
                    this.model.set(NewsCollection.toJSON());

                    this.$(".news-channel-list-item, .news-article-item").remove();

                    this.populateChannels();

                    this.updateChannelCount();

                    this.updateTotalCount();

                    if (activeId) {
                        this.onViewChannel({
                            target: this.$(".news-channel-list-item[data-channelid='" + activeId + "']")[0]
                        });
                    }
                }, this);
            }, this));
        },

        /**
        * user clicked a channel - render the article panel
        *
        * @method onViewChannel
        * @private
        */
        onViewChannel: function (e) {
            var $listItem = $(e.target).closest(".news-channel-list-item"),
                channelId = $listItem.data("channelid"),
                channelModel = this.model.where({ChannelId: channelId});

            if (channelModel.length) {
                this.$("#news-select-all").prop("checked", "");
                this.$(".active-channel").removeClass("active-channel");
                $listItem.addClass("active-channel");
                this.populateArticles(channelModel[0].get("ArticleCollection").models);
            } else {
                require(["view/ToastView"], function (ToastView) {
                    new ToastView({
                        message: Strings.NewsChannelNotFound,
                        color: ToastView.prototype.ErrorColor,
                        icon: "fa fa-exclamation-triangle"
                    });
                });
            }
        },

        /**
        * populate the list of articles
        *
        * @param {NewsArticleModel[]} articleList
        *
        * @method populateArticles
        * @private
        */
        populateArticles: function (articleList) {
            var $target = this.$("#news-content-body-content"),
                pageList = [$(this.template("News-Page-Element"))],
                $page = pageList[0],
                pageSize = require("app").HubModel.get("NewsPageSize"),
                current = 0;

            this.$(".news-article-page, .news-pagination").remove();

            _.each(articleList, function (articleModel) {
                var $articleItem = $(this.template("News-Article-Item", articleModel.attributes)).appendTo($page);

                articleModel.on("change:Status", function (model, val) {
                    $articleItem.data("status", val).attr("data-status", val);
                });

                current++;

                if (current >= pageSize) {
                    current = 0;

                    $page = $(this.template("News-Page-Element"));

                    pageList.push($page);
                }
            }, this);

            if (pageList.length > 1) {
                this.createPagination(pageList);
                this.pageList = pageList;
            } else {
                if (this.$pagination) {
                    this.$pagination.remove();
                }

                $(window).off("resize.newsPagination");
                this.pageList = undefined;
            }

            $target.append(pageList[0]);
        },

        /**
        * renders the pagination buttons on the content-footer
        *
        * @param {jQuery[]} pageList
        *
        * @method createPagination
        * @private
        */
        createPagination: function(pageList) {
            var $pagination = $(this.template("News-Pagination-Container")),
                $target = $pagination.find(".news-pagination-icon-list"),
                count = pageList.length,
                i = 0;

            if (this.$pagination) {
                this.$pagination.remove();
            }

            this.$pagination = $pagination;

            for (; i < count; i++) {
                $(this.template("News-Pagication-Icon", {
                    Index: i
                })).toggleClass("current", i === 0).appendTo($target);
            }

            $pagination.find(".news-page-count-current").text(1).end()
                .find(".news-page-count-total").text(count);

            $pagination.find(".news-pagination-prev").addClass("disabled");

            this.$("#news-content-footer-inner").append($pagination);

            $(window).on("resize.newsPagination", $.proxy(function () {
                this.togglePaginationSize();
            }, this));

            this.togglePaginationSize();
        },

        /**
        * determine if the pagination should be considered "small-mode"
        * this is toggled when there's too many buttons on the bottom to fit
        *
        * @method togglePaginationSize
        * @private
        */
        togglePaginationSize: function () {
            var containerWidth = (this.$(".news-page-count").offset().left 
                                    - this.$("#news-content-footer-inner").offset().left 
                                    - 40), // padding
                paginationSize = this.$(".news-pagination").width(),
                $target = this.$(".news-pagination");

            if (!$target.hasClass("small") && paginationSize > containerWidth) {
                this.paginationSize = paginationSize;
                $target.addClass("small");
            } else if (containerWidth > this.paginationSize) {
                $target.removeClass("small");
            }
        },

        /**
        * user clicked the previous page button
        *
        * @method onPreviousPage
        * @private
        */
        onPreviousPage: function () {
            var $current = this.$(".news-pagination-icon.current"),
                index = $current.data("pageindex");

            if (index > 0) {
                this.resetSelectAll();

                $current.removeClass("current");

                this.$(".news-pagination-icon").eq(index -1).addClass("current");
                
                this.$(".news-page-count-current").text(index);

                this.$(".news-pagination-prev.disabled, .news-pagination-next.disabled").removeClass("disabled");

                this.$(".news-article-page").detach();

                if (index === 1) {
                    this.$(".news-pagination-prev").addClass("disabled");
                }

                if (this.pageList[index -1]) {
                    this.$("#news-content-body-content").append(this.pageList[index -1]);
                }
            } else {
                this.$(".news-pagination-prev").addClass("disabled");
            }
        },

        /**
        * user clicked a specific page icon
        *
        * @method onSelectPage
        * @private
        */
        onSelectPage: function (e) {
            var $target = $(e.target),
                index = $target.data("pageindex");

            this.resetSelectAll();

            this.$(".news-pagination-icon.current").removeClass("current");

            $target.addClass("current");

            this.$(".news-page-count-current").text(index +1);

            this.$(".news-article-page").detach();

            this.$(".news-pagination-prev.disabled, .news-pagination-next.disabled").removeClass("disabled");

            if (index === 0) {
                this.$(".news-pagination-prev").addClass("disabled");
            } else if (index === this.pageList.length -1) {
                this.$(".news-pagination-next").addClass("disabled");
            }

            if (this.pageList[index]) {
                this.$("#news-content-body-content").append(this.pageList[index]);
            }
        },

        /**
        * user clicked the next page button
        *
        * @method onNextPage
        * @private
        */
        onNextPage: function () {
            var $current = this.$(".news-pagination-icon.current"),
                index = $current.data("pageindex");

            if (index < this.pageList.length -1) {
                this.resetSelectAll();

                $current.removeClass("current");

                this.$(".news-pagination-icon").eq(index +1).addClass("current");

                this.$(".news-page-count-current").text(index +2);

                this.$(".news-pagination-prev.disabled, .news-pagination-next.disabled").removeClass("disabled");

                this.$(".news-article-page").detach();

                if (index === this.pageList.length -2) {
                    this.$(".news-pagination-next").addClass("disabled");
                }

                if (this.pageList[index +1]) {
                    this.$("#news-content-body-content").append(this.pageList[index +1]);
                }
            } else {
                this.$(".news-pagination-next").addClass("disabled");
            }
        },

        /**
        * user clicked an article - view it and mark it as viewed
        *
        * @method onViewArticle
        * @private
        */
        onViewArticle: function (e) {
            function _error(msg) {
                require(["view/ToastView"], function (ToastView) {
                    new ToastView({
                        message: msg,
                        color: ToastView.prototype.WarningColor,
                        icon: "fa fa-exclamation-triangle"
                    });
                });
            }

            var $listItem = $(e.target).closest(".news-article-item"),
                articleId = $listItem.data("articleid"),
                channelId = $listItem.data("channelid"),
                channelModel = this.model.where({ChannelId: channelId}),
                articleModel = undefined;

            if (channelModel.length) {
                articleModel = channelModel[0].get("ArticleCollection").where({ArticleId: articleId});

                if (articleModel.length) {
                    require(["view/IframeAppmodeView", "util/Environment", "app"], $.proxy(function (IframeAppmodeView, Environment, App) {

                        new IframeAppmodeView({
                            title: articleModel[0].get("Title"),
                            url: [
                                Environment, 
                                "/TheHub_NewsUI/ShowNewsArticle.aspx?client=true&NewsId=", 
                                articleId,
                                "&UserId=",
                                App.UserModel.get("UserId")
                            ].join(""),
                            onClose: $.proxy(function () {
                                this.refreshChannels();
                                this.onShow();
                            }, this)
                        });

                        articleModel[0].set("Status", "V");

                        this.updateChannelCount();

                        this.updateTotalCount();

                        this.onHide();
                    }, this));
                } else {
                    _error(Strings.NewsArticleNotFound);
                } // articleModel.length
            } else {
                _error(Strings.NewsChannelNotFound);
            } // channelModel.length
        },

        /**
        * user clicked the 'select-all' button
        *
        * @method onSelectAll
        * @private
        */
        onSelectAll: function (e) {
            this.$(".article-select").prop("checked", $(e.target).prop("checked") ? "checked" : "");
        },

        /**
        * resets all selections to un-checked
        *
        * @method resetSelectAll
        * @private
        */
        resetSelectAll: function () {
            this.$(".article-select, #news-select-all").prop("checked", "");
        },

        /**
        * mark the selected articles as read
        *
        * @method onMarkAll
        * @private
        */
        onMarkAll: function () {
            var $checkedArticles = this.$(".news-article-item input[type='checkbox']:checked"),
                debug = require("app").HubModel.get("Debug"),
                This = this;

            $checkedArticles.each(function () {
                var $article = $(this).closest(".news-article-item"),
                    channelId = $article.data("channelid"),
                    articleId = $article.data("articleid");

                var channel = This.model.where({ChannelId: channelId});
                if (channel.length) {
                    var article = channel[0].get("ArticleCollection").where({ArticleId: articleId});
                    if (article.length) {
                        article[0].set("Status", "V");
                    } else if (debug) {
                        console.error("NewsView.onMarkAll() - unable to find article");
                    }
                } else if (debug) {
                    console.error("NewsView.onMarkAll() - unable to find channel");
                }
            });

            $checkedArticles.prop("checked", "");

            this.updateTotalCount();
            
            this.updateChannelCount();
        },

        /**
        * user clicked the 'create a new channel' icon
        *
        * @method onCreateChannel
        * @private
        */
        onCreateChannel: function () {
            require(["view/IframeModalView", "util/Environment", "app"], function (IframeModalView, Environment, App) {
                new IframeModalView({
                    url: Environment + "/TheHub_NewsUI/MainFlow.NewChannel.aspx?client=true&UserId=" + App.UserModel.get("UserId"),
                    title: Strings.NewsCreateChannelTitle
                });
            });
        },

        /**
        * user clicked the manage channels option from the dropdown
        *
        * @method onManageChannels
        * @private
        */
        onManageChannels: function () {
            require(["view/IframeModalView", "util/Environment", "app"], function (IframeModalView, Environment, App) {
                new IframeModalView({
                    url: Environment + "/TheHub_NewsUI/ChannelList.aspx?UserId=" + App.UserModel.get("UserId"),
                    title: Strings.NewsManageChannels
                });
            });
        },

        /**
        * user clicked the subscribe to channels option from the dropdown
        *
        * @method onSubscribeChannels
        * @private
        */
        onSubscribeChannels: function () {
            require(["view/NewsChannelListView"], $.proxy(function (NewsChannelListView) {
                new NewsChannelListView({
                    title: Strings.NewsSubscribeChannels,
                    SubscribedList: this.model,
                    onClose: $.proxy(function () {
                        this.refreshChannels();
                    }, this)
                });
            }, this));
        },

        /**
        * user clicked the new article option from the dropdown
        *
        * @method onNewArticle
        * @private
        */
        onNewArticle: function () {
            require(["view/IframeAppmodeView", "util/Environment", "app"], $.proxy(function (IframeAppmodeView, Environment, App) {
                new IframeAppmodeView({
                    url: Environment + "/TheHub_NewsUI/NewNewsArticle.aspx?client=true&UserId=" + App.UserModel.get("UserId"),
                    title: Strings.NewsNewArticle
                });

                this.onHide();
            }, this));
        },

        /**
        * an input occured on the search input box - update search results
        *
        * @method onArticleSearch
        * @private
        */
        onArticleSearch: function (e) {
            var val = $(e.target).val(),
                current = this.$(".news-channel-list-item.active-channel").data("channelid"),
                channel = this.model.where({ChannelId: current});

            if (val) {
                if (current && channel.length) {
                    this.resetSelectAll();
                    this.populateArticles(channel[0].get("ArticleCollection").query(val));
                }
            } else if (channel.length) {
                this.populateArticles(channel[0].get("ArticleCollection").models);
            }
        },

        /**
        * internally used to block excessive show/hide calls
        *
        * @property isVisible
        * @public
        */
        isVisible: false,

        /**
        * cached reference to the desktop-cover
        *
        * @property _$backdrop
        * @private
        */
        _$backdrop: undefined,

        /**
        * animate the News panel in
        *
        * @param {Function} cb - optional on-complete callback
        *
        * @method onShow
        * @private
        */
        onShow: function (cb) {
            if (this.isVisible === true) {
                return;
            }

            if (!this._$backdrop) {
                this._$backdrop = $("#gridster-backdrop");
            }

            this._$backdrop.show()
                .on("click.close", $.proxy(this.onHide, this))
                .animate({opacity: 0.35}, {duration: 300});

            AnimHelpers.FadeScaleIn(this.$el.show(), function () {
                this.isVisible = true;

                $(window).on("keyup.newsescape", $.proxy(function cb_escapeHandler (e) {
                    var key = e.which || e.keyCode;

                    if (key === 27) {
                        this.onHide();
                    }
                }, this));

                if (typeof cb === "function") {
                    cb();
                }
            }, this);
        },

        /**
        * animate the News panel out
        *
        * @param {Function} cb - optional on-complete callback
        *
        * @method onHide
        * @private
        */
        onHide: function (cb) {
            if (this.isVisible === false) {
                return;
            }

            if (!this._$backdrop) {
                this._$backdrop = $("#gridster-backdrop");
            }

            $(window).off("keyup.newsescape");

            this._$backdrop.off("click.close");

            this._$backdrop.animate({opacity: 0}, {
                duration: 300,
                complete: $.proxy(function () {
                    this._$backdrop.hide();
                }, this)
            });

            AnimHelpers.FadeScaleOut(this.$el, function () {
                this.isVisible = false;
                this.$el.hide();
                if (typeof cb === "function") {
                    cb();
                }
            }, this);
        }
    });
});