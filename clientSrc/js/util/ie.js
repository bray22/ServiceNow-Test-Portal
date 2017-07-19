/*
* ie.js
*
* The purpose of this file, which is immediately excecuted in <body> is to determine if the user
* is in IE-compatibility view mode, or below IE-10. If either of which is true, the browser is unsupported
* and cannot even parse some scripts like jquery. In this case we redirect the client to a different html page
* telling them they're a silly fool and should rejoin the 21st century.
*/

!function () {
    
    var IE = (function IeVersion () {
        var value = {
            IsIE: false,
            TrueVersion: 0,
            ActingVersion: 0,
            CompatibilityMode: false
        };

        var trident = navigator.userAgent.match(/Trident\/(\d+)/);

        if (trident) {
            value.IsIE = true;
            value.TrueVersion = parseInt(trident[1], 10) + 4;
        }

        var msie = navigator.userAgent.match(/MSIE (\d+)/);

        if (msie) {
            value.IsIE = true;
            value.ActingVersion = parseInt(msie[1], 10);
        } else {
            value.ActingVersion = value.TrueVersion;
        }

        if (value.IsIE && value.TrueVersion > 0 && value.ActingVersion > 0) {
            value.CompatibilityMode = value.TrueVersion !== value.ActingVersion;
        }

        return value;
    })();

    if (IE.IsIE && (IE.CompatibilityMode || IE.ActingVersion < 10)) {
        location.href = "iecompat.html?prev=" + location.href;
    }
}();