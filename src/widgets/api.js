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
			var widget = factory.load(uri, options);

			// add widget method name as a class
			widget.element.className += ' ' + utils.snakecase(widget.element.className + '-' + method, '-');

			return widget;
        };
    });

})();