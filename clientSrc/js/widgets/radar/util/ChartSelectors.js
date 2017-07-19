/*
* ChartSelectors.js
*/


define([], function () {
    "use strict";

    /**
    * this array defines the different charts a user can select for midrange program reporting
    *
    * @property {Number} id:                - Used as an identifier reference in order to lookup a chart-selector object
    *                                       - NEVER CHANGE THIS VALUE!
    * 
    * @property {String} family:            - Determines which section within the chart selector it is appended to
    *
    * @property {String} title:             - The title of the chart
    *
    * @property {String} enable:            - The flag found within the program's meta data which toggles the chart on/off
    *
    * @property {String} module:            - What module to load when the user chooses this chart (widget mode)
    *
    * @property {String} appmodeModule:     - what dashboard appmode module to initialize for the chart
    *
    * @property {Object} paramConfig:       - Optional default parameters to inject into the ctor of the module
    *                                       - Allows you to re-use modules, and specify what differs
    *
    * @property {String} image:             - Filepath to the displayed image (image must be 200x200 and compressed)
    *
    * @property {Array} legacy:             - The chart name from the old TheHub
    *
    * @property {String} additionalStep:    - When the wizard needs an additional step to complete 
    *                                       - Primarily for feature charts and feature cycle selection
    *                                       - Aligns to what step-init function to call within the ProgramChartSelectorView
    *
    * @property {String} description:       - The overall description of the chart, displayed as a tooltip
    *
    * @private
    * @readonly
    * @module ChartSelectors
    * @namespace radar
    * @static
    */
    return [

        // ============================================================
        //                          Defect Charts
        // ============================================================

        {
            id: 101,
            family: "defects",
            title: "Open Backlog Trend",
            polltime: "Open Backlog Trend",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/DefectBacklogOverTimeView",
            paramConfig: {
                tab: "OBL",
                p2: "Bug",
                p1: "P00|P01|P02|"
            },
            image: "./res/radar/open-backlog.png",
            additionalStep: [],
            description: "Number of open defects over time (development engineering perspective), stacked by priority. Appmode shows the defect dashboard."
        },
        {
            id: 102,
            family: "defects",
            title: "To Be Verified",
            polltime: "To Be Verified",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/DefectBacklogOverTimeView",
            paramConfig: {
                tab: "TBV",
                p2: "Bug",
                p1: "P00|P01|P02|"
            },
            image: "./res/radar/to-be-verified.png",
            additionalStep: [],
            description: "Number of defects 'to be verified' over time, stacked by priority. Appmode shows the defect dashboard."
        },
        {
            id: 103,
            family: "defects",
            title: "Backlog Incoming",
            polltime: "Backlog Incoming",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/DefectBacklogActivityView",
            paramConfig: {
                tab: "BI",
                p2: "Bug",
                p1: "P00|P01|P02|",
                p13: "Move%20In|New|Reopen|Other|"
            },
            image: "./res/radar/backlog-incoming.png",
            additionalStep: [],
            description: "Historical view of increases to the defect backlog for the program over time with stacked areas based on incoming reason. Appmode shows the defect dashboard."
        },
        {
            id: 104,
            family: "defects",
            title: "Backlog Outgoing",
            polltime: "Backlog Outgoing",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/DefectBacklogActivityView",
            paramConfig: {
                tab: "BO",
                p2: "Bug",
                p1: "P00|P01|P02|",
                p13: "Duplicate|Fixed|Defer Dismissal|Program Change Deferral|Non Defer Dismissal|Other|"
            },
            image: "./res/radar/backlog-incoming.png",
            additionalStep: [],
            description: "Historical view of decreases in the defect backlog of the program, with stacked areas by outgoing reason. Appmode shows the defect dashboard."
        },
        {
            id: 105,
            family: "defects",
            title: "Overall In/Out",
            polltime: "Overall In/Out",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/DefectBacklogActivityView",
            paramConfig: {
                tab: "BIO",
                p2: "Bug",
                p1: "P00|P01|P02|",
            },
            chartOptions: {
                valueAxes: [{stackType: "none"}]
            },
            graphOptions: {
                lineAlpha: 1,
                fillAlphas: 0,
                lineThickness: 1.6 
            },
            image: "./res/radar/overall-in-out.png",
            additionalStep: [],
            description: "Historical view of total increases and decreases in defect backlog for the program over time as separate lines (not stacked). Appmode shows the defect dashboard."
        },
        {
            id: 106,
            family: "defects",
            title: "Outgoing Dismissal",
            polltime: "Outgoing Dismissal",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/DefectBacklogActivityView",
            paramConfig: {
                tab: "BOD",
                p2: "Bug",
                p1: "P00|P01|P02|",
                p13: "ClosedbyCustomerRequest|Decidednottofix|EnvironmentalError|FiledinError|Functionsasdesigned|Insufficientmaterialsforanalysis|Unabletorootcause|Other"
            },
            image: "./res/radar/backlog-incoming.png",
            additionalStep: [],
            description: "A breakdown of the dismissal category of the outgoing backlog with stacked areas by reason."
        },
        {
            id: 107,
            family: "defects",
            title: "Distilled Arrivals by Current State",
            polltime: "Distilled Arrivals Current State",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/DefectBacklogDistilledView",
            paramConfig: {
                tab: "VBSA",
                p2: "Bug",
                p1: "P00|P01|P02|",
                p13: "Open|DeferDismissal|Fixed|OtherNondeferDismissal|Duplicate|"
            },
            image: "./res/radar/backlog-incoming.png",
            additionalStep: [],
            description: "A view of increases to the defect backlog with the currently assigned groups and categories. In contrast with 'Backlog Incoming' the past can change in this chart as defects are reclassified or moved.  For example, this chart may show and 'Arrival' with status of 'Dismissed' because although this defect arrived on the date as stated in the chart, the status of the defect is now dismissed."
        },
        {
            id: 108,
            family: "defects",
            title: "Distilled Closures by Current State",
            polltime: "Distilled Closures by Current State",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/DefectBacklogDistilledView",
            paramConfig: {
                tab: "VBSC",
                p2: "Bug",
                p1: "P00|P01|P02|",
                p13: "Fixed|NondeferDismissal|DeferDismissal|Duplicate|"
            },
            image: "./res/radar/backlog-incoming.png",
            additionalStep: [],
            description: "A view of decreases to the defect backlog with the currently assigned groups and categories. This chart does not retain history of defect states in time (see Distilled Arrivals chart for an example)."
        },
        {
            id: 109,
            family: "defects",
            title: "Distilled Dismissals by Current State",
            polltime: "Distilled Dismissals by Current State",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/DefectBacklogDistilledView",
            paramConfig: {
                tab: "VBSDC",
                p2: "Bug",
                p1: "P00|P01|P02|",
                p13: "ClosedbyCustomerRequest|Decidednottofix|EnvironmentalError|FiledinError|Functionsasdesigned|Insufficientmaterialsforanalysis|Unabletorootcause|Other"
            },
            image: "./res/radar/backlog-incoming.png",
            additionalStep: [],
            description: "A view of defect dismissals over time with the currently assigned groups and categories. This chart does not retain history of defect states in time (see Distilled Arrivals chart for an example)."
        },

        // ============================================================
        //                          Test Charts
        // ============================================================

        {
            id: 201,
            family: "test",
            title: "Test Progress",
            polltime: "Test Progress",
            enable: "UtmsIsEnabled",
            module: "widgets/radar/charts/TestProgressView",
            paramConfig: null,
            image: "./res/radar/test-progress.png",
            additionalStep: ["initCycleSelect"],
            description: "For a specific cycle, shows separate lines for test. Green line shows the attempted test percentage. Purple line shows the percentage of tests which have passed at least once. Appmode shows the test dashboard."
        },
        {
            id: 202,
            family: "test",
            title: "Test Status",
            polltime: "Test Status",
            enable: "UtmsIsEnabled",
            module: "widgets/radar/charts/TestStatusView",
            paramConfig: null,
            image: "./res/radar/test-status.png",
            additionalStep: ["initCycleSelect"],
            description: "For a specific cycle, shows a pie chart with the breakdown of the current test status. Appmode shows the test dashboard."
        },
        {
            id: 203,
            family: "test",
            title: "Test EST",
            polltime: "Test Est",
            enable: "InquestRuntimeIsEnabled",
            module: "widgets/radar/charts/TestESTView",
            paramConfig: null,
            image: "./res/radar/test-est.png",
            additionalStep: [],
            description: ""
        },
        /*{
            id: 204,
            family: "test",
            title: "Test Endurance",
            polltime: "",
            enable: "EnduranceIsEnabled",
            module: "widgets/radar/charts/TestEnduranceView",
            paramConfig: null,
            image: "./res/radar/test-endurance.png",
            additionalStep: [],
            description: ""
        },
        {
            id: 205,
            family: "test",
            title: "Test CNDU",
            polltime: "",
            enable: "CNDUIsEnabled",
            module: "widgets/radar/charts/TestCNDUView",
            paramConfig: null,
            image: "./res/radar/test-cndu.png",
            additionalStep: [],
            description: ""
        },*/
        {
            id: 206,
            family: "test",
            title: "Test CFT",
            polltime: "Test CFT",
            enable: "CfxTestIsEnabled",
            module: "widgets/radar/charts/TestCFTView",
            paramConfig: null,
            image: "./res/radar/test-cft.png",
            additionalStep: [],
            description: "Shows cross feature testing results for the past 10 builds. A line shows number of ARs generated for the build. Three differently sized bars display Max, Min, and Median duration hours for each build. A tooltip shows the platform details."
        },
        /*{
            id: 207,
            family: "test",
            title: "Test Failure",
            polltime: "",
            enable: "TestFootprintIsEnabled",
            module: "widgets/radar/charts/TestFailureView",
            paramConfig: null,
            image: "./res/radar/test-footprint.png",
            additionalStep: [],
            description: ""
        },*/
        /*{
            id: 208,
            family: "test",
            title: "Test Product Exploration",
            polltime: "",
            enable: "EITIsEnabled",
            module: "widgets/radar/charts/TestProductExplorationView",
            paramConfig: null,
            image: "./res/radar/test-exploration.png",
            additionalStep: null,
            description: ""
        },*/

        // ============================================================
        //                          Feature Charts
        // ============================================================

        {
            id: 301,
            family: "feature",
            title: "Feature Summary",
            polltime: "Feature Summary",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/FeatureSummaryView",
            paramConfig: {
                p1: "P00|P01|P02",
                p2: "Bug"
            },
            image: "./res/radar/feature-summary.png",
            additionalStep: ["initCycleSelect"],
            description: ""
        },
        {
            id: 302,
            family: "feature",
            title: "Open Backlog Trend",
            polltime: "Open Backlog Trend",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/DefectBacklogOverTimeView",
            paramConfig: {
                tab: "OBL",
                p2: "Bug",
                p1: "P00|P01|P02|"
            },
            image: "./res/radar/open-backlog.png",
            additionalStep: ["initFeatureSelect"],
            description: "Number of open defects over time (development engineering perspective), stacked by priority. Appmode shows the feature dashboard."
        },
        {
            id: 303,
            family: "feature",
            title: "To Be Verified",
            polltime: "To be Verified",
            enable: "ArsIsEnabled",
            module: "widgets/radar/charts/DefectBacklogOverTimeView",
            paramConfig: {
                p1: "P00|P01|P02",
                p2: "Bug",
                tab: "TBV"
            },
            image: "./res/radar/to-be-verified.png",
            additionalStep: ["initFeatureSelect"],
            description: "Number of defects 'to be verified' over time, stacked by priority. Appmode shows the feature dashboard."            
        },
        {
            id: 304,
            family: "feature",
            title: "Test Progress",
            polltime: "Test Progress",
            enable: "UtmsIsEnabled",
            module: "widgets/radar/charts/TestProgressView",
            paramConfig: null,
            image: "./res/radar/test-progress.png",
            additionalStep: ["initFeatureSelect", "initCycleSelect"],
            description: ""
        },
        {
            id: 305,
            family: "feature",
            title: "Test Status",
            polltime: "Test Status",
            enable: "UtmsIsEnabled",
            module: "widgets/radar/charts/TestStatusView",
            paramConfig: null,
            image: "./res/radar/test-status.png",
            additionalStep: ["initFeatureSelect", "initCycleSelect"],
            description: ""
        },

        // ============================================================
        //                          Build Charts
        // ============================================================

        {
            id: 401,
            family: "build",
            title: "Build Progress",
            polltime: "Build Progress",
            enable: "BuildIsEnabled",
            module: "widgets/radar/charts/BuildProgressView",
            paramConfig: null,
            image: "./res/radar/build-progress.png",
            additionalStep: [],
            description: ""
        },
        {
            id: 402,
            family: "build",
            title: "Promoted Builds",
            polltime: "Promoted Builds",
            enable: "BuildIsEnabled",
            module: "widgets/radar/charts/BuildPromotedView",
            paramConfig: null,
            image: "./res/radar/build-promoted.png",
            additionalStep: [],
            description: ""
        }/*,
        {
            id: 403,
            family: "build",
            title: "Code Churn",
            polltime: "",
            enable: "CodeChurnIsEnabled",
            module: "widgets/radar/charts/BuildCodeChurnView",
            paramConfig: null,
            image: "./res/radar/code-churn.png",
            additionalStep: [],
            description: ""
        },
        {
            id: 404,
            family: "build",
            title: "Build Deployments in Test",
            polltime: "",
            enable: "BuildIsEnabled",
            module: "widgets/radar/charts/BuildDeploymentsView",
            paramConfig: null,
            image: "./res/radar/build-deployments.png",
            additionalStep: [],
            description: ""
        }*/
    ]
});