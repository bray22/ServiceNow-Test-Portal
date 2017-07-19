/*
* Ajax.js
*/

define(["require", "jquery", "underscore", "util/Environment"], function (require, $, _, Environment) {
    "use strict";

    var _domain = Environment,
        _token,
        _userId,
        Ajax = {};

    /**
    * jQuery.ajax wrapper to pass options and extend defaults. First created to add authorization header to all requests.
    *
    * @param {Object} ajaxOptions
    *
    * @method _hubXhr
    * @module Ajax
    * @private
    */
    function _hubXhr(ajaxOptions) {
        return $.ajax($.extend(true, {
            headers: {
                Authorization: "Bearer " + _token
            }
        }, ajaxOptions));
    }

    /**
    * initial bootstrap call - hub data, user data, etc...
    *
    * @param {String} Token
    * @param {Number} UserId
    * @param {Function} onComplete - onsuccess/onfail callback, caller must validate arguments!
    * @param {Object} context
    *
    * @method GetBoot
    * @module Ajax
    * @public
    */
    Ajax.GetStartUp = function (Token, UserId, onComplete, context) {
        require(["model/UserModel", "model/HubModel"], function (UserModel, HubModel) {

            // set context globals
            _userId = UserId;
            _token = Token;

            _hubXhr({
                url: _domain + "/ClientAPI/rest/Hub/Boot",
                data: {
                    UserId: _userId
                },
                success: function (data) {
                    onComplete.call(context || window, new HubModel(data.HubViewModel), new UserModel(data.UserViewModel));
                },
                error: function () {
                    onComplete.call(context || window, null, null);
                }
            });
        });
    };

    /**
    * get a list of widgets available in the content-library
    *
    * @param {Function} onComplete - onsuccess/onfail callback, caller must validate arguments!
    * @param {Object} context
    *
    * @method GetContentLibraryWidgets
    * @module Ajax
    * @public
    */
    Ajax.GetContentLibraryWidgets = function (onComplete, context) {
        _hubXhr({
            url: _domain + "/ClientAPI/rest/LibraryWidgets/Get",
            data: {
                UserId: _userId
            },
            success: function (data) {
                require(["collection/WidgetCollection"], function (WidgetCollection) {
                    onComplete.call(context || window, new WidgetCollection(data));
                });
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * download all of the plugin icons (the only way to get this with outsystems is as HEX)
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetPluginStylesheet
    * @public
    */
    Ajax.GetPluginStylesheet = function (onComplete, context) {
        _hubXhr({
            url: _domain + "/ClientAPI/rest/Misc/IconStylesheet",
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * get a list of services available to the client
    *
    * @param {Function} onComplete - onsuccess/onfail callback, caller must validate arguments!
    * @param {Object} context
    *
    * @method GetServices
    * @module Ajax
    * @public
    */
    Ajax.GetServices = function (onComplete, context) {
        _hubXhr({
            url: _domain + "/ClientAPI/rest/Services/Get",
            success: function (data) {
                require(["collection/ServiceCollection"], function (ServiceCollection) {
                    onComplete.call(context || window, new ServiceCollection(data));
                });
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * periodically called to get updates for the client
    *
    * @param {Object} postData
    * @param {Function} onComplete - onsuccess/onfail callback, caller must validate arguments!
    * @param {Object} context
    *
    * @method Heartbeat
    * @module Ajax
    * @public
    */
    Ajax.HeartBeat = function (postData, onComplete, context) {
        _hubXhr({
            url: _domain + "/ClientAPI/rest/Heartbeat/Post",
            type: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(postData),
            success: function (data) {
                require(["model/HeartbeatModel"], function (HeartbeatModel) {
                    onComplete.call(context || window, new HeartbeatModel(data));
                });
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * set the argued desktop id to active under the argued user
    *
    * @param {Number} DesktopId - the id of the desktop
    * @param {Object} context
    *
    * @method SetActiveDesktop
    * @module Ajax
    * @public
    */
    Ajax.SetActiveDesktop = function (DesktopId, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/SetActive",
            data: {
                UserId: _userId,
                DesktopId: DesktopId
            },
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, false);
            }
        });
    };

    var desktopSaveHandle = null;

    /**
    * save the argued desktop model to the server
    *
    * @param {DesktopModel} DesktopModel
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method SaveDesktopContent
    * @module Ajax
    * @public
    */
    Ajax.SaveDesktopContent = function (DesktopModel, onComplete, context) {
        if (desktopSaveHandle !== null) {
            desktopSaveHandle.abort();
        }

        desktopSaveHandle = _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/Save",
            type: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(DesktopModel.serialize()),
            success: function (data) {
                desktopSaveHandle = null;
                onComplete.call(context || window, data);
            },
            error: function () {
                desktopSaveHandle = null;
                onComplete.call(context || window, false);
            }
        });
    };

    /**
    * remove the argued widget instance 
    *
    * @param {String} InstanceGuid
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method RemoveWidget
    * @module Ajax
    * @public
    */
    Ajax.RemoveWidget = function (InstanceGuid, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/RemoveWidget",
            data: {
                UserId: _userId,
                InstanceGuid: InstanceGuid
            },
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, false);
            }
        });
    };

    /**
    * Create a new desktop instance
    *
    * @param {String} DesktopName
    * @param {Function} onComplete
    * @param {Object} context
    * @return {DesktopModel}
    *
    * @method CreateDesktop
    * @module Ajax
    * @public
    */
    Ajax.CreateDesktop = function (DesktopName, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/Create",
            data: {
                UserId: _userId,
                DesktopName: DesktopName
            },
            success: function (data) {
                require(["model/DesktopModel"], function (DesktopModel) {
                    onComplete.call(context || window, new DesktopModel(data));
                });
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * Rename a desktop
    *
    * @param {Number} DesktopId
    * @param {String} Name
    * @param {Object} context
    *
    * @method RenameDesktop
    * @module Ajax
    * @public
    */
    Ajax.RenameDesktop = function (DesktopId, Name, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/Rename",
            data: {
                UserId: _userId,
                DesktopId: DesktopId,
                Name: Name
            },
            success: function (success) {
                onComplete.call(context || window, success);
            },
            error: function () {
                onComplete.call(context || window, false);
            }
        });
    };

    /**
    * delete a desktop
    *
    * @param {Number} DesktopId
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method DeleteDesktop
    * @module Ajax
    * @public
    */
    Ajax.DeleteDesktop = function (DesktopId, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/Delete",
            data: {
                UserId: _userId,
                DesktopId: DesktopId
            },
            success: function (success) {
                onComplete.call(context || window, success);
            },
            error: function () {
                onComplete.call(context || window, false);
            }
        });
    };

    /**
    * clone the argued desktop
    *
    * @param {Number} DesktopId
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method CloneDesktop
    * @module Ajax
    * @public
    */
    Ajax.CloneDesktop = function (DesktopId, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/Clone",
            data: {
                UserId: _userId,
                DesktopId: DesktopId
            },
            success: function (desktop) {
                if (desktop) {
                    require(["model/DesktopModel"], function (DesktopModel) {
                        onComplete.call(context || window, new DesktopModel(desktop));
                    });
                } else {
                    onComplete.call(context || window, null);
                }
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * dismiss a singular alert on the server
    *
    * @param {Number} AlertId
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method DismissAlert
    * @module Ajax
    * @public
    */
    Ajax.DismissAlert = function (AlertId, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Alerts/Dismiss",
            data: {
                UserId: _userId,
                AlertId: AlertId
            },
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, false);
            }
        });
    };

    /**
    * dismiss all alerts on the server
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method DismissAllAlerts
    * @module Ajax
    * @public
    */
    Ajax.DismissAllAlerts = function (onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Alerts/DismissAll",
            data: {
                UserId: _userId
            },
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, false);
            } 
        });
    };

    /**
    * mark a singular alert as viewed on the server
    *
    * @param {Number} AlertId
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method ViewAlert
    * @module Ajax
    * @public
    */
    Ajax.ViewAlert = function (AlertId, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Alerts/View",
            data: {
                UserId: _userId,
                AlertId: AlertId
            },
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, false);
            } 
        });
    };

    /**
    * get the initial bootstrap call for all news articles of a user
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetNews
    * @module Ajax
    * @public
    */
    Ajax.GetNews = function (onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/News/Get",
            data: {
                UserId: _userId
            },
            success: function (data) {
                require(["collection/NewsCollection"], function (NewsCollection) {
                    onComplete.call(context || window, new NewsCollection(data));
                });
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /*
    * Get the entire list of subscribable channels
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetNewsChannelList
    * @module Ajax
    * @public
    */
    Ajax.GetNewsChannelList = function (onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/News/ChannelList",
            data: {
                UserId: _userId
            },
            success: function (data) {
                require(["collection/NewsCollection"], function (NewsCollection) {
                    onComplete.call(context || window, new NewsCollection(data));
                });
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * toggle a news channel subscribtion
    *
    * @param {Number} ChannelId
    * @param {Boolean} Subscribe
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method SetNewsSubscription
    * @module Ajax
    * @public
    */
    Ajax.SetNewsSubscription = function (ChannelId, Subscribe, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/News/Subscribe",
            data: {
                UserId: _userId,
                ChannelId: ChannelId,
                Subscribe: Subscribe
            },
            success: function (success) {
                onComplete.call(context || window, success);
            },
            error: function () {
                onComplete.call(context || window, false);
            }
        });
    };

    /**
    * save an updated news article status
    *
    * @param {Number} ArticleId
    * @param {String} Status (N: New, V: Viewed, D: Dismissed)
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method SetNewsStatus
    * @module Ajax
    * @public
    */
    Ajax.SetNewsStatus = function (ArticleId, Status, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/News/SetStatus",
            data: {
                UserId: _userId,
                ArticleId: ArticleId,
                NewsStatusId: Status
            },
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, false);
            }
        });
    };

    /**
    * Generate an empty deeplink hash for the given widget guid
    *
    * @param {String} Guid
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GenerateDeepLink
    * @module Ajax
    * @public
    */
    Ajax.GenerateDeepLink = function (Guid, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/DeepLink/Generate",
            data: {
                UserId: _userId,
                Guid: Guid
            },
            success: function (data) {
                onComplete.call(context || window, data ? data : null);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * Generate a deeplink with associated data
    *
    * @param {String} Guid
    * @param {Object} Data
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GenerateDataDeepLink
    * @module Ajax
    * @public
    */
    Ajax.GenerateDataDeepLink = function (Guid, Data, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/DeepLink/DataGenerate",
            type: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                UserId: _userId,
                Guid: Guid,
                Data: JSON.stringify(Data)
            }),
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * get the widget guid associated with the argued deep link
    *
    * @param {String} Hash
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetDeepLinkGuid
    * @module Ajax
    * @public
    */
    Ajax.GetDeepLinkGuid = function (Hash, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/DeepLink/GetGuid",
            data: {
                Hash: Hash
            },
            success: function (data) {
                onComplete.call(context || window, data ? data : null);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * get the widget instance configuration
    *
    * @param {String} InstanceGuid
    * @param {Number} ConfigNumber
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetInstanceConfig
    * @module Ajax
    * @public
    */
    Ajax.GetInstanceConfig = function (InstanceGuid, ConfigNumber, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Config/GetInstance",
            data: {
                InstanceGuid: InstanceGuid,
                ConfigNumber: ConfigNumber
            },
            success: function (data) {
                onComplete.call(context || window, data ? data : null);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * set the widget instance configuration
    *
    * @param {String} InstanceGuid
    * @param {String} Configuration
    * @param {Object} context
    *
    * @method SetInstanceConfig
    * @module Ajax
    * @public
    */
    Ajax.SetInstanceConfig = function (InstanceGuid, Configuration, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Config/SetInstance",
            type: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                InstanceGuid: InstanceGuid,
                Configuration: Configuration
            }),
            success: function (data) {
                onComplete.call(context || window, data ? data : null);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * get the global config for the user/plugin
    *
    * @param {String} Guid
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetGlobalConfig
    * @module Ajax
    * @public
    */
    Ajax.GetGlobalConfig = function (Guid, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Config/GetGlobal",
            data: {
                UserId: _userId,
                Guid: Guid
            },
            success: function (data) {
                onComplete.call(context || window, data ? data : null);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * get the global config for the user/plugin
    *
    * @param {String} Guid
    * @param {String} Configuration
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetGlobalConfig
    * @module Ajax
    * @public
    */
    Ajax.SetGlobalConfig = function (Guid, Configuration, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Config/SetGlobal",
            type: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                UserId: _userId,
                Guid: Guid,
                Configuration: Configuration
            }),
            success: function (data) {
                onComplete.call(context || window, data ? data : null);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * get the list of business units
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetBUList
    * @module Ajax
    * @public
    */
    Ajax.GetBUList = function (onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Misc/GetBUList",
            data: {
                UserId: _userId
            },
            success: function (data) {
                onComplete.call(context || window, data ? data : null);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * get the list of user roles
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetRoleList
    * @module Ajax
    * @public
    */
    Ajax.GetRoleList = function (onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Misc/GetRoleList",
            data: {
                UserId: _userId
            },
            success: function (data) {
                onComplete.call(context || window, data ? data : null);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * save a temporary widget to the server
    *
    * @param {Number} DesktopId
    * @param {WidgetModel} WidgetModel
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method SaveTemporaryWidget
    * @module Ajax
    * @public
    */
    Ajax.SaveTemporaryWidget = function (DesktopId, WidgetModel, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/SaveTemporary",
            type: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                UserId: _userId,
                DesktopId: DesktopId,
                WidgetSaveModel: WidgetModel.serialize()
            }),
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, false);
            }
        });
    };

    /**
    * generate a authentication token for the argued user
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GenerateToken
    * @module Ajax
    * @public
    */
    Ajax.GenerateToken = function (onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Misc/AuthToken",
            data: {
                UserId: _userId
            },
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * used by external widgets to get the user profile
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetUserProfile
    * @module Ajax
    * @public
    */
    Ajax.GetUserProfile = function (onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Misc/UserProfile",
            data: {
                UserId: _userId
            },
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * dismiss the argued broadcast messages for the current user
    *
    * @param {Array[int]} idList
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method DismissBroadcastMessages
    * @module Ajax
    * @public
    */
    Ajax.DismissBroadcastMessages = function (idList, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Messaging/DismissBroadcast?UserId=" + _userId,
            type: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(idList),
            success: function () {
                onComplete.call(context || window, true);
            },
            error: function () {
                onComplete.call(context || window, false);
            }
        });
    };

    /**
    * unshare a desktop
    *
    * @param {Number} desktopId
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method UnShareDesktop
    * @module Ajax
    * @public
    */
    Ajax.UnShareDesktop = function (desktopId, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/UnShare",
            data: {
                DesktopId: desktopId
            },
            success: function (success) {
                onComplete.call(context || window, success);
            },
            error: function () {
                onComplete.call(context || window, false);
            }
        });
    };

    /**
    * get the most recent list of desktops for the user
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetDesktopList
    * @module Ajax
    * @public
    */
    Ajax.GetDesktopList = function (onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/Get",
            data: {
                UserId: _userId
            },
            success: function (collection) {
                require(["collection/DesktopCollection"], function (DesktopCollection) {
                    onComplete.call(context || window, collection ? new DesktopCollection(collection) : null);
                });
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * get a shared desktop that does not belong to the user (is not in UserModel.DesktopCollection)
    * this is called when a user navigates to a shared desktop, without adding to favorites
    *
    * @param {Number} desktopId
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetSharedDesktop
    * @public
    */
    Ajax.GetSharedDesktop = function (desktopId, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/GetShared",
            data: {
                DesktopId: desktopId
            },
            success: function (modelData) {
                require(["model/DesktopModel"], function (DesktopModel) {
                    onComplete.call(context || window, modelData ? new DesktopModel(modelData) : null);
                });
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * Gets the widget collection for the argued desktop
    *
    * @param {Number} desktopId
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetWidgetCollection
    * @public
    */
    Ajax.GetWidgetCollection = function (desktopId, onComplete, context) {
        return _hubXhr({
            url: _domain + "/ClientAPI/rest/Desktop/Widgets",
            data: {
                DesktopId: desktopId
            },
            success: function (widgetData) {
                onComplete.call(context || window, widgetData ? widgetData : null);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * fire and forget a metric event
    *
    * @param {Object} postData
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method FireMetricEvent
    * @module Ajax
    * @public
    */
    Ajax.FireMetricEvent = function (postData, onComplete, context) {
        var builder = ["actions,"],
            db = require("app").HubModel.get("MetricsDB");

        postData.userid = require("app").UserModel.get("NTID");
        postData.server = location.host;
        postData.width = window.innerWidth;
        postData.height = window.innerHeight;

        _.each(postData, function (value, key) {
            if (value) {
                builder.push(key);
                builder.push("=");
                builder.push(encodeURIComponent(value));
                builder.push(",");
            }
        });

        // trim the trailing ","
        builder = builder.splice(0, builder.length -1);

        return $.ajax({
            url: "https://hubv1.corp.emc.com/clienteventlog/write?db=" + db,
            type: "POST",
            data: builder.join("") + " value=1",
            success: function () {
                onComplete.apply(context || window, arguments);
            },
            error: function () {
                onComplete.apply(context || window, arguments);
            }
        });
    };


    /**
    * rename the widget on the user desktop
    *
    * @param {Object} postData
    * @param {Function} onComplete - onsuccess/onfail callback, caller must validate arguments!
    * @param {Object} context
    *
    * @method RenameWidget
    * @module Ajax
    * @public
    */
    Ajax.RenameWidget = function (postData, onComplete, context) {
        _hubXhr({
            url: _domain + "/ClientAPI/rest/Misc/RenameWidget",
            type: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(postData),
            success: function (widgetData) {
                onComplete.call(context || window, widgetData ? widgetData : null);
            },
            error: function (errdata) {
                onComplete.call(context || window, null);
            }
        });
    };


    return Ajax;
});