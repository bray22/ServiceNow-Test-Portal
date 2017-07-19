/*
* View.js
*/

define(["backbone", "underscore", "jquery", "text!templates.html", "i18n!nls/Hub"], function (Backbone, _, $, templates, Strings) {
    "use strict";

    var _templateCache = {},
        _$templates = $(templates);

    /**
    * Extends Backbone.View, and provides parent functionality common for all views
    *
    * @class View
    * @constructor
    * @extends Backbone.View
    * @namespace view
    * @public
    */
    return Backbone.View.extend({

        /**
        * replaces all localization strings in the given html with entries found in strings argument
        *
        * @param {String} html - html to localize
        * @param {Object} strings - kv pair of identifiers and their localized text
        *
        * @method _localize
        * @protected
        */
        localize: function (html, strings) {
            if (strings) {
                var parts = html.match(/\|\|(.+?)\|\|/g);
                if (parts !== null) {
                    for (var i = 0; i < parts.length; i++) {
                        var id = parts[i].replace(/\||str:/g, "");
                        if (strings[id]) {
                            html = html.replace("||str:" + id + "||", strings[id]);
                        }
                    }
                }
            }
            return html;
        },

        /**
        * entry point of this.template() - after getting/caching/validating the template
        *
        * @param {Function} method - underscore templating function
        * @param {Object} params - values to mix into html
        * @param {Object} strings - localization strings
        *
        * @method _templatize
        * @protected
        */
        templatize: function (method, params, strings) {
            return this.localize(method(params), strings);
        },

        /**
        * gets an html template out of the hub's template.html file, or the supplied source argument,
        * and replaces identifiers with values and string messages
        *
        * @param {String} tid - template element id
        * @param {Object} params - values to mix into html, {{ ID }}
        * @param {Object} strings - localization strings, ||str:ID||
        * @param {String} source - optional parameter when the default templates.html is not used
        *                       source should be used by integrated widgets only.
        *
        * @method template
        * @public
        */
        template: function (tid, params, strings, source) {
            if (_templateCache[tid]) {
                return this.templatize(_templateCache[tid], params || {}, strings || Strings);
            } else {
                var $source = source ? $(source) : _$templates,
                    $template = $source.find("#" + tid);
                    
                if ($template.length) {
                    _templateCache[tid] = _.template($template.html());
                    return this.templatize(_templateCache[tid], params || {}, strings || Strings);
                } else {
                    console.error("View.template('%s', %o) - unable to locate template", tid, params);
                }
            }
        },

        /**
        * add a new stylesheet to the DOM, calling back when complete.
        *
        * note: the link will be considered a timeout-failure in 15 seconds
        * note: will not work with an empty css file
        * note: if a link with a matching href is already found, the callback will immediately be executed
        * note: should NOT be abused, causes a full dom reflow evaluation
        *
        * @param {String} path - the relative path starting from index.html directory
        * @param {Function} callback - callback executed when the stylesheet has been downloaded and linked
        * @param {Object} context - optional context to call the callback with ('this' = context)
        *
        * @method addStylesheet
        * @public
        */
        addStylesheet: function (path, callback, context) {
            if ($("link[href='" + path + "']").length) {
                callback.call(context || window, true);
                return;
            }

            var head = $("head")[0],
                link = document.createElement("link"),
                sheet,
                cssRules;

            link.setAttribute("href", path);
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");

            if ("sheet" in link) {
                sheet = "sheet";
                cssRules = "cssRules";
            } else {
                sheet = "styleSheet";
                cssRules = "rules";
            }

            var interval = setInterval(function () {
                try {
                    if (link[sheet] && link[sheet][cssRules].length) {
                        clearInterval(interval);
                        clearTimeout(timeout);
                        callback.call(context || window, true);
                    }
                } 
                catch (e) {
                    console.error("Unable to link stylesheet");
                }
            }, 10);

            var timeout = setTimeout(function () {
                clearInterval(interval);
                clearTimeout(timeout);
                head.removeChild(link);
                callback.call(context || window, false);
            }, 15000);

            head.appendChild(link);
        }
    });
});