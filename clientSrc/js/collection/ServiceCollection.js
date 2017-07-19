/*
* ServiceCollection.js
*/

define(["collection/Collection", "model/ServiceModel", "underscore"], function (Collection, ServiceModel, _) {
    "use strict";

    /**
    * defines a list of services available to the client
    *
    * @class ServiceCollection
    * @constructor
    * @extends Collection
    * @namespace collection
    * @public
    */
    return Collection.extend({

        /**
        * defines what model this collection encapsulates
        *
        * @property model
        * @type ServiceModel
        * @protected
        */
        model: ServiceModel,

        /**
        * search for all services which kind of match the query
        *
        * @method {String} query
        *
        * @method query
        * @public
        */
        query: function (query) {
            var output = [],
                parts;

            if (query) {
                query = query.toUpperCase().trim();
                parts = query.split(" ");

                this.each(function (serviceModel) {
                    var name = serviceModel.get("Name").toUpperCase(),
                        match = false;

                    _.each(parts, function (part) {
                        if (name.indexOf(part) !== -1) {
                            output.push(serviceModel);
                            match = true;
                            return false;
                        }
                    });
                });
            }

            return output;
        }
    });
});