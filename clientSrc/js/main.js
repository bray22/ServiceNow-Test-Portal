/*
* main.js
*
* Require.js entry point - configures require, and kicks-off the application
*/

require.config({
    baseUrl: "js",
    
    appDir: ".",
    
    paths: {
        "backbone": [
            //"//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone-min",
            //"http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone-min",
            "lib/backbone-1.2.3"
        ],

        "jquery": [
            //"//code.jquery.com/jquery-2.2.4.min",
            //"http://code.jquery.com/jquery-2.2.4.min",
            "lib/jquery-2.2.4"
        ],

        "bootstrap": [
            //"//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min",
            //"http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min",
            "lib/bootstrap-3.3.6"
        ],

        "underscore": [
            //"//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min",
            //"http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min",
            "lib/underscore-1.8.3"
        ],

        "gridster": [
            //"//cdnjs.cloudflare.com/ajax/libs/jquery.gridster/0.5.6/jquery.gridster.min",
            //"http://cdnjs.cloudflare.com/ajax/libs/jquery.gridster/0.5.6/jquery.gridster.min",
            "lib/gridster-0.5.6"
        ],

        "moment": "lib/moment-2.10.3",

        "amcharts" : [
            //"//cdn.amcharts.com/lib/3/amcharts",
            "lib/amcharts/amcharts"
        ],

        "amcharts.funnel": [
            //"//cdn.amcharts.com/lib/3/funnel",
            //"http://cdn.amcharts.com/lib/3/funnel",
            "lib/amcharts/funnel"
        ],

        "amcharts.gauge": [
            //"//cdn.amcharts.com/lib/3/gauge",
            //"http://cdn.amcharts.com/lib/3/gauge",
            "lib/amcharts/gauge"
        ],

        "amcharts.pie": [
            //"//cdn.amcharts.com/lib/3/pie",
            //"http://cdn.amcharts.com/lib/3/pie",
            "lib/amcharts/pie"
        ],

        "amcharts.radar": [
            //"//cdn.amcharts.com/lib/3/radar",
            //"http://cdn.amcharts.com/lib/3/radar",
            "lib/amcharts/radar"
        ],

        "amcharts.serial": [
            //"//cdn.amcharts.com/lib/3/serial",
            //"http://cdn.amcharts.com/lib/3/serial",
            "lib/amcharts/serial"
        ],

        "amcharts.xy": [
            //"//cdn.amcharts.com/lib/3/xy",
            //"http://cdn.amcharts.com/lib/3/xy",
            "lib/amcharts/xy"
        ],

        "amcharts.gantt": [
            //"//cdn.amcharts.com/lib/3/gantt",
            //"http://cdn.amcharts.com/lib/3/gantt",
            "lib/amcharts/gantt"
        ],

        "amcharts.responsive": [
            "lib/amcharts/plugins/responsive/responsive.min"
        ],

        "d3": [
            //"http://d3js.org/d3.v3.min",
            "lib/d3.min"
        ],

        "three": [
            //"//cdnjs.cloudflare.com/ajax/libs/three.js/r79/three.min",
            "lib/three-79"
        ],

        "owl": [
            "lib/owl-2"
        ]
    },
    
    shim: {
        "backbone": {
            deps: ["jquery", "underscore"]
        },

        "bootstrap": {
            deps: ["jquery"]
        },

        "gridster": {
            deps: ["jquery"]
        },

        "owl": {
            deps: ["jquery"]
        },

        "amcharts.funnel": {
            deps: ["amcharts"],
            exports: "AmCharts",
            init: function() {
                AmCharts.isReady = true;
            }
        },

        "amcharts.gauge": {
            deps: ["amcharts"],
            exports: "AmCharts",
            init: function() {
                AmCharts.isReady = true;
            }
        },

        "amcharts.pie": {
            deps: ["amcharts"],
            exports: "AmCharts",
            init: function() {
                AmCharts.isReady = true;
            }
        },

        "amcharts.radar": {
            deps: ["amcharts"],
            exports: "AmCharts",
            init: function() {
                AmCharts.isReady = true;
            }
        },

        "amcharts.serial": {
            deps: ["amcharts"],
            exports: "AmCharts",
            init: function() {
                AmCharts.isReady = true;
            }
        },

        "amcharts.xy": {
            deps: ["amcharts"],
            exports: "AmCharts",
            init: function() {
                AmCharts.isReady = true;
            }
        },

        "amcharts.gantt": {
            deps: ["amcharts", "amcharts.serial"],
            exports: "AmCharts",
            init: function() {
                AmCharts.isReady = true;
            }
        },
        
        "amcharts.responsive" : {
            deps: ["amcharts"],
            exports: "AmCharts",
            init: function() {
                AmCharts.isReady = true;
            }
        }
    },

    config: {
        i18n: {
            locale: (function () {
                var idx = location.href.indexOf("lang=");
                if (idx !== -1) {
                    return location.href.substr(idx + 5, 2);
                }
                return undefined;
            })()
        }
    }

});

//
// FILE PACKING LIST
// only Hub-Core-Application modules should be listed here 
//
//  !!! (except "util/Environment" - this module has run-time logic during parse-execution) !!!
//
// NO integrated widgets
// NO libraries
//
require([
    "app",
    "util/Util",
    "util/Ajax",
    "router",

    "model/Model",
    "model/SizeModel",
    "model/WidgetLayoutModel",
    "model/WidgetModel",
    "model/DesktopModel",
    "model/UserModel",
    "model/AlertModel",
    "model/HeartbeatModel",
    "model/HubModel",
    "model/ServiceModel",
    "model/NewsChannelModel",
    "model/NewsArticleModel",
    "model/BroadcastModel",

    "collection/Collection",
    "collection/AlertCollection",
    "collection/DesktopCollection",
    "collection/LayoutCollection",
    "collection/NewsCollection",
    "collection/ServiceCollection",
    "collection/SizeCollection",
    "collection/WidgetCollection",
    "collection/NewsArticleCollection",
    "collection/BroadcastCollection",

    "text!templates.html",
    "i18n!nls/Hub",
    "util/Messaging",
    "util/AnimHelpers",

    "view/View",
    "view/DesktopView",
    "view/HelpMenuView",
    "view/HubView",
    "view/SearchResultsView",
    "view/ModalView",
    "view/IframeModalView",
    "view/HtmlModalView",
    "view/WidgetAppmodeView",
    "view/WidgetView",
    "view/AlertMenuView",
    "view/ToastView",
    "view/DesktopMenuView",
    "view/IframeAppmodeView",
    "view/DesktopOptionsView",
    "view/ConfirmationView",
    "view/NewsView",
    "view/NewsChannelListView",
    "view/ContentLibraryView",
    "view/BalloonView",
    "view/WalkthroughView"
], 
function (App /* ...lots of stuff, added for packing, but not used here.. */) {
    var fragment = document.location.hash,
        hash = fragment ? fragment.substr(1, fragment.length) : undefined;

    if (hash) {
        App[App.routes[hash]]();
    } else {
        App.navigate("home", {trigger: true, replace: true});
    }
});
