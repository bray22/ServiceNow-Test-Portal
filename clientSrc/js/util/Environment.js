/*
* Environment.js
*/

define(["util/Util"], function (Util) {
    "use strict";

    var cookie = Util.GetCookie("OsEnvironmentUrl"),
        params = Util.ParseQueryString(location.href),
        output = undefined,
        queryStringEnv = {
            dev: "https://osdevfe.usd.lab.emc.com",
            qa: "https://osqafe.cec.lab.emc.com",
            uat: "https://osuatfe.cec.lab.emc.com",
            preprod: "https://ospreprodfe.cec.lab.emc.com",
            prod: "https://thehub.corp.emc.com"
        };

    switch(true) {

        // is a developer trying to override what environment to connect to?
        case params.env !== undefined:
            if (queryStringEnv[params.env]) {
                output = queryStringEnv[params.env];
                break;
            }

        // do we have the environment declared by the server?
        case cookie !== null:
            output = cookie;
            break;

        // did a developer forget to argue "env"?
        case location.origin.indexOf("localhost") !== -1:
            output = queryStringEnv.dev;
            break;

        // either the user went directly to index.html (error will be handled), or something is broken.
        default: break;
    }

    return output;
});