/*
* RadarTableView.js
*/

define([
"view/ModalView", 
"text!widgets/radar/templates.html",
"underscore",
"jquery"], 
function (
ModalView, 
templates, 
_, 
$) {
        
    "use strict";

    var _uri = "data:application/vnd.ms-excel;base64,",
        _template = [
            "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>",
                "<head>",
                    "<!--[if gte mso 9]>",
                        "<xml>",
                            "<x:ExcelWorkbook>",
                                "<x:ExcelWorksheets>",
                                    "<x:ExcelWorksheet>",
                                        "<x:Name>{worksheet}</x:Name>",
                                            "<x:WorksheetOptions>",
                                            "<x:DisplayGridlines/>",
                                        "</x:WorksheetOptions>",
                                    "</x:ExcelWorksheet>",
                                "</x:ExcelWorksheets>",
                            "</x:ExcelWorkbook>",
                        "</xml>",
                    "<![endif]-->",
                "</head>",
                "<body>",
                    "<table>{table}</table>",
                "</body>",
            "</html>"].join("");

    /**
    * contains the logic to display a table of data in a modal
    *
    * @class RadarTableView
    * @extends ModalView
    * @namespace radar
    * @constructor
    * @public
    */
    return ModalView.extend({

        /**
        * initialize DOM and events
        *
        * @method initialize
        * @protected
        */
        initialize: function (params) {
            this.events = _.extend({}, this.events, {
                "click .on-excel": "tableToExcel"
            });

            ModalView.prototype.initialize.apply(this, arguments);

            this.setContent(this.template("Radar-Table", {
                Table: params.table
            }, null, templates));

            if (!params.export) {
                this.$(".radar-table-header").remove();
            }
        },

        /**
        * convert and download the table as an excel spreadsheet
        *
        * @method tableToExcel
        * @private
        */
        tableToExcel: function () {
            function base64(txt) {
                return window.btoa(unescape(encodeURIComponent(txt)));
            }

            function format(template, options) {
                return template.replace(/{(\w+)}/g, function (templateVal, key) {
                    return options[key];
                });
            }

            var $table = this.$("table");

            if (!$table.length) {
                require(["view/ToastView"], function (ToastView) {
                    new ToastView({
                        message: "There was an error attempting to export this table to Excel, please try again later.",
                        color: ToastView.prototype.ErrorColor,
                        icon: "fa fa-exclamation-circle"
                    });
                });
                return;
            }

            var options = {
                worksheet: "Worksheet",
                table: $table.html(),
                filename: "Worksheet.xls"
            };

            var $anchor = $("<a style='display: none;'></a>").appendTo("body");
            $anchor.attr("href", _uri + base64(format(_template, options)));
            $anchor.attr("download", options.filename);

            setTimeout(function () {
                $anchor[0].click();
                setTimeout(function () {
                    $anchor.remove();
                }, 1);
            }, 1);
        }
    });
    
});