/*
* Util.js
*
* Basic Utility API
* Global functions and general fixes, extensions to basic data types, etc...
*/

define(["moment"], function (moment) {
    "use strict";

    if (typeof Array.prototype.clear !== "function") {
        Object.defineProperty(Array.prototype, "clear", {
            enumerable: false,
            value: function () {
                this.length = 0;
            }
        });
    }

    if (typeof console.log !== "function") {
        console.log = function () {};
    }

    if (typeof console.warn !== "function") {
        console.warn = function () {};
    }

    if (typeof console.error !== "function") {
        console.error = function () {};
    }

    if (typeof console.info !== "function") {
        console.info = function () {};
    }

    if (typeof console.shout !== "function") {
        console.shout = function () {
            console.log("!!!--------------------------------------------!!!");
            console.log.apply(this, arguments);
            console.log("!!!--------------------------------------------!!!");
        };
    }

    if (typeof Math.clamp !== "function") {
        Math.clamp = function (val, min, max) {
            if (val < min) {
                val = min;
            }
            if (val > max) {
                val = max;
            }
            return val;
        };
    }

    return {

        /**
        * parses the url for a query parameters, return a key-value object of the arguments
        *
        * @param {String} url - url with possible query paramters
        * @return {Object} key-value object with parsed query parameters
        *
        * @method ParseQueryString
        * @module Util
        * @public
        */
        ParseQueryString: function (url) {
            var output = {},
                query,
                parts, 
                i = 0,
                arg;

            if (url && url.indexOf("?") >= 0) {
                query = url.substr(url.indexOf("?") +1, (url.indexOf("#") > 0 ? (url.indexOf("#") - url.indexOf("?") -1) : url.length));
                if (query) {
                    parts = query.split("&");
                    for (; i < parts.length; i++) {
                        arg = parts[i].split("=");
                        output[arg[0]] = arg[1];
                    }
                }
            }

            return output;
        },

        /**
        * gets a cookie value given the cookie name
        *
        * @param {String} c_name - url with possible query paramters
        * @return {String} - value of cookie
        *
        * @method GetCookie
        * @module Util
        * @public
        */
        GetCookie: function (c_name) {
            var ARRcookies = document.cookie.split(";"),
                name,
                val,
                i = 0;

            for ( ; i < ARRcookies.length; i++) {
                name = ARRcookies[i].substr(0, ARRcookies[i].indexOf("=")),
                val = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1),
                name = name.replace(/^\s+|\s+$/g, "");

                if (name == c_name) {
                    return decodeURIComponent(val);
                }
            }

            return null;
        },

        /**
        * determine a boolean value from an unknown data-type
        *
        * @param {Unknown} val - a value to parse for boolean value
        * @return {Boolean} 
        *
        * @method ParseBool
        * @module Util
        * @public
        */
        ParseBool: function (val) {
            var output = false;

            switch(true) {
                case typeof val === "boolean": 
                    output = val; 
                    break;

                case typeof val === "number": 
                    output = !!val;
                    break;

                case typeof val === "string": 
                    output = val.toUpperCase() === "TRUE";
                    break;
            }

            return output;
        },

        /**
        * make sure we're in an expected browser
        *
        * @return {Boolean}
        *
        * @method IsValidBrowser
        * @module Util
        * @public
        */
        IsValidBrowser: function () {
            function _isOldIE (ua) {
                var msie = ua.indexOf("MSIE "),
                    vs = parseInt(ua.substring(msie +5, ua.indexOf(".", msie)));
                return vs < 10;
            }

            function _isOpera (ua) {
                return ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1;
            }

            var output = true,
                ua = navigator.userAgent;

            if (_isOldIE(ua)) {
                output = false;
            } else if (_isOpera(ua)) {
                output = false;
            }

            return output;
        },

        /**
        * parses csv content into an array of objects
        *
        * @param {String} txt - csv content
        * @param {String} delimiter
        *
        * @method ParseCsv
        * @module Util
        * @public
        */
        ParseCsv: function (txt, delimiter) {
            if (typeof txt !== "string" || typeof delimiter !== "string") {
                console.error("ParseCsv(%s, %s) - invalid arguments", txt, delimiter);
                return null;
            }

            var objPattern = new RegExp("(\\" + delimiter + "|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\"\\" + delimiter + "\\r\\n]*))", "gi"),
                nested = [[]],
                matches = null,
                matchedDelimiter,
                matchedValue;

            while (matches = objPattern.exec(txt)) {
                matchedDelimiter = matches[1];
                if (matchedDelimiter.length && matchedDelimiter !== delimiter) {
                    nested.push([]);
                }

                if (matches[2]){
                    matchedValue = matches[2].replace(new RegExp("\"\"", "g"), "\"");
                } else {
                    matchedValue = matches[3];
                }

                nested[nested.length -1].push(matchedValue);
            }

            var count = nested.length,
                i = 1,
                jsonOut = [],
                create = function (model, values) {
                    var nested = {};
                    for (var t = 0; t < values.length; t++) {
                        if (model[t] !== "" && values[t] !== "") {
                            nested[model[t]] = values[t];
                        }
                    }
                    return nested;
                };

            for (; i<count; i++) {
                jsonOut.push(create(nested[0], nested[i]));
            }

            return jsonOut;
        },

        /**
        * notify to the user to allow popups from this site
        *
        * @method NotifyPopupBlocker
        * @public
        */
        NotifyPopupBlocker: function () {
            require(["view/ConfirmationView", "i18n!nls/Hub"], function (ConfirmationView, Strings) {
                var options = {};

                options[Strings.PopupBlockerNotificationConfirm] = function () {
                    /* Where's Waldo!? Not Here! */
                };

                new ConfirmationView({
                    title: Strings.PopupBlockerNotificationTitle,
                    message: Strings.PopupBlockerNotificationMessage,
                    options: options,
                    width: 428,
                    height: 154
                });
            });
        },

        /**
        * determine if the argued thing is an array
        *
        * @param {Object} obj
        * @return {Boolean}
        *
        * @method IsArray
        * @public
        */
        IsArray: function (obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },

        /**
        * determine if the argued thing is an object
        *
        * @param {Object} obj
        * @return {Boolean}
        *
        * @method IsObject
        * @public
        */
        IsObject: function (obj) {
            return Object.prototype.toString.call(obj) === "[object Object]";
        },

        /**
        * convert the server timestamp timezone into users local timezone
        *
        * @param {utcDateTime} Number
        * @return {Number}
        *
        * @method ToUserTimezone
        * @public
        */
        ToUserTimezone: function (utcDateTime) {
            return moment(utcDateTime).add(moment(utcDateTime).utcOffset()*60000, 'ms');
        }
    };
});