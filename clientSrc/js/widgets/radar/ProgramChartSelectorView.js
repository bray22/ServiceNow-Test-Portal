/*
* ProgramChartSelectorView.js
*/

define([
"require", 
"view/View", 
"text!widgets/radar/templates.html", 
"jquery", 
"widgets/radar/util/RadarAjax", 
"underscore", 
"widgets/radar/util/ChartSelectors"], 
function (
require, 
View, 
templates, 
$, 
RadarAjax, 
_, 
ChartSelectors) {
    
    "use strict";

    /**
    * defines a modal which is used to make chart/program selections for the midrange programs widget
    *
    * @class ProgramChartSelectorView
    * @extends View
    * @namespace radar
    * @constructor
    * @public
    */
    return View.extend({
        events: {
            "click .on-select-program": "onSelectProgram",
            "click .on-archived": "onToggleArchived",
            "click .radar-chart-item": "onSelectChart",
            "click .on-select-feature": "onSelectFeature",
            "click .on-select-cycle": "onSelectCycle"
        },

        /**
        * init dom
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.callback = params.callback;

            this.setElement(this.template("Program-Chart-Selector", null, null, templates));

            this.initProgramSelect(function (success) {
                if (success) {
                    this.$el.appendTo("body");

                    this.$el.modal({
                        show: true,
                        backdrop: "static",
                        keyboard: false
                    });

                    this.$el.on("hidden.bs.modal", $.proxy(function () {
                        this.remove();
                    }, this));
                } else {
                    require(["view/ToastView"], function (Toast) {
                        new Toast({
                            message: "An error occured when retrieving the program list, please try again later.",
                            color: Toast.prototype.ErrorColor,
                            icon: "fa fa-exclamation-triangle",
                            timer: false
                        });
                    });
                }
            });
        },

        /**
        * render/init the first step of the wizard
        *
        * @param {Function} onComplete
        *
        * @method initProgramSelect
        * @private
        */
        initProgramSelect: function (onComplete) {
            this.$(".modal-body").children().remove();

            this.$(".modal-body").append(this.template("Program-Chart-Program-Selector", null, null, templates));

            this.configuration = {};

            RadarAjax.GetProgramSelectors(function (data) {
                if (data) {
                    var groups = _.groupBy(data, function (item) {
                        return item.IsArchived;
                    });

                    if (groups.N) {
                        var active = groups.N.sort(function (a,b) {
                            return a.ProgramRank - b.ProgramRank;
                        });

                        var $target = this.$(".radar-chart-selector-active-programs");
                        
                        _.each(active, function (item) {
                            $target.append(this.template("Program-Selector-LineItem", {
                                Program: item.Program,
                                Archived: "Active",
                                Platform: item.Platform
                            }, {}, templates));
                        }, this);
                    }

                    if (groups.Y) {
                        $target = this.$(".radar-chart-selector-archived-programs");

                        _.each(groups.Y, function (item) {
                            $target.append(this.template("Program-Selector-LineItem", {
                                Program: item.Program,
                                Archived: "Archived",
                                Platform: item.Platform
                            }, {}, templates));
                        }, this);
                    }

                    onComplete && onComplete.call(this, true);
                } else {
                    onComplete && onComplete.call(this, false);
                }
            }, this);
        },

        /**
        * user selected a program from the first step
        *
        * @method onSelectProgram
        * @private
        */
        onSelectProgram: function (e) {
            this.configuration.program = $(e.target).data("program");

            this.initChartSelect();
        },

        /**
        * init the second step of the wizrd (program chart select)
        *
        * @param {Function} onComplete
        *
        * @method initChartSelect
        * @private
        */
        initChartSelect: function (onComplete) {
            this.$(".modal-body").children().remove();

            RadarAjax.GetProgramMeta(this.configuration.program, function (data) {
                var meta = _.groupBy(data.Data, function (item) {
                    return item.Class;
                });

                var programMeta = _.where(meta.RadarIntegration, {
                    ProgramName: this.configuration.program
                });

                var $body = $(this.template("Program-Chart-Chart-Selector", {
                    Program: this.configuration.program
                }, null, templates));
                
                this.populateChartSelectors($body, programMeta);

                $body.appendTo(this.$(".modal-body"));

                $body.find("[data-toggle='tooltip']").tooltip({
                    trigger: "hover",
                    container: "body",
                    show: true
                });
            }, this);
        },

        /**
        * add charts to the appropriate list containers, if they're decided to be on in the meta data
        *
        * @param {jQuery} $body - targt to append chart selectors to
        * @param {Object} programMetaData - meta data dictating this program's possible chart selections
        *
        * @method populateChartSelectors
        * @private
        */
        populateChartSelectors: function ($body, meta) {
            var count = ChartSelectors.length,
                i = 0;

            for ( ; i < count; i++) {
                var chartMeta = _.where(meta, {
                    Key: ChartSelectors[i].enable,
                    Class: "RadarIntegration",
                    ProgramName: this.configuration.program
                });

                if (chartMeta.length) {
                    if (chartMeta[0].Val === "1") {
                        var $chartItem = $(this.template("Program-Chart-Chart-Item", {
                            ChartTitle: ChartSelectors[i].title,
                            Description: ChartSelectors[i].description,
                            Module: ChartSelectors[i].module,
                            Family: ChartSelectors[i].family
                        }, {}, templates));

                        $chartItem.data("selector", $.extend(true, {}, ChartSelectors[i]));

                        $chartItem.find("img").attr("src", ChartSelectors[i].image);

                        $chartItem.appendTo($body.find(".radar-chart-container[data-chartfamily='" + ChartSelectors[i].family + "']"));
                    }
                }
            }
        },

        /**
        * collapse/expand the archived program list
        *
        * @method onToggleArchived
        * @private
        */
        onToggleArchived: function () {
            var $header = this.$(".radar-chart-selector-archived"),
                isVisible = $header.find(".fa").hasClass("fa-angle-up");

            if (isVisible) {
                $header.find(".fa").removeClass("fa-angle-up").addClass("fa-angle-down");
                this.$(".radar-chart-selector-archived-programs").slideUp();
            } else {
                $header.find(".fa").removeClass("fa-angle-down").addClass("fa-angle-up");
                this.$(".radar-chart-selector-archived-programs").slideDown();
            }
        },

        /**
        * user selected a chart from the program list
        *
        * @method onSelectChart
        * @private
        */
        onSelectChart: function (e) {
            var $target = $(e.target).closest(".radar-chart-item"),
                selector = $target.data("selector");

            this.configuration.chart = selector;
            
            this.$("[data-toggle='tooltip']").tooltip("hide");

            if (this.configuration.chart.additionalStep.length) {
                this.additionalStepIndex = 0;
                this[this.configuration.chart.additionalStep[this.additionalStepIndex++]]();
            } else {
                this.$el.modal("hide");

                this.callback(this.configuration);
            }
        },

        // =========================================================
        //              Additional Steps
        // =========================================================

        /**
        * initialize the feature selection step
        *
        * @method initFeatureSelect
        * @private
        */
        initFeatureSelect: function () {
            this.$(".modal-body").children().remove();

            RadarAjax.GetFeatureSelect(this.configuration.program, function (data) {
                if (data) {
                    this.renderFeatureSelect(this.$(".modal-body"), data);
                } else {
                    require(["view/ToastView"], function (ToastView) {
                        new ToastView({
                            message: "There was an error retrieving the list of features for this program, please try again later.",
                            color: ToastView.prototype.ErrorColor,
                            icon: "fa fa-exclamation-triangle"
                        });
                    });

                    this.$("[data-toggle='tooltip']").tooltip("hide");

                    this.$el.modal("hide");

                    this.callback(null);
                }
            }, this);
        },

        /**
        * after request/validation this is called to populate the list of features
        *
        * @param {jQuery} $body
        * @param {Array} data
        *
        * @method renderFeatureSelect
        * @private
        */
        renderFeatureSelect: function ($body, data) {
            $body.append(this.template("Program-Chart-Feature-Select", {}, null, templates));

            var $target = $body.find(".radar-feature-select-body-inner");

            _.each(data, function (item) {
                var $item = $(this.template("Program-Feature-Select-Item", {
                    FeatureId: item.Ra_FormattedID,
                    FeatureName: item.Ars_FeatureName,
                    FeatureStatus: item.Status,
                    DataFeature: item.Ars_FeatureId,
                    DataRally: item.Ra_FormattedID
                }, null, templates)).appendTo($target);

                $item.data("feature", item);
            }, this);
        },

        /**
        * user selected a feature 
        *
        * @method onSelectFeature
        */
        onSelectFeature: function (e) {
            var $target = $(e.target).closest(".radar-program-feature-select-item"),
                feature = $target.data("feature");

            this.configuration.feature = feature;

            this.$("[data-toggle='tooltip']").tooltip("hide");

            if (this.additionalStepIndex >= this.configuration.chart.additionalStep.length) {
                this.$el.modal("hide");
                this.callback(this.configuration);
            } else {
                this[this.configuration.chart.additionalStep[this.additionalStepIndex++]]();
            }
        },

        /**
        * initialize the feature cycle-selection step
        *
        * @method initCycleSelect
        * @private
        */
        initCycleSelect: function () {
            this.$(".modal-body").children().remove();

            RadarAjax.GetProgramMeta(this.configuration.program, function (meta) {
                RadarAjax.GetFeatureCycles(this.configuration.program, function (data) {
                    if (data) {
                        this.renderCycleSelect(this.$(".modal-body"), data, this.formatMeta(meta));
                    } else {
                        require(["view/ToastView"], function (ToastView) {
                            new ToastView({
                                message: "There was an error retrieving the list of cycles for this program, please try again later.",
                                color: ToastView.prototype.ErrorColor,
                                icon: "fa fa-exclamation-triangle"
                            });
                        });

                        this.$("[data-toggle='tooltip']").tooltip("hide");

                        this.$el.modal("hide");

                        this.callback(null);
                    }
                }, this);
            }, this);
        },

        /**
        * following the original implementation...
        *
        * @param {Array} meta
        *
        * @method formatMeta
        * @private
        */
        formatMeta: function (meta) {
            return _(meta.Data).chain().groupBy("Class").reduce(function (result, k, v) {
                var s = _.reduce(k, function (res, k1, v1) {
                    res[k1.Key] = k1.Val;
                    return res;
                }, {});
                result[v] = s;
                return result;
            }, {}).value();
        },

        /**
        * gets the current cycle out of the data array
        *
        * @param {Array} data
        * @param {Object} metaData
        * @return {Object}
        *
        * @method getCurrentCycle
        * @private
        */
        getCurrentCycle: function (data, metaData) {
            var cycleName = metaData.UtmsChartParams.Cycle,
                output;

            _.each(data, function (item) {
                if (item.MenuName === cycleName) {
                    output = item;
                    return false;
                }
            });

            return output;
        },

        /**
        * called after data request/validation to render the given data
        *
        * @param {jQuery} $body
        * @param {Array} data
        * @param {Object} metaData
        *
        * @method renderCycleSelect
        * @private
        */
        renderCycleSelect: function ($body, data, metaData) {
            var currentCycle = this.getCurrentCycle(data, metaData);

            $body.append(this.template("Program-Feature-Cycle-Select", {
                CurrentCycle: "Current Cycle: " + (currentCycle ? currentCycle.MenuName : "(unknown)")
            }, null, templates));

            if (!currentCycle) {
                $body.find(".radar-cycle-select-current-cycle-txt")
                    .removeClass("radar-cycle-select-current-cycle-txt on-select-cycle");
            }

            $body.find(".radar-data-select").data("cycle", currentCycle);

            var groups = _.groupBy(data, function (item) {
                    return item.TabName;
                }),
                $sectionTarget = $body.find(".radar-cycle-list-body-inner"),
                $currentSection = $(this.template("Program-Feature-Cycle-Section", {
                    SectionTitle: "All"
                }, null, templates)).appendTo($sectionTarget);

            if (groups.All) {
                this.renderCycleSection($currentSection, groups.All);
            }

            if (groups["Pre-A"] && groups["Pre-A"].length) {
                $currentSection = $(this.template("Program-Feature-Cycle-Section", {
                    SectionTitle: "Pre-A"
                }, null, templates)).appendTo($sectionTarget);

                this.renderCycleSection($currentSection, groups["Pre-A"]);
            }

            if (groups["A-B"] && groups["A-B"].length) {
                $currentSection = $(this.template("Program-Feature-Cycle-Section", {
                    SectionTitle: "A-B"
                }, null, templates)).appendTo($sectionTarget);

                this.renderCycleSection($currentSection, groups["A-B"]);
            }

            if (groups["B-C"] && groups["B-C"].length) {
                $currentSection = $(this.template("Program-Feature-Cycle-Section", {
                    SectionTitle: "B-C"
                }, null, templates)).appendTo($sectionTarget);

                this.renderCycleSection($currentSection, groups["B-C"]);
            }

            if (groups["C-D"] && groups["C-D"].length) {
                $currentSection = $(this.template("Program-Feature-Cycle-Section", {
                    SectionTitle: "C-D"
                }, null, templates)).appendTo($sectionTarget);

                this.renderCycleSection($currentSection, groups["C-D"]);
            }
        },

        /**
        * renders a particular section of the feature-cycle select
        *
        * @param {jQuery} $section
        * @param {Array} data
        *
        * @method renderCycleSection
        * @private
        */
        renderCycleSection: function ($section, data) {
            var $target = $section.find(".radar-cycle-section-list");

            _.each(data, function (item) {
                var $item = $(this.template("Program-Feature-Cycle-List-Item", {
                    CycleName: item.MenuName,
                    CycleStartDate: item.StartDate || "",
                    CycleEndDate: item.EndDate || ""
                }, null, templates)).appendTo($target);

                $item.data("cycle", item);
            }, this);
        },

        /**
        * user selected a cycle
        *
        * @method onSelectCycle
        * @private
        */
        onSelectCycle: function (e) {
            var $target = $(e.target).closest(".radar-data-select"),
                cycle = $target.data("cycle");

            this.configuration.cycle = cycle;

            this.$("[data-toggle='tooltip']").tooltip("hide");

            if (this.additionalStepIndex >= this.configuration.chart.additionalStep.length) {
                this.$el.modal("hide");
                this.callback(this.configuration);
            } else {
                this[this.configuration.chart.additionalStep[this.additionalStepIndex++]]();
            }
        }
    });
});