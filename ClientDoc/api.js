YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Tween",
        "collection.AlertCollection",
        "collection.BroadcastCollection",
        "collection.Collection",
        "collection.DesktopCollection",
        "collection.LayoutCollection",
        "collection.NewsArticleCollection",
        "collection.NewsCollection",
        "collection.ServiceCollection",
        "collection.SizeCollection",
        "collection.WidgetCollection",
        "model.AlertModel",
        "model.BroadcastModel",
        "model.DesktopModel",
        "model.HeartbeatModel",
        "model.Model",
        "model.NewsArticleModel",
        "model.NewsChannelModel",
        "model.SizeModel",
        "model.UserModel",
        "model.WidgetLayoutModel",
        "model.WidgetModel",
        "view.AlertMenuView",
        "view.BalloonView",
        "view.ConfirmationView",
        "view.DesktopMenuView",
        "view.DesktopOptionsView",
        "view.DesktopView",
        "view.DevMenuView",
        "view.ExpirationView",
        "view.HtmlModalView",
        "view.HubHelpView",
        "view.HubView",
        "view.IframeAppmodeView",
        "view.IframeModalView",
        "view.ModalView",
        "view.NewsChannelList",
        "view.NewsView",
        "view.Router",
        "view.SearchResultsView",
        "view.ToastView",
        "view.View",
        "view.WalkthroughView",
        "view.WidgetAppmodeView",
        "view.WidgetView"
    ],
    "modules": [
        "Ajax",
        "AnimHelpers",
        "App",
        "ConfirmationView",
        "Expiration",
        "HeartBeat",
        "HeatBeat",
        "HtmlModalView",
        "IframeAppmodeView",
        "IframeModalView",
        "Messaging",
        "Metrics",
        "ToastView",
        "Util",
        "WidgetAppmodeView"
    ],
    "allModules": [
        {
            "displayName": "Ajax",
            "name": "Ajax",
            "description": "jQuery.ajax wrapper to pass options and extend defaults. First created to add authorization header to all requests."
        },
        {
            "displayName": "AnimHelpers",
            "name": "AnimHelpers",
            "description": "Module containing generalized animation helpers"
        },
        {
            "displayName": "App",
            "name": "App",
            "description": "The router, or \"App\" is the heart of the entire application, it handles the hash-navigation,\nit composes the HubView, HubModel, UserModel, WidgetCollection, ServiceCollection\nThrough the App, a developer should be able to get to any model or view within the entire application\n\nYou can get the app at any time using: \"require('app')\"\neg: require(\"app\").WidgetCollection.where({Name: \"HubTV\"});\neg: require(\"app\").HubModel.get(\"Debug\");\neg: require(\"app\").HubView.getActiveDesktopModel().get(\"WidgetCollection\")\neg: require(\"app\").UserModel.get(\"BadgeNumber\")\neg: require(\"app\").HubView.getActiveDesktopModel().trigger(\"save\");"
        },
        {
            "displayName": "ConfirmationView",
            "name": "ConfirmationView",
            "description": "a simple modal-view to wrap confirmation dialog logic"
        },
        {
            "displayName": "Expiration",
            "name": "Expiration",
            "description": "sub-module controlling client-expiration"
        },
        {
            "displayName": "HeartBeat",
            "name": "HeartBeat",
            "description": "determine if the TheHub is on maintence break"
        },
        {
            "displayName": "HeatBeat",
            "name": "HeatBeat",
            "description": "sub-module for controlling the application's heartbeat\nThe heartbeat provides updates for client and server\nAlerts, News, maintenance flagging, etc..."
        },
        {
            "displayName": "HtmlModalView",
            "name": "HtmlModalView",
            "description": "A modal for those who those who want to display pre-built html"
        },
        {
            "displayName": "IframeAppmodeView",
            "name": "IframeAppmodeView",
            "description": "a generic appmode for any iframe"
        },
        {
            "displayName": "IframeModalView",
            "name": "IframeModalView",
            "description": "a generic modal with an iframe"
        },
        {
            "displayName": "Messaging",
            "name": "Messaging",
            "description": "navigate a modal to ServiceNow and create an ESM ticket"
        },
        {
            "displayName": "Metrics",
            "name": "Metrics",
            "description": "sub-module for logging user metrics"
        },
        {
            "displayName": "ToastView",
            "name": "ToastView",
            "description": "displays a simple toast-message"
        },
        {
            "displayName": "Util",
            "name": "Util",
            "description": "parses the url for a query parameters, return a key-value object of the arguments"
        },
        {
            "displayName": "WidgetAppmodeView",
            "name": "WidgetAppmodeView",
            "description": "Encapsulates all view logic for interacting with the AppMode template"
        }
    ],
    "elements": []
} };
});