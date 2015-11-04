(function() {

    /**
     * Setup api
     */
    utils.forEach(settings.config.api, function(uri, method) {
        exports[method] = function(element, options) {
			var widget = factory.load(uri, element, options);

			// add widget method name as a class
			widget.element.className += ' ' + utils.snakecase(widget.element.className + '-' + method, '-');

			return widget;
        };
    });

})();