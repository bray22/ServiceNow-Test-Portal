/*
* RadarAjax.js
*/

define(["jquery", "util/Util"], function ($, Util) {
    "use strict";

    /**
    * module to define all ajax requests used by radar
    *
    * @module RadarAjax
    * @namespace radar
    * @public
    */
    var Ajax = {},
        _domain = "https://radar.hub.cec.lab.emc.com";

    Ajax.domain = _domain;
    Ajax.appmodeDomain = "https://radar.hub.cec.lab.emc.com";
    Ajax.cashBaseUrl = "https://apps.hub.cec.lab.emc.com/wxp-prd/";
    
    /**
    * get all possible programs used in the program chart selector wizard
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetProgramSelectors
    * @module RadarAjax
    * @public
    */
    Ajax.GetProgramSelectors = function (onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query?p=1&z=programselector",
            type: "GET",
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    var _metaCache = {};

    /**
    * get meta data associated with a program
    * note: this data gets cached in context memory
    *
    * @param {String} program
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetProgramMeta
    * @module RadarAjax
    * @public
    */
    Ajax.GetProgramMeta = function (program, onComplete, context) {
        // data already present
        if (Util.IsObject(_metaCache[program])) {
            onComplete.call(context || window, _metaCache[program]);
            return;
        }

        // request already started
        if (Util.IsArray(_metaCache[program])) {
            _metaCache[program].push({
                callback: onComplete,
                context: context
            });
            return;
        }

        // no request yet
        _metaCache[program] = [{
            callback: onComplete,
            context: context
        }];

        $.ajax({
            url: _domain + "/Json/MetaDataQuery/metadata?z=newmetadata&p=" + program,
            type: "GET",
            success: function (data) {
                _.each(_metaCache[program], function (item) {
                    item.callback.call(item.context || window, data);
                });
                _metaCache[program] = data;
            },
            error: function () {
                _.each(_metaCache[program], function (item) {
                    item.callback.call(item.context || window, null);
                });
                _metaCache[program] = null;
            }
        });
    };

    /**
    * get incoming backlog
    *
    * @param {Object} params
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetProgramMeta
    * @module RadarAjax
    * @public
    */
    Ajax.GetBacklog = function (params, onComplete, context) {
        return $.ajax({
            url: _domain + "/Json/DICE/",
            type: "GET",
            data: params,
            success: function (data) {
                var convertedData = Util.ParseCsv(data, "|");
                onComplete.call(context || window, convertedData);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * Get test progress
    *
    * @param {Object} params
    * @param {String} cycle
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetProgramMeta
    * @module RadarAjax
    * @public
    */
    Ajax.GetTestProgress = function (program, cycle, onComplete, context) {
        return $.ajax({
            url: _domain + "/Classes/Misc/sql.asp",
            type: "GET",
            data: {
                z: "testprogress",
                p: program,
                dv: cycle
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
    * retrieve the promoted builds list for the given program
    *
    * @param {String} program
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetPromotedBuilds
    * @module RadarAjax
    * @public
    */
    Ajax.GetPromotedBuilds = function (program, onComplete, context) {
        return $.ajax({
            url: _domain + "/Classes/Misc/sql.asp",
            type: "GET",
            data: {
                z: "promotedbuilds",
                p: program
            },
            success: function (data) {
                var output;

                try {
                    output = JSON.parse(data);
                } catch (e) {
                    output = null;
                } finally {
                    onComplete.call(context || window, output);
                }
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * retrieve a promoted build TBV (whatever that means)
    *
    * @param {String} program
    * @param {String} version
    * @param {Number} dt - (epoch time)
    * @param {String} status
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetBuildTBV
    * @module RadarAjax
    * @private
    */
    Ajax.GetBuildTBV = function (program, version, dt, status, onComplete, context) {
        return $.ajax({
            url: _domain + "/Classes/Misc/sql.asp",
            type: "GET",
            data: {
                t: 1,
                ver: version,
                z: "buildtbvs",
                p: program,
                dt: dt,
                status: status
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
    * search for an AR from promoted builds
    *
    * @param {String} program
    * @param {Number} ar
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetBuildARSearch
    * @module RadarAjax
    * @public
    */
    Ajax.GetBuildARSearch = function (program, ar, onComplete, context) {
        return $.ajax({
            url: _domain + "/Classes/Misc/sql.asp",
            type: "GET",
            data: {
                z: "buildarsearch",
                t: 1,
                p: program,
                ar: ar
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
    * get the build progress for a program
    *
    * @param {String} program
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetBuildProgress
    * @module RadarAjax
    * @public
    */
    Ajax.GetBuildProgress = function (program, onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                p: program,
                z: "code",
                days: 60
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
    * gets the timestamp for a particular chart
    *
    * @param {String} chart - the chart type
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetPolltime
    * @module RadarAjax
    * @public
    */
    Ajax.GetPolltime = function (chart, onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                z: "polltime",
                chart: chart
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
    * Get the list of current features for the given program
    *
    * @param {String} program
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetFeatureSelect
    * @module RadarAjax
    * @public
    */
    Ajax.GetFeatureSelect = function (program, onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                z: "featureselect",
                p: program
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
    * get the list of feature cycles for the given program
    *
    * @param {String} program
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetFeatureCycles
    * @module RadarAjax
    * @public
    */
    Ajax.GetFeatureCycles = function (program, onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                z: "test-tabs-dates",
                p: program
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
    * Get the list of features for the feature summary chart
    *
    * @param {String} program
    * @param {String} query - comes with the feature meta data
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetFeatureSummary
    * @module RadarAjax
    * @public
    */
    Ajax.GetFeatureSummary = function (program, query, onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                z: "fsummary",
                p: program,
                dv: query
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
    * Get the data list used for the Feature open backlog trend view
    *
    * @param {String} program
    * @param {Object} params
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetFeatureOpenBacklogTrend
    * @module RadarAjax
    * @public
    */
    Ajax.GetFeatureOpenBacklogTrend = function (params, onComplete, context) {
        return $.ajax({
            url: _domain + "/Json/DICE/ddv",
            type: "GET",
            data: params,
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    /**
    * get the data used to display program test est
    *
    * @param {String} program
    * @param {function} onComplete
    * @param {Object} context
    *
    * @method GetTestEst
    * @module RadarAjax
    * @public
    */
    Ajax.GetTestEst = function (program, onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                z: "inquestdurability",
                p: program
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
    * get the test status data for rendering
    *
    * @param {String} program
    * @param {String} cycle
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetTestStatus
    * @module RadarAjax
    * @public
    */
    Ajax.GetTestStatus = function (program, cycle, onComplete, context) {
        return $.ajax({
            url: _domain + "/Classes/Misc/sql.asp",
            type: "GET",
            data: {
                z: "testpie",
                dim: 4,
                p: program,
                dv: cycle
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
    * get the test cft data for rendering
    *
    * @param {String} program
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetTestCFT
    * @module RadarAjax
    * @pulic
    */
    Ajax.GetTestCFT = function (program, onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                z: "programCFT",
                p: program,
                dt: 1
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
    * get a list of cross test defects for the given program
    *
    * @param {String} program
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetCrossTestDefects
    * @module RadarAjax
    * @pulic
    */
    Ajax.GetCrossTestDefects = function (program, onComplete, context) {
        return $.ajax({
            url: _domain + "/Classes/Misc/sql.asp",
            type: "GET",
            data: {
                t: 1,
                dt: 1,
                p: program,
                z: "crosstestdefects"
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
    * get drilldown data for the argued AR list
    *
    * @param {String} ar - list of comma delimited ars to search
    * @param {function} onComplete
    * @param {Object} context
    *
    * @method ARDrillDown
    * @module RadarAjax
    * @public
    */
    Ajax.ARDrillDown = function (ar, onComplete, context) {
        return $.ajax({
            url: _domain + "/Classes/Misc/sql.asp",
            type: "GET",
            data: {
                p: 1,
                z: "ars",
                t: 1,
                ars: ar
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
    * get drilldown data for argued CFT image's ARs
    *
    * @param {String} program
    * @param {String} image
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method CftArDrilldown
    * @module RadarAjax
    * @public
    */
    Ajax.CftArDrilldown = function (program, image, onComplete, context) {
        return $.ajax({
            url: _domain + "/Classes/Misc/sql.asp",
            type: "GET",
            data: {
                t: 1,
                z: "crossardetails",
                p: program,
                img: image
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
    * get drilldown data for argued CFT image
    *
    * @param {String} program
    * @param {String} image
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method CftArDrilldown
    * @module RadarAjax
    * @public
    */
    Ajax.CftImageDrilldown = function (program, image, onComplete, context) {
        return $.ajax({
            url: _domain + "/Classes/Misc/sql.asp",
            type: "GET",
            data: {
                t: 1,
                z: "crossdetails",
                p: program,
                img: image
            },
            success: function (data) {
                onComplete.call(context || window, data);
            },
            error: function () {
                onComplete.call(context || window, null);
            }
        });
    };

    return Ajax;
});