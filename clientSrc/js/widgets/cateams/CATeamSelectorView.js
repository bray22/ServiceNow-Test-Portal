/*
* CATeamSelectorView.js
*/

define([
"view/View",
"text!widgets/cateams/templates.html",
"widgets/cateams/CATeamsAjax",
"underscore",
"jquery",
"moment"],
function (
View, 
templates, 
CATeamsAjax, 
_, 
$, 
moment) {
        
    "use strict";

    /**
    * controls the logic of selecting a CATeam and chart
    *
    * @class CATeamSelectorView
    * @extends View
    * @constructor
    * @namespace cateams
    * @public
    */
    return View.extend({
        events: {
            "click .on-select-team": "onSelectTeam",
            "click .on-select-chart": "onSelectChart",
            "click .on-select-iteration": "onSelectIteration",
            "change .cateam-program-select-cb": "onProgramSelectAll",
            "click .on-view-chart": "onProgramViewChart"
        },

        /**
        * get team list and initialize dom
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.callback = params.callback;

            this.configuration = params.configuration || {};

            this.setElement($(this.template("CATeam-Selector", null, null, templates)));

            this.$el.modal({
                show: true,
                backdrop: "static",
                keyboard: false
            });

            this.$el.on("hidden.bs.modal", $.proxy(function () {
                this.remove();
            }, this));

            if (params.step) {
                this[params.step]();
            } else {
                this.initTeamList();
            }

        },

        /**
        * helper function to change the title of the modal, with some pretty animations of course
        *
        * @param {String} txt
        * 
        * @method changeTitle
        * @private
        */
        changeTitle: function (txt) {
            var $title = this.$(".modal-title"),
                current = $title.text();

            if (current !== txt) {
                $title.animate({opactiy: 0}, {
                    duration: 300,
                    complete: function () {
                        $title.text(txt);
                        $title.animate({opactiy: 1}, {duration: 300});
                    }
                });
            }
        },

        /**
        * initialize the first step, the list of all teams
        *
        * @method initTeamList
        * @private
        */
        initTeamList: function () {
            var $target = this.$(".cateam-modal-content");

            $target.children().remove();

            $target.append(this.template("CATeam-Team-List", null, null, templates));

            $target = this.$(".cateam-team-list-list");

            CATeamsAjax.GetTeamList(function (teamList) {
                _.each(teamList, function (item) {
                    var $item = $(this.template("CATeam-Team-Item", item, null, templates)).appendTo($target);
                    $item.data("team", item);
                }, this);

                this.changeTitle("Select a Midrange Team");
            }, this);
        },

        /**
        * user selected a team from the team-list
        *
        * @method onSelectTeam
        * @private
        */
        onSelectTeam: function (e) {
            this.configuration.team = $(e.target).closest(".cateam-team-item").data("team");

            this.initChartSelect(this.configuration.team);
        },

        /**
        * initialize the chart selection 
        *
        * @param {Object} team
        *
        * @method initChartSelect
        * @private
        */
        initChartSelect: function (team) {
            var $target = this.$(".cateam-modal-content");

            $target.children().remove();

            $target.append(this.template("CATeam-Chart-Select", null, null, templates));

            this.changeTitle("Select a Chart");
        },

        /**
        * user selected a chart from the chart-list
        *
        * @method onSelectChart
        * @private
        */
        onSelectChart: function (e) {
            var $target = $(e.target).closest(".cateam-chart-select-item"),
                nextStep = $target.data("nextstep"),
                module = $target.data("module");

            this.configuration.module = module;

            if (nextStep) {
                this[nextStep]();
            } else {
                this.$el.modal("hide");
                
                this.callback(this.configuration);
            }
        },

        /**
        * init the iteration selection 
        *
        * @method initIterationSelect
        * @private
        */
        initIterationSelect: function () {
            var $body = this.$(".cateam-modal-content");

            $body.children().remove();

            $body.append(this.template("CATeam-Iteration-Select", null, null, templates));

            var $target = this.$(".cateam-iteration-list");

            CATeamsAjax.GetIterationList(this.configuration.team.ObjectID, function (iterationList) {
                _.each(iterationList, function (item) {
                    item.StartDate = moment(item.StartDate).format("MM/DD/YY"),
                    item.EndDate = moment(item.EndDate).format("MM/DD/YY");
                    var $item = $(this.template("CATeam-Iteration-Item", item, null, templates)).appendTo($target);
                    $item.data("iteration", item);
                }, this);

                this.changeTitle("Select an Iteration");
            }, this);
        },

        /**
        * user selected an iteration
        *
        * @method onSelectIteration
        * @private
        */
        onSelectIteration: function (e) {
            var $target = $(e.target).closest(".cateam-iteration-item"),
                iteration = $target.data("iteration");

            this.configuration.iteration = iteration;

            this.$el.modal("hide");

            this.callback(this.configuration);
        },

        /**
        * initialize the program select step
        *
        * @method initProgramSelect
        * @private
        */
        initProgramSelect: function () {
            var $body = this.$(".cateam-modal-content");

            $body.children().remove();

            $body.append(this.template("CATeam-Program-Select", null, null, templates));

            var $target = this.$(".cateam-program-select-body-inner");

            CATeamsAjax.GetProgramList(function (programList) {
                _.each(programList, function (program) {
                    var $item = $(this.template("CATeam-Program-Select-Item", {
                        ProgramName: program.Program,
                        Archived: (program.IsArchived === "N" ? "Active" : "Archived"),
                        Platform: program.Platform
                    }, null, templates)).appendTo($target);

                    $item.data("program", program);
                }, this);

                this.$("input[type='checkbox']").prop("checked", "checked");

                this.changeTitle("Select Programs");
            }, this);
        },

        /**
        * user toggled the 'select all' check box on program selection
        *
        * @method onProgramSelectall
        * @private
        */
        onProgramSelectAll: function () {
            var isChecked = this.$(".cateam-program-select-cb").prop("checked");
            this.$(".cateam-program-item input").prop("checked", (isChecked ? "checked" : ""));
        },

        /**
        * user clicked the 'view chart' on the last program-select step of the selector
        *
        * @method onProgramViewChart
        * @private
        */
        onProgramViewChart: function () {
            var $programs = this.$(".cateam-program-item input:checked"),
                This = this;

            this.configuration.programs = [];

            $programs.each(function (item) {
                This.configuration.programs.push($(this).closest(".cateam-program-item").data("program"))
            });

            this.$el.modal("hide");

            this.callback(this.configuration);
        }
    });
});