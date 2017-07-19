/*
* app.js
*
* Entry point for libraries, library configurations, behavior flagging,
* and all pre-init logic before the application is actually kicked-off
*/

define(["underscore", "backbone", "router", "bootstrap", "jquery", "gridster"], 
	function (_, Backbone, Router, Bootstrap, $, gridster) {
    "use strict";

    // mustach style interpolation eg: <div id='{{ Example }}'/>
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    // silent hash-history start, we take care of it ourselves in main.js
    Backbone.history.start({
        silent: true
    });

    return Router;
});