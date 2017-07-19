//
// HUB javascript api. This file would contain all the utility functions necessary to
// interact with the hub.
//
// Include following script in your page:
// <script src="https://[client environment]/public/Hub.js"></script>
// Example Client Environment Base Urls:
// (DEV)     - dev.hub.cec.lab.emc.com
// (QA)      - qa.hub.cec.lab.emc.com
// (UAT)     - uat.hub.cec.lab.emc.com
// (PREPROD) - ospreprodfe.cec.lab.emc.com
// (PROD)    - thehub.corp.emc.com


(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.HUB = factory();
    }
})(this, (function (window, document) {
    "use strict";

    return function () {

        /**
        * reuse this function as an argument length check in all other calls
        *
        * @param {arguments} args - 'arguments' passed from caller
        * @param {number} minLength - expected amount of arguments
        *
        * @method checkArgsLength
        * @private
        */
        function checkArgsLength (args, minLength) {
            if (args.length < minLength) {
                console.warn("You need to provide %s arguments to run this 'HUB' function", minLength);
            } else {
                return 1;
            }
        }

        /**
         * logic to get query string parame by name
         *
         * @param {String} name - name of query string to find 
         * @param {String} qs - optional provided query string (or it will use current)
         *
         * @method getParameterByName
         * @private
         */
        function getParameterByName (name, qs) {
            qs = qs || (location.search + location.hash);
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(qs);
            return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        /**
        * Message parent Hub using postmessage
        *
        * @param {Object} messageData - object to stringify and send in message
        *
        * @method messageHub 
        * @private
        */
        function messageHub (messageData) {
            window.parent.postMessage(JSON.stringify(messageData || {}), "*");
        }

        var _hostName, _apiUrl;

        var OutputAPI = {

            /**
            * The user clicked the 'share-appmode' button, 
            * using DesktopsCore.GenerateDeepLink, persist a json representation of the UI state, which can be retrieved and reloaded
            *
            * @param {Function} callback - this function is called when the user requests for a deep-link url
            *
            * @method OnShare
            * @public
            */
            OnShare: function (callback) {
                if (typeof callback === "function") {
                    var onWindowMessage = function (e) {
                        var data = JSON.parse(e.data || {});                        
                        if (data.event === "share") {
                            callback(data.environment);
                        }
                    };
                    window.removeEventListener("message", onWindowMessage, true);
                    window.addEventListener("message", onWindowMessage, true);
                } else {
                    console.error("HUB.OnShare(callback: %s) - this method requires a callback argument", typeof callback);
                }
            },

            /**
            * get the current environments backend API base url (eg: thehubbe.corp.emc.com)
            *
            * @param {Function} callback - this callback function will have the API backend URL argued
            *
            * @method GetApiBaseUrl
            * @public
            */
            GetApiBaseUrl: function (callback) {
                if (typeof callback === "function") {
                    if (_apiUrl) {
                        callback(_apiUrl);
                    } else {
                        var onHostCallback = function onHostCallback(e) {
                            var data = JSON.parse(e.data || {});
                            if (data.event === "getapibaseurl.response") {
                                _apiUrl = data.baseurl;
                                callback(data.baseurl);
                                window.removeEventListener("message", onHostCallback, true);
                            }
                        };

                        window.removeEventListener("message", onHostCallback, true);
                        window.addEventListener("message", onHostCallback, true);

                        messageHub({
                            event: "getapibaseurl",
                            guid: getParameterByName("guid")
                        });
                    }
                } else {
                    console.error("HUB.GetApiBaseUrl(callback: %s) - invalid argument", typeof callback);
                }
            },

            /**
            * get the current host (eg: uat.hub.cec.lab.emc.com)
            *
            * @param {Function} callback - this callback function will have the hostname argued
            *
            * @method GetHostName
            * @public
            */
            GetHostName: function (callback) {
                if (typeof callback === "function") {
                    if (_hostName) {
                        callback(_hostName);
                    } else {
                        var onHostCallback = function onHostCallback(e) {
                            var data = JSON.parse(e.data || {});
                            if (data.event === "gethost.response") {
                                _hostName = data.hostname;
                                callback(data.hostname);
                                window.removeEventListener("message", onHostCallback, true);
                            }
                        };

                        window.removeEventListener("message", onHostCallback, true);
                        window.addEventListener("message", onHostCallback, true);

                        messageHub({
                            event: "gethostname",
                            guid: getParameterByName("guid")
                        });
                    }
                } else {
                    console.error("HUB.GetHostName(callback: %s) - invalid argument", typeof callback);
                }
            },

            /**
            * open's TheHub Chat - LiveWire
            *
            * @method OpenHubChat
            * @public
            */
            OpenHubChat: function () {
                messageHub({
                    event: "hubchat"
                });
            },

            /**
            * opens the 'FSCL' (FullScreenContentLibrary)
            *
            * @method OpenContentLibrary
            * @public
            */
            OpenContentLibrary: function () {
                messageHub({
                    event: "FSCL"
                });
            },

            /**
            * closes any modals currently open
            *
            * @method CloseHubPopup
            * @public
            */
            CloseHubPopup: function () {
                messageHub({
                    event: "closehubpopup"
                });
            },
            
            /**
            * closes appmode, if open
            *
            * @method CloseHubAppmode
            * @public
            */
            CloseHubAppmode: function () {
                messageHub({
                    event: "closeappmode"
                });
            },

            /**
            * refreshes the iframe within an individual widget
            *
            * @param {String} instanceGuid- the guid of the widget instance
            * @param {Integer} cfg - the cfg number to replace in the iframe
            *
            * @method RefreshWidget
            * @public
            */
            RefreshWidget: function (instanceGuid, cfg) {
                messageHub({
                    event: "widgetrefresh",
                    instanceGuid: instanceGuid || getParameterByName("guid"),
                    cfg: cfg
                });
            },

            /**
            * refreshes the AppMode iframe of an individual widget
            *
            * @param {String} instanceGuid- the guid of the widget instance
            * @param {Integer} cfg - the cfg number to replace in the iframe
            *
            * @method RefreshAppMode
            * @public
            */
            RefreshAppMode: function (instanceGuid, cfg, dlh) {
                messageHub({
                    event: "appmoderefresh",
                    instanceGuid: instanceGuid || getParameterByName("guid"),
                    cfg: cfg,
                    dlh: dlh || ""
                });
            },

            /**
            * restarts the tutorial in TheHub
            *
            * @param {Boolean} allowDismiss - toggles the 'dismiss' button
            * @param {String} username - name of the user to be displayed on the UI
            *
            * @method StartTutorial
            * @public
            */
            StartTutorial: function (allowDismiss, username) {
                messageHub({
                    event: "tutorial",
                    allowDismiss: (typeof allowDismiss === "boolean" ? allowDismiss : true),
                    username: username
                });
            },

            /**
            * Resize a widget to the argued gridster dimensions
            *
            * @param {String} instanceGuid - your widget instance GUID
            * @param {Number} width - gridster column count
            * @param {Number} height - gridster row count
            *
            * @method ResizeWidget
            * @public
            */
            ResizeWidget: function (instanceGuid, width, height) {
                instanceGuid = instanceGuid || getParameterByName("guid");
                if (typeof instanceGuid === "string"
                    && typeof width === "number"
                    && typeof height === "number") {
                    messageHub({
                        event: "widget.resize",
                        guid: instanceGuid,
                        width: width,
                        height: height
                    });
                } else {
                    console.warn("HUB.ResizeWidget(guid: %s, width: %s, height: %s) - all arguments are mandatory", 
                        instanceGuid, width, height);
                }
            },
            
            /**
            * updates the title of a widget to something new
            *
            * @param {String} instanceGuid
            * @param {String} name
            *
            * @method RenameWidget
            * @public
            */
            RenameWidget: function (instanceGuid, name) {
                instanceGuid = instanceGuid || getParameterByName("guid");
                if (typeof instanceGuid === "string" && typeof name === "string") {
                    messageHub({
                        event: "widget.rename",
                        guid: instanceGuid,
                        name: name
                    });
                } else {
                    console.warn("HUB.RenameWidget(instance-guid: %s, name: %s) - invalid arguments", 
                        instanceGuid, name);
                }
            },

            /**
            * Use this function to open an URL in appMode on the hub.
            *
            * @param {string} title - the title of the appMode 
            * @param {string} url - appmode's url
            *
            * @method appMode
            * @public
            */
            appMode: function (title, url) {
                if (checkArgsLength(arguments, 2)) {
                    messageHub({
                        event: "appmode",
                        title: title || "",
                        url: url || ""
                    });
                } else {
                    console.warn("HUB.appMode(title: %s, url: %s) - invalid arguments", 
                        title, url);
                }
            },
            
            /**
            * Flip the widget to the configuration panel view
            *
            * @param {String} instanceGuid - your widget instance GUID
            *
            * @method ConfigWidget
            * @public
            */
            ConfigWidget: function (instanceGuid) {
                instanceGuid = instanceGuid || getParameterByName("guid");
                if (instanceGuid) {
                    messageHub({
                        event: "configwidget",
                        guid: instanceGuid
                    });
                } else {
                    console.warn("HUB.ConfigWidget(instanceGuid: %s) - invalid arguments",
                        instanceGuid);
                }
            },
            
            /**
            * display a feedback popup message to the user
            *
            * @param {String} message - the message to be displayed
            * @param {Stirng} icon - the font-awesome class icon to be displayed
            * @param {String} color - the background color, any css value will work
            * @param {Number||Boolean} timer - argue 'false' to disable auto-away timer, or send a number
            *                       in milliseconds to specify how long it should display
            *
            * @method Toast
            * @public
            */
            Toast: function (message, icon, color, timer) {
                if (message) {
                    messageHub({
                        event: "toast",
                        message: message,
                        icon: icon,
                        color: color,
                        timer: timer
                    });
                } else {
                    console.warn("HUB.Toast(message: %s, icon: %s, color: %s, timer: %s) - invalid message",
                        message, icon, color, timer);
                }
            },

            /**
            * called from the shared-desktop menu to make the client to go a specific desktop
            *
            * @param {Number} desktopId
            *
            * @method GoToSharedDesktop
            * @public
            */
            GoToSharedDesktop: function (desktopId) {
                if (desktopId) {
                    messageHub({
                        event: "switch-desktop",
                        desktopid: desktopId
                    });
                } else {
                    console.warn("HUB.GoToSharedDesktop(desktopId: %s) - invalid argument", desktopId);
                }
            },

            Authentication: {

                /**
                 * unsecure way to obtain user profile of current Hub user using your app (in hub iframed widget or appmode)
                 *
                 * @param {Function} callback - callback to execute with user profile data as argument
                 * 
                 * @method getCurrentUser
                 * @public
                 */
                getCurrentUser: function (callback) {
                    if (typeof callback === "function") {
                        var recieveMessage = function (event) {
                            var data = JSON.parse(event.data);

                            if (data.event === "auth.userreturned") {
                                window.removeEventListener("message", recieveMessage, true);
                                callback && callback(JSON.parse(data.profile));
                            }
                        }

                        window.addEventListener("message", recieveMessage, true);

                        messageHub({
                            event: "auth.getuser",
                            guid: getParameterByName("guid")
                        });
                    } else {
                        console.error("HUB.Authentication.getCurrentUser(callback: %s) - this method requires a callback argument",
                            typeof callback);
                    }
                },
                
                /**
                 * post message to parent Hub to generate authentication token to use in subsequent REST call (see HUB.RestEndpoints.ValidateAuthToken)
                 *
                 * @param {Function} callback - callback to execute when token is returned that should take returned token as it's parameter and invoke the validation REST call (ValidateAuthToken) from your application
                 * 
                 * @method generateToken
                 * @public
                 */
                generateToken: function (callback) {
                    if (typeof callback === "function") {
                        var recieveMessage = function (event) {
                            var data = JSON.parse(event.data);
                            if (data.event === "auth.tokengenerated") {
                                window.removeEventListener("message", recieveMessage, true);
                                callback && callback(data.ssoToken, data.domain);
                            }
                        };

                        window.addEventListener("message", recieveMessage, true);

                        messageHub({
                            event: "auth.generatetoken",
                            guid: getParameterByName("guid")
                        });
                    } else {
                        console.error("HUB.Authentication.generateToken(callback: %s) - this method requires a callback argument",
                            typeof callback);
                    }
                }
            },

            Modal: {

                /**
                * opens a richwidget popup pointing to the CreateIncident form
                *
                * @param {object} customData
                *
                * @method createIncident
                * @public
                */
                createIncident: function (customData) {
                    var url = "/ServiceNow_Plugins/CreateIncident_V2.aspx";

                    //legacy customData mapping
                    var legacyMapping = {
                        Building: 'BuildingDisplay',
                        Lab: 'LabDisplay',
                        Category: 'CategoryDisplay',
                        ConfigItem: 'ConfigurationItemDisplay',
                        AddOnDescription: 'AdditionalDescrip'
                    };

                    var urlQueryString = "?FormattingObj=";
                    var newObj = {
                      CreateIncidentForm : {}
                    };

                    if(customData) {
                        if (typeof (customData) == "object") {
                            if (customData.hasOwnProperty('CreateIncidentForm')) { // indicates usage of the new object format
                                newObj = customData;
                            } else {
                                console.warn("The object format you are using has been deprecated, please update your call to use the new format.");
                                var okeys = Object.keys(legacyMapping);
                                //sweep through the legacy mapping keys and add new objects to newObj for each mapping that exists.
                                for (var i = 0; i < okeys.length; i++) {
                                    if (customData.hasOwnProperty(okeys[i])) {
                                        newObj.CreateIncidentForm[legacyMapping[okeys[i]]] = customData[okeys[i]];
                                    }
                                }
                            }

                            urlQueryString += encodeURI(JSON.stringify(newObj));
                        }
                    }

                    url += urlQueryString;

                    var staticArgs = {
                        Title: "Create a new ESM Incident",
                        Width: "95%",
                        Height: "90%",
                        Stacking: "update",
                        HideCloseButton: false
                    };

                    messageHub({
                        event: "modal.custom",
                        url: url,
                        options: staticArgs
                    });
                },

                /**
                * opens a richwidget popup pointing to the argued url, all values in "options" are passed to OS
                *
                * @param {String} url - url to open in the popup
                * @param {Object} options - "Title", "Width", "Height", "AutoResize", "RecenterOnResize", "HideCloseButton"
                *
                * @method createIncident
                * @public
                */
                customUrl: function (url, options) {
                    if (typeof url === "string") {

                        // temporary backwards-compatibility
                        if (typeof options === "number") {
                            console.warn("HUB.Model.customUrl() - deprecated argument listing");
                            var args = { Width: options };
                        } else {
                            args = options;
                        }

                        messageHub({
                            event: "modal.custom",
                            url: url,
                            options: args
                        });
                    } else {
                        console.error("HUB.Modal.customUrl(url: %s) - url is not optional", 
                            url);
                    }
                },

                /**
                * opens a richwidget popup pointing to the DeepLinkHandler web-block
                *
                * @param {String} guid - guid of the widget triggering the deeplink
                * @param {String} json - json to be saved into the deeplink
                *
                * @method deepLink
                * @public
                */
                deepLink: function (guid, json) {
                    if (guid) {
                        messageHub({
                            event: "modal.deeplink",
                            guid: guid,
                            json: json || "{}"
                        });
                    } else {
                        console.error("HUB.deepLink(guid: %s, json: %s) - invalid arguments",
                            guid, json);
                    }
                }
            },

            /**
             * Allows a public API to manually control TheHub's Expiration module via window messaging
             */
            Expiration: {

                /**
                 * Enable or disable TheHub's expiration module
                 *
                 * @param {Boolean} enabled - true will turn on expiration, false will disable
                 * @param {Boolean} debug - when true, Expiration module will log info messages to the console
                 *
                 * @method Enable
                 * @public
                 */
                Enable: function (enabled, debug) {
                    if (typeof enabled === "boolean") {
                        messageHub({
                            event: "expiration.enabled",
                            val: enabled,
                            debug: (typeof debug === "boolean" ? debug : false)
                        });
                    } else {
                        console.error("HUB.Expiration.Enable(enabled: %s, debug: %s) - invalid 'enabled' argument",
                            typeof enabled, typeof debug);
                    }
                },

                /**
                 * Reset the TheHub's expiration timer
                 * 
                 * @param {Boolean} debug - when true, Expiration module will log info messages to the console
                 *
                 * @method ResetTimer
                 * @public
                 */
                ResetTimer: function (debug) {
                    messageHub({
                        event: "expiration.reset",
                        val: true,
                        debug: (typeof debug === "boolean" ? debug : false)
                    });
                }
            },

            /**
             * Public API to spawn a new widget into TheHub, by it's name
             * Note: Prefer .SpawnWidgetByGuid() instead of this function
             *
             * @param {String} name - the User-Facing name of the widget you want to spawn
             *
             * @method SpawnWidgetByName
             * @public
             */
            SpawnWidgetByName: function (name) {
                if (typeof name === "string") {
                    messageHub({
                        event: "spawnwidget.name",
                        val: name
                    });
                } else {
                    console.error("HUB.SpawnWidgetByName(name: %s) - invalid argument", 
                        typeof name);
                }
            },

            /**
             * Public API to spawn a new widget into TheHub, by it's GUID
             *
             * @param {String} guid - the Unique ID of the widget you want to spawn
             *
             * @method SpawnWidgetByGuid
             * @public
             */
            SpawnWidgetByGuid: function (guid) {
                if (typeof guid === "string") {
                    messageHub({
                        event: "spawnwidget.guid",
                        val: guid
                    });
                } else {
                    console.error("HUB.SpawnWidgetByGuid(guid: %s) - invalid argument",
                        typeof guid);
                }
            },
            
            /**
            * used in the new client, since the iframe-modal cannot talk through window.parent
            * 
            * @method ClearAlerts
            * @public
            */
            ClearAlerts: function () {
                messageHub({
                    event: "alerts.clear"
                });
            },
            
            /**
            * used in the new client to refresh the desktop menubar
            *
            * @method RefreshDesktopMenu
            * @public
            */
            RefreshDesktopMenu: function () {
                messageHub({
                    event: "refresh.desktopmenu"
                });
            },
            
            /**
            * used in the new client to refresh the news menu
            *
            * @method RefreshNews
            * @public
            */
            RefreshNews: function () {
                messageHub({
                    event: "refresh.news"
                });
            }
        };

        return OutputAPI;
    };

})(window, document));