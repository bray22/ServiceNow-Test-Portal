/*
* DefectSummaryView.js
*/

define([
"widgets/cateams/charts/ChartView",
"widgets/cateams/CATeamsAjax",
"text!widgets/cateams/templates.html",
"jquery",
"underscore",
"require"], 
function (
ChartView, 
CATeamsAjax, 
templates, 
$, 
_, 
require) {
        
    "use strict";

    /**
    * renders the defect summary by program
    *
    * @class DefectSummaryView
    * @extends ChartView
    * @namespace cateams
    * @constructor
    * @public
    */
    return ChartView.extend({

        /**
        * defines all event bindings and their respective actions
        *
        * @property events
        * @readonly
        * @protected
        */
        events: {
            "click .on-select-tab[data-value='age']": "onSelectAgeTab",
            "click .on-select-tab[data-value='program']": "onSelectProgramTab",
            "click .on-select-tab[data-value='manager']": "onSelectManagerTab",
            "click .on-drilldown[data-drilldown='age']": "onAgeDrilldown"
        },

        /**
        * get data and render thedom
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.team = params.settings.team;

            this.model.set("Name", params.settings.team.Name + ", Defect Summary");

            this.$el.append(this.template("CATeam-Defect-Summary-Widget", null, null, templates));

            CATeamsAjax.GetDefectSummaryRoleData(params.settings.team.Name, function (roleData) {
                this.roleData = roleData;

                this.onSelectAgeTab({
                    target: this.$(".cateam-tab.active")[0]
                });
            }, this);
        },

        /**
        * util method, sums totals used for percentage calculations
        *
        * @param {Array} data
        *
        * @method sumData
        * @private
        */
        sumData: function (data) {
            var count = data.length,
                i = 0,
                output = {
                    Total: 0,
                    P00: 0,
                    P01: 0,
                    P02: 0,
                    P03: 0,
                    Blockers: 0
                };

            for (; i < count; i++) {
                output.Total += data[i].Total;
                output.P00 += data[i].P00;
                output.P01 += data[i].P01;
                output.P02 += data[i].P02;
                output.P03 += data[i].P03;
                output.Blockers += data[i].Blockers;
            }

            return output;
        },

        /**
        * user clicked on the 'by age' filter tab
        *
        * @method onSelectAgeTab
        * @private
        */
        onSelectAgeTab: function (e) {
            var $target = $(e.target);

            this.$(".cateam-tab.active").removeClass("active");

            this.$(".cateam-current-select").text("By Age Range");

            this.$(".cateam-tab[data-value='age']").addClass("active");

            this.showLoading(this.$(".cateam-large-body-inner, .cateam-defect-small-body-inner"), function () {
                CATeamsAjax.GetDefectSummaryByAge(function (data) {
                    data.sort(function (a, b) {
                        return a.Order - b.Order;
                    });

                    this.hideLoading(function () {
                        this.renderByAge(data);
                    });
                }, this);
            });
        },

        /**
        * render the 'by age' tab
        *
        * @param {Array} data
        *
        * @method renderByAge
        * @private
        */
        renderByAge: function (data) {
            this.$(".cateam-large-body-inner, .cateam-defect-small-body-inner").children().remove();

            this.$(".cateam-large-body-inner").append(this.template("CATeam-Defect-Summary-By-Age", null, null, templates));
            
            var $largeTarget = this.$(".cateam-large-body-list"),
                $smallTarget = this.$(".cateam-defect-small-body-inner"),
                This = this,
                sums = this.sumData(data);

            $largeTarget.children().remove();

            _.each(data, function (item, index) {
                var templateParams = {
                    PeriodEnding: item.Date,
                    Age: item.Age,
                    TotalPct: ((item.Total / sums.Total) * 100).toFixed(2),
                    Total: item.Total,
                    P00: item.P00,
                    P01: item.P01,
                    P02: item.P02,
                    P03: item.P03
                };

                var $item = $(this.template("CATeam-Defect-Summary-Age-Line-Item", templateParams, null, templates)).appendTo($largeTarget),
                    $smallItem = $(this.template("CATeam-Defect-Summary-Age-Small-Line-Item", templateParams, null, templates)).appendTo($smallTarget);

                $item.data("item", item);
                $smallItem.data("item", item);

                $item.find(".cateam-tbl-totalpct").toggleClass("cateam-drilldown on-drilldown", templateParams.TotalPct !== "0.00");
                $smallItem.find(".cateam-tbl-totalpct").toggleClass("cateam-drilldown on-drilldown", templateParams.TotalPct !== "0.00");

                $item.find(".cateam-tbl-total").toggleClass("cateam-drilldown on-drilldown", templateParams.Total !== 0);
                $smallItem.find(".cateam-tbl-total").toggleClass("cateam-drilldown on-drilldown", templateParams.Total !== 0);

                $item.find(".cateam-tbl-p00").toggleClass("cateam-drilldown on-drilldown", templateParams.P00 !== 0);
                $smallItem.find(".cateam-tbl-p00").toggleClass("cateam-drilldown on-drilldown", templateParams.P00 !== 0);

                $item.find(".cateam-tbl-p01").toggleClass("cateam-drilldown on-drilldown", templateParams.P01 !== 0);
                $smallItem.find(".cateam-tbl-p01").toggleClass("cateam-drilldown on-drilldown", templateParams.P01 !== 0);

                $item.find(".cateam-tbl-p02").toggleClass("cateam-drilldown on-drilldown", templateParams.P02 !== 0);
                $smallItem.find(".cateam-tbl-p02").toggleClass("cateam-drilldown on-drilldown", templateParams.P02 !== 0);

                $item.find(".cateam-tbl-p03").toggleClass("cateam-drilldown on-drilldown", templateParams.P03 !== 0);
                $smallItem.find(".cateam-tbl-p03").toggleClass("cateam-drilldown on-drilldown", templateParams.P03 !== 0);
            }, this);
        },

        /**
        * user clicked on the 'by program' filter tab
        *
        * @method onSelectProgramTab
        * @private
        */
        onSelectProgramTab: function (e) {
            this.$(".cateam-tab.active").removeClass("active");

            this.$(".cateam-tab[data-value='program']").addClass("active");

            this.$(".cateam-current-select").text("By Program");

            this.showLoading(this.$(".cateam-large-body-inner, .cateam-defect-small-body-inner"), function () {
                var owner = _.find(this.roleData, function (item) {
                    return item.Role.endsWith("PO");
                });

                if (owner) {
                    CATeamsAjax.GetDefectSummaryByProgram(owner.HID, function (data) {
                        this.hideLoading(function () {
                            this.renderByProgram(null, data);
                        });
                    }, this);
                } else {
                    this.hideLoading(function () {
                        this.renderByProgram("No data found matching the given criteria.", null);
                    });
                }
            });
        },

        /**
        * render the 'by program' tab
        *
        * @param {String} message - when no data is found, the message will give the reason why
        * @param {Array} data
        *
        * @method renderByProgram
        * @private
        */
        renderByProgram: function (message, data) {
            this.$(".cateam-large-body-inner, .cateam-defect-small-body-inner").children().remove();

            this.$(".cateam-large-body-inner").append(this.template("CATeam-Defect-Summary-By-Program", null, null, templates));

            if (!message) {
                var $target = this.$(".cateam-large-body-list"),
                    $smallTarget = this.$(".cateam-defect-small-body-inner"),
                    This = this,
                    sums = this.sumData(data);

                _.each(data, function (item, index) {
                    var templateParams = {
                        Program: item.Program,
                        Blockers: item.Blockers,
                        P00: item.P00,
                        P01: item.P01,
                        P02: item.P02,
                        P03: item.P03,
                        Total: item.Total,
                        TotalPct: ((item.Total / sums.Total) * 100).toFixed(2)
                    };

                    var $item = $(This.template("CATeam-Defect-Summary-Program-Line-Item", templateParams, null, templates)).appendTo($target),
                        $smallItem = $(This.template("CATeam-Defect-Summary-Small-Program-Line-Item", templateParams, null, templates)).appendTo($smallTarget);

                    if (index % 2 === 0) {
                        $smallItem.addClass("cateam-defect-odd");
                    }

                    $item.data("item", item);
                    $smallItem.data("item", item);

                    $item.find(".cateam-tbl-totalpct").toggleClass("cateam-drilldown on-drilldown", templateParams.TotalPct !== "0.00");
                    $smallItem.find(".cateam-tbl-totalpct").toggleClass("cateam-drilldown on-drilldown", templateParams.TotalPct !== "0.00");

                    $item.find(".cateam-tbl-total").toggleClass("cateam-drilldown on-drilldown", templateParams.Total !== 0);
                    $smallItem.find(".cateam-tbl-total").toggleClass("cateam-drilldown on-drilldown", templateParams.Total !== 0);

                    $item.find(".cateam-tbl-p00").toggleClass("cateam-drilldown on-drilldown", templateParams.P00 !== 0);
                    $smallItem.find(".cateam-tbl-p00").toggleClass("cateam-drilldown on-drilldown", templateParams.P00 !== 0);

                    $item.find(".cateam-tbl-p01").toggleClass("cateam-drilldown on-drilldown", templateParams.P01 !== 0);
                    $smallItem.find(".cateam-tbl-p01").toggleClass("cateam-drilldown on-drilldown", templateParams.P01 !== 0);

                    $item.find(".cateam-tbl-p02").toggleClass("cateam-drilldown on-drilldown", templateParams.P02 !== 0);
                    $smallItem.find(".cateam-tbl-p02").toggleClass("cateam-drilldown on-drilldown", templateParams.P02 !== 0);

                    $item.find(".cateam-tbl-p03").toggleClass("cateam-drilldown on-drilldown", templateParams.P03 !== 0);
                    $smallItem.find(".cateam-tbl-p03").toggleClass("cateam-drilldown on-drilldown", templateParams.P03 !== 0);

                    $item.find(".cateam-tbl-blockers").toggleClass("cateam-drilldown on-drilldown", templateParams.P03 !== 0);
                    $smallItem.find(".cateam-tbl-blockers").toggleClass("cateam-drilldown on-drilldown", templateParams.P03 !== 0);
                });
            } else {
                this.$(".cateam-large-body-list").append(this.template("CATeam-Defect-Summary-Program-NoData", {
                    Message: message
                }, null, templates));
            }
        },

        /**
        * user clicked on the 'by manager' filter tab
        *
        * @method onSelectManagerTab
        * @private
        */
        onSelectManagerTab: function (e) {
            this.$(".cateam-tab.active").removeClass("active");

            this.$(".cateam-tab[data-value='manager']").addClass("active");

            this.$(".cateam-current-select").text("By Manager");

            this.showLoading(this.$(".cateam-large-body-inner, .cateam-defect-small-body-inner"), function () {
                var owner = _.find(this.roleData, function (item) {
                    return item.Role.endsWith("PO");
                });

                if (owner) {
                    CATeamsAjax.GetDefectSummaryByManager(owner.HID, function (data) {
                        this.hideLoading(function () {
                            this.renderByManager(null, data);
                        });
                    }, this);
                } else {
                    this.hideLoading(function () {
                        this.renderByManager("No data found matching the given criteria.", null);
                    });
                }
            });
        },

        /**
        * render the 'by manager' tab
        *
        * @param {String} message - when no data is found, the message will give the reason why
        * @param {Array} data
        *
        * @method renderByManager
        * @private
        */
        renderByManager: function (message, data) {
            this.$(".cateam-large-body-inner, .cateam-defect-small-body-inner").children().remove();

            this.$(".cateam-large-body-inner").append(this.template("CATeam-Defect-Summary-By-Manager", null, null, templates));

            if (!message) {
                var $target = this.$(".cateam-large-body-list"),
                    $smallTarget = this.$(".cateam-defect-small-body-inner"),
                    This = this,
                    sums = this.sumData(data);

                _.each(data, function (item, index) {
                    var templateParams = {
                        Manager: item.Manager,
                        Blockers: item.Blockers,
                        P00: item.P00,
                        P01: item.P01,
                        P02: item.P02,
                        P03: item.P03,
                        Total: item.Total,
                        TotalPct: ((item.Total / sums.Total) * 100).toFixed(2)
                    };

                    var $item = $(This.template("CATeam-Defect-Summary-Manager-Line-Item", templateParams, null, templates)).appendTo($target),
                        $smallItem = $(This.template("CATeam-Defect-Summary-Small-Manager-Line-Item", templateParams, null, templates)).appendTo($smallTarget);

                    $item.data("item", item);
                    $smallItem.data("item", item);

                    if (index % 2 === 0) {
                        $smallItem.addClass("cateam-defect-odd");
                    }

                    $item.find(".cateam-tbl-totalpct").toggleClass("cateam-drilldown on-drilldown", templateParams.TotalPct !== "0.00");
                    $smallItem.find(".cateam-tbl-totalpct").toggleClass("cateam-drilldown on-drilldown", templateParams.TotalPct !== "0.00");

                    $item.find(".cateam-tbl-total").toggleClass("cateam-drilldown on-drilldown", templateParams.Total !== 0);
                    $smallItem.find(".cateam-tbl-total").toggleClass("cateam-drilldown on-drilldown", templateParams.Total !== 0);

                    $item.find(".cateam-tbl-p00").toggleClass("cateam-drilldown on-drilldown", templateParams.P00 !== 0);
                    $smallItem.find(".cateam-tbl-p00").toggleClass("cateam-drilldown on-drilldown", templateParams.P00 !== 0);

                    $item.find(".cateam-tbl-p01").toggleClass("cateam-drilldown on-drilldown", templateParams.P01 !== 0);
                    $smallItem.find(".cateam-tbl-p01").toggleClass("cateam-drilldown on-drilldown", templateParams.P01 !== 0);

                    $item.find(".cateam-tbl-p02").toggleClass("cateam-drilldown on-drilldown", templateParams.P02 !== 0);
                    $smallItem.find(".cateam-tbl-p02").toggleClass("cateam-drilldown on-drilldown", templateParams.P02 !== 0);

                    $item.find(".cateam-tbl-p03").toggleClass("cateam-drilldown on-drilldown", templateParams.P03 !== 0);
                    $smallItem.find(".cateam-tbl-p03").toggleClass("cateam-drilldown on-drilldown", templateParams.P03 !== 0);

                    $item.find(".cateam-tbl-blockers").toggleClass("cateam-drilldown on-drilldown", templateParams.Blockers !== 0);
                    $smallItem.find(".cateam-tbl-blockers").toggleClass("cateam-drilldown on-drilldown", templateParams.Blockers !== 0);
                });
            } else {
                this.$(".cateam-large-body-list").append(this.template("CATeam-Defect-Summary-Program-NoData", {
                    Message: message
                }, null, templates));
            }
        },

        /**
        * util method used to dynamically generate an array of age filters used for the 'dsf' drillthrough filter
        *
        * @param {Array} ages - ages in weeks
        * @param {String} ops - operators such as less-than, greater-than, or between (-)
        * @return {Array} the age filter array to concat onto the dsf filter
        *
        * @method generateAgeParams
        * @public
        */
        generateAgeParams: function (ages, ops) {
            var output = [];

            if (ops === "<" && ages.length === 1) {
                output.push({
                    field: "Age",
                    operator: "lte",
                    value: parseInt(ages[0], 10) * 7
                });
            } else if (ops === ">" && ages.length === 1) {
                output.push({
                    field: "Age",
                    operator: "gt",
                    value: parseInt(ages[0], 10) * 7
                });
            } else if (ops === "-" && ages.length === 2) {
                output.push({
                    field: "Age",
                    operator: "gt",
                    value: parseInt(ages[0], 10) * 7
                });
                output.push({
                    field: "Age",
                    operator: "lte",
                    value: parseInt(ages[1], 10) * 7
                });
            }

            return output;
        },

        /**
        * drilldown by age
        *
        * @method onAgeDrilldown
        * @private
        */
        onAgeDrilldown: function (e) {
            var dataItem = $(e.target).closest(".cateam-defect-item").data("item"),
                ageParams = this.generateAgeParams(dataItem.Age.match(/\d+/g), dataItem.Age.match(/[<>-]/g)[0]),
                args = [{
                    logic: "or",
                    filters: [{
                        field: "Priority",
                        operator: "eq",
                        value: "P00"
                    }, {
                        field: "Priority",
                        operator: "eq",
                        value: "P01"
                    }, {
                        field: "Priority",
                        operator: "eq",
                        value: "P02"
                    }, {
                        field: "Priority",
                        operator: "eq",
                        value: "P03"
                    }]
                }, {
                    logic: "or",
                    filters: [{
                        field: "ProductFamily",
                        operator: "eq",
                        value: "Unified Systems"
                    }, {
                        field: "ProductFamily",
                        operator: "eq",
                        value: "BearCat"
                    }, {
                        field: "ProductFamily",
                        operator: "eq",
                        value: "USD Applications"
                    }]
                }, {
                    logic: "or",
                    filters: [{
                        field: "Product",
                        operator: "eq",
                        value: "VNX"
                    }, {
                        field: "Product",
                        operator: "eq",
                        value: "VNXe"
                    }, {
                        field: "Product",
                        operator: "eq",
                        value: "Unisphere Central"
                    }]
                }, {
                    field: "IsChild",
                    operator: "eq",
                    value: false
                }];

            if (ageParams.length) {
                args = args.concat(ageParams);
            }

            require(["view/IframeModalView"], function (IframeModalView) {
                new IframeModalView({
                    title: "Drilldown by Age",
                    url: CATeamsAjax.domain + "/hubapps/cash/#?source=remedyIssue&p12=false&dsf=" + JSON.stringify(args),
                    width: "90%"
                });
            });
        }
    });
});