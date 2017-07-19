/*
* CATeamsAjax.js
*/

define(["jquery"], function ($) {
    "use strict";

    /**
    * ajax module containing all ajax requests used by the CATeams widget
    *
    * @module CATeamsAjax
    * @namespace cateams
    * @public
    */
    var _domain = "https://radar.hub.cec.lab.emc.com",
        Ajax = {
            domain: _domain
        };

    /**
    * Get the team list for the config page
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetTeamList
    * @module CATeamsAjax
    * @public
    */
    Ajax.GetTeamList = function (onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                z: "allprojects"
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
    * Get the list of iterations for the given project
    *
    * @param {Number} project
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetIterationList
    * @module CATeamsAjax
    * @public
    */
    Ajax.GetIterationList = function (project, onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                z: "IterationList",
                project: project
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
    * get a list of selectable programs for the CATeam open backlog chart view
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetProgramList
    * @module CATeamsAjax
    * @public
    */
    Ajax.GetProgramList = function (onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                p: 1,
                z: "programselector"
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
    * retrieve the iteration burndown
    *
    * @param {number} project
    * @param {number} cid
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetIterationBurndown
    * @module CATeamsAjax
    * @public
    */
    Ajax.GetIterationBurndown = function (project, cid, onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                z: "caIterationBurndown",
                project: project,
                cid: cid
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
    * get open backlog data
    *
    * @param {String} cateam
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetOpenBacklog
    * @module CATeamsAjax
    * @public
    */
    Ajax.GetOpenBacklog = function (cateam, onComplete, context) {
        $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                z: "teamspo",
                cateam: cateam
            },
            success: function (data) {
                if (data && data.length) {
                    $.ajax({
                        url: _domain + "/Json/DICE/ddv",
                        type: "GET",
                        data: {
                            tab: "OBLT",
                            p1: "P00|P01|P02",
                            p2: "Bug",
                            p4: "Unified Systems|BearCat|USD Applications",
                            p5: "VNX|VNXe|Unisphere Central",
                            dv: "program",
                            p10: data[0].name
                        }, 
                        success: function (data) {
                            onComplete.call(context || window, data);
                        },
                        error: function () {
                            onComplete.call(context || window, null);
                        }
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
    * get the role data associated with a CATeam
    *
    * @param {String} teamName
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetDefectSummaryRoleData
    * @public
    */
    Ajax.GetDefectSummaryRoleData = function (teamName, onComplete, context) {
        return $.ajax({
            url: _domain + "/json/query",
            type: "GET",
            data: {
                z: "caTeamRoles",
                ca: teamName
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
    * get summarized issues by age... 
    * avert your gaze, I have no freakin clue what this 'filter' is doing here :(
    *
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetDefectSummaryByAge
    * @public
    */
    Ajax.GetDefectSummaryByAge = function (onComplete, context) {
        return $.ajax({
            url: _domain + "/CustomSearch/GetSummarizedIssuesByAge",
            type: "POST",
            data: {
                filter: [
                    "(Priority", "eq", "'P00'", 
                        "or", "Priority", "eq", "'P01'", 
                        "or", "Priority", "eq", "'P02'", 
                        "or", "Priority", "eq", "'P03')", 
                    "and", "Type", "eq", "'Bug'", 
                    "and", "IsDevOpen", "eq", "true", 
                    "and", "(ProductFamily", "eq", "'Unified Systems'", 
                        "or", "ProductFamily", "eq", "'BearCat'", 
                        "or", "ProductFamily", "eq", "'USD Applications')", 
                    "and", "(Product", "eq", "'VNX'", 
                        "or", "Product", "eq", "'VNXe'", 
                        "or", "Product", "eq", "'Unisphere Central')", 
                    "and", "IsChild", "eq", "false"
                ].join("~")
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
    * get summarized issues by program
    *
    * @param {String} hid
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetDefectSummaryByProgram
    * @public
    */
    Ajax.GetDefectSummaryByProgram = function (hid, onComplete, context) {
        $.ajax({
            url: _domain + "/CustomSearch/GetSummarizedIssues",
            type: "POST",
            data: {
                filter: [
                    "(Priority", "eq", "'P00'", 
                        "or", "Priority", "eq", "'P01'", 
                        "or", "Priority", "eq", "'P02'", 
                        "or", "Priority", "eq", "'P03')", 
                    "and", "Type", "eq", "'Bug'", 
                    "and", "IsDevOpen", "eq", "true", 
                    "and", "(ProductFamily", "eq", "'Unified Systems'", 
                        "or", "ProductFamily", "eq", "'BearCat'", 
                        "or", "ProductFamily", "eq", "'USD Applications')", 
                    "and", "(Product", "eq", "'VNX'", 
                        "or", "Product", "eq", "'VNXe'", 
                        "or", "Product", "eq", "'Unisphere Central')", 
                    "and", "AssToHid", "startswith", "'" + hid + "'", 
                    "and", "IsChild", "eq", "false"
                ].join("~")
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
    * get summarized issues by direct manager
    *
    * @param {String} hid
    * @param {Function} onComplete
    * @param {Object} context
    *
    * @method GetDefectSummaryByManager
    * @public
    */
    Ajax.GetDefectSummaryByManager = function (hid, onComplete, context) {
        return $.ajax({
            url: _domain + "/CustomSearch/GetSummarizedIssuesByMgr",
            type: "POST",
            data: {
                filter: [
                    "(Priority", "eq", "'P00'", 
                        "or", "Priority", "eq", "'P01'", 
                        "or", "Priority", "eq", "'P02'", 
                        "or", "Priority", "eq", "'P03')", 
                    "and", "Type", "eq", "'Bug'", 
                    "and", "IsDevOpen", "eq", "true", 
                    "and", "(ProductFamily", "eq", "'Unified Systems'", 
                        "or", "ProductFamily", "eq", "'BearCat'", 
                        "or", "ProductFamily", "eq", "'USD Applications')", 
                    "and", "(Product", "eq", "'VNX'", 
                        "or", "Product", "eq", "'VNXe'", 
                        "or", "Product", "eq", "'Unisphere Central')", 
                    "and", "AssToHid", "startswith", "'" + hid + "'", 
                    "and", "IsChild", "eq", "false"
                ].join("~")
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
    * data getter call for TopRankedFeatureBacklogView
    *
    * @param {String} caTeamId
    * @param {Function} onComplete
    * @param {Object} context - what "this" should be point to
    *
    * @method GetTopRanked
    * @public
    */
    Ajax.GetTopRanked = function (caTeamId, onComplete, context) {
        return $.ajax({
            url: _domain + "/json/AjaxGridQuery?z=rallyFeatureBacklog&backlogproject=" + caTeamId,
            type: "GET",
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