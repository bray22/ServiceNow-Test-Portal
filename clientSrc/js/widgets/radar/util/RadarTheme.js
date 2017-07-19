/*
* RadarTheme.js
*/

define(["amcharts"], function (amcharts) {
    "use strict";

    AmCharts.themes.radar = {

        themeName: "radar",

        AmChart: {
            color: "#000", 
            backgroundColor: "#FFF"
        },

        AmCoordinateChart: {
            colors: [
                "#1565C0", 
                "#42A5F5", 
                "#90CAF9", 
                "#67b7dc", 
                "#fdd400", 
                "#84b761", 
                "#cc4748", 
                "#cd82ad", 
                "#2f4074", 
                "#448e4d", 
                "#b7b83f", 
                "#b9783f", 
                "#b93e3d", 
                "#913167"
            ]
        },

        AmStockChart: {
            colors: [
                "#1565C0", 
                "#42A5F5", 
                "#90CAF9", 
                "#67b7dc", 
                "#fdd400", 
                "#84b761", 
                "#cc4748", 
                "#cd82ad", 
                "#2f4074", 
                "#448e4d", 
                "#b7b83f", 
                "#b9783f", 
                "#b93e3d", 
                "#913167"
            ]
        },

        AmSlicedChart: {
            colors: [
                "#1565C0", 
                "#42A5F5", 
                "#90CAF9", 
                "#67b7dc", 
                "#fdd400", 
                "#84b761", 
                "#cc4748", 
                "#cd82ad", 
                "#2f4074", 
                "#448e4d", 
                "#b7b83f", 
                "#b9783f", 
                "#b93e3d", 
                "#913167"
            ],
            outlineAlpha: 1,
            outlineThickness: 2,
            labelTickColor: "#000",
            labelTickAlpha: 0.3
        },

        AmRectangularChart: {
            zoomOutButtonColor: "#000",
            zoomOutButtonRollOverAlpha: 0.15,
            zoomOutButtonImage: "lens"
        },

        AxisBase: {
            axisColor: "#000",
            axisAlpha: 0.3,
            gridAlpha: 0.1,
            gridColor: "#000"
        },

        ChartScrollbar: {
            backgroundColor: "#000",
            backgroundAlpha: 0.12,
            graphFillAlpha: 0.5,
            graphLineAlpha: 0,
            selectedBackgroundColor: "#FFF",
            selectedBackgroundAlpha: 0.4,
            gridAlpha: 0.15
        },

        ChartCursor: {
            cursorColor: "#000",
            color: "#FFF",
            cursorAlpha: 0.5
        },

        AmLegend: {
            color: "#000"
        },

        AmGraph: {
            lineAlpha: 0.9
        },
        
        GaugeArrow: {
            color: "#000",
            alpha: 0.8,
            nailAlpha: 0,
            innerRadius: "40%",
            nailRadius: 15,
            startWidth: 15,
            borderAlpha: 0.8,
            nailBorderAlpha: 0
        },

        GaugeAxis: {
            tickColor: "#000",
            tickAlpha: 1,
            tickLength: 15,
            minorTickLength: 8,
            axisThickness: 3,
            axisColor: '#000',
            axisAlpha: 1,
            bandAlpha: 0.8
        },

        TrendLine: {
            lineColor: "#c03246",
            lineAlpha: 0.8
        },

        AreasSettings: {
            alpha: 0.8,
            color: "#67b7dc",
            colorSolid: "#003767",
            unlistedAreasAlpha: 0.4,
            unlistedAreasColor: "#000",
            outlineColor: "#FFF",
            outlineAlpha: 0.5,
            outlineThickness: 0.5,
            rollOverColor: "#3c5bdc",
            rollOverOutlineColor: "#FFF",
            selectedOutlineColor: "#FFF",
            selectedColor: "#f15135",
            unlistedAreasOutlineColor: "#FFF",
            unlistedAreasOutlineAlpha: 0.5
        },

        LinesSettings: {
            color: "#000",
            alpha: 0.8
        },

        ImagesSettings: {
            alpha: 0.8,
            labelColor: "#000",
            color: "#000",
            labelRollOverColor: "#3c5bdc"
        },

        ZoomControl: {
            buttonFillAlpha: 0.7,
            buttonIconColor:"#a7a7a7"
        },

        SmallMap: {
            mapColor: "#000",
            rectangleColor: "#f15135",
            backgroundColor: "#FFF",
            backgroundAlpha: 0.7,
            borderThickness: 1,
            borderAlpha: 0.8
        },

        // the defaults below are set using CSS syntax, you can use any existing css property
        // if you don't use Stock chart, you can delete lines below
        PeriodSelector: {
            color: "#000"
        },

        PeriodButton: {
            color: "#000",
            background: "transparent",
            opacity: 0.7,
            border: "1px solid rgba(0, 0, 0, .3)",
            MozBorderRadius: "5px",
            borderRadius: "5px",
            margin: "1px",
            outline: "none",
            boxSizing: "border-box"
        },

        PeriodButtonSelected: {
            color: "#000",
            backgroundColor: "#b9cdf5",
            border: "1px solid rgba(0, 0, 0, .3)",
            MozBorderRadius: "5px",
            borderRadius: "5px",
            margin: "1px",
            outline: "none",
            opacity: 1,
            boxSizing: "border-box"
        },

        PeriodInputField: {
            color: "#000",
            background: "transparent",
            border: "1px solid rgba(0, 0, 0, .3)",
            outline: "none"
        },

        DataSetSelector: {
            color: "#000",
            selectedBackgroundColor: "#b9cdf5",
            rollOverBackgroundColor: "#a8b0e4"
        },

        DataSetCompareList: {
            color: "#000",
            lineHeight: "100%",
            boxSizing: "initial",
            webkitBoxSizing: "initial",
            border: "1px solid rgba(0, 0, 0, .3)"
        },

        DataSetSelect: {
            border: "1px solid rgba(0, 0, 0, .3)",
            outline: "none"
        }
    };
});