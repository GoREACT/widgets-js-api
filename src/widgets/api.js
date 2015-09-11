(function() {

    /**
     * Setup api
     */
    utils.forEach(settings.config.api, function(uri, method) {

        // skip methods that are already defined
        if(utils.isFunction(exports[method])) {
            return;
        }

        exports[method] = function(options) {
            return factory.load(uri, options);
        };
    });

})();