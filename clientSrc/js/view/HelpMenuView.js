/*
* HubHelpView.js
*/

define(["view/View", "i18n!nls/Hub", "jquery", "view/IframeModalView"], function (View, Strings, $, IframeModalView) {
    "use strict";

    /**
    * controls the view and events tied to the help menu
    *
    * @class HubHelpView
    * @constructor
    * @extends View
    * @namespace view
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
            "click .on-release-notes": "onReleaseNotes",
            "click .on-report-problem": "onReportProblem",
            "click .on-request-enhancement": "onEnhancement",
            "click .on-ask-question": "onQuestion",
            "click .on-walkthrough": "onWalkthrough",
            "click .on-wiki": "onWiki",
            "click .on-style-guide": "onStyleGuide",
            "click .on-faq": "onFAQ"
        },

        /**
        * init template 
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.$icon = params.$icon;
        },

        /**
        * called from the hub view to display the help menu
        *
        * @param {Function} cb - callbacks to hubView to remove the global "hide" click handler
        *
        * @method show
        * @public
        */
        show: function (cb) {
            var offset = this.$icon.offset();

            this.close = function () {
                this.$el.animate({opacity: 0}, {
                    duration: 200,
                    complete: $.proxy(function () {
                        this.$el.hide();
                        cb();
                    }, this)
                });
            };

            this.$el.css({
                top: offset.top + this.$icon.height() + 15,
                left: offset.left - this.$el.width() + this.$icon.width()
            });

            this.$el.show().animate({opacity: 1}, {
                duration: 200
            });
        },

        /**
        * user clicked the release notes link 
        *
        * @method onReleaseNotes
        * @private
        */
        onReleaseNotes: function (e) {
            this.close();
            
            new IframeModalView({
                title: Strings.ReleaseNotesTitle,
                url: "https://engineering.sites.emc.com/operationalprograms/thehub/SiteAssets/WikiPageWrapper.aspx?IsDlg=1&Name=Release%20Notes.aspx",
                width: "95%"
            });
        },

        /**
        * user clicked the report a problem link 
        *
        * @method onReportProblem
        * @private
        */
        onReportProblem: function (e) {
            this.close();
            var FormattingObj = {
                CreateIncidentForm: {
                    BuildingDisplay: "Application Services",
                    LabDisplay: "Application Services",
                    CategoryDisplay: "OS/Software",
                    AdditionalDescrip: "Browser: " + navigator.userAgent  + "\nHub Version: Beta Hub"
                },
                HiddenFields: {
                    Building: false,
                    Lab: false,
                    Category: false,
                    Program: false,
                    Project: false,
                    DeviceName: false,
                    RequestedBy: false,
                    BusinessUnit: false
                },
                RestrictedConfigItemsList: [ 
                    {Value: "TheHub"}, 
                    {Value: "PDP Data Warehouse"}
                ]
            };
            
            require(["util/Environment"], function (Environment) {
                new IframeModalView({
                    title: Strings.CreateIncidentTitle,
                    url: Environment + "/ServiceNow_Plugins/CreateIncident_V2.aspx?FormattingObj=" + encodeURI(JSON.stringify((FormattingObj))),
                    width: "80%",
                    height: "90%"
                });
            });
        },

        /**
        * user clicked request an enhancement link 
        *
        * @method onEnhancement
        * @private
        */
        onEnhancement: function (e) {
            this.close();

            require(["util/Environment"], function (Environment) {
                new IframeModalView({
                    title: Strings.RequestEnhancementTitle,
                    url: Environment + "/Generic_Plugins/SFCreateRequest.CreateRequest.aspx?IsHubRequest=False&IsHubEnhancementRequest=True",
                    width: "80%"
                });
            });
        },

        /**
        * user clicked on ask a question 
        *
        * @method onQuestion
        * @private
        */
        onQuestion: function (e) {
            this.close();
            $("#livewire").addClass("show");
        },

        /**
        * user clicked on the walkthrough link 
        *
        * @method onWalkthrough
        * @private
        */
        onWalkthrough: function (e) {
            this.close();
            
            require(["view/WalkthroughView"], function (WalkthroughView) {
                new WalkthroughView({});
            });
        },

        /**
        * popup blocker was detected - alert the user to allow them
        *
        * @method alertPopupBlocker
        * @private
        */
        alertPopupBlocker: function () {
            require(["util/Util"], function (Util) {
                Util.NotifyPopupBlocker();
            });
        },

        /**
        * user clicked the wiki link 
        *
        * @method onWiki
        * @private
        */
        onWiki: function (e) {
            this.close();
            
            var win = window.open("https://engineering.sites.emc.com/operationalprograms/thehub/TheHub%20Wiki/Home.aspx", "_blank");

            if (win) {
                win.focus();
            } else {
                this.alertPopupBlocker();
            }
        },

        /**
        * user clicked the style guide link 
        *
        * @method onStyleGuide
        * @private
        */
        onStyleGuide: function (e) {
            this.close();
            
            var win = window.open("https://osdevfe.usd.lab.emc.com/TheHubStyleguide", "_blank");
            
            if (win) {
                win.focus();
            } else {
                this.alertPopupBlocker();
            }
        },

        /**
        * user clicked the FAQ 
        *
        * @method onFAQ
        * @private
        */
        onFAQ: function (e) {
            this.close();
            
            new IframeModalView({
                title: Strings.FAQTitle,
                url: "https://engineering.sites.emc.com/operationalprograms/thehub/SiteAssets/WikiPageWrapper.aspx?IsDlg=1&Name=Frequently%20Asked%20Questions.aspx",
                width: "80%"
            });
        }
    });
});