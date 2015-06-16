(function() {

    /**
     * Setup api
     */
    utils.forEach(settings.config.api, function(uri, method) {

        // skip the authorize method, this is implemented separately
        if(method === 'authorize') {
            return;
        }

        exports[method] = function(options) {
            if(!utils.isObject(auth)) {
                throw new Error('The "authorize" method must be called first');
            }

            var url = config.baseUrl + uri,
                container = options.container;

            // clone options
            options = utils.clone(options) || {};
            delete options.container;

            // create widget
            var widget = factory.create({
                container: container
            });

            widget.type = method;

            widget.on('hide', function () {
                widget.hide();
            });

            widget.on('show', function () {
                widget.show();
            });

            widget.on("ready", function() {
                widget.showLoading(false);
            });

            widget.on('destroy', function () {
                widget.destroy();
            });

            // load widget content
            widget.showLoading(true);
            if(auth.isPending()) {
                auth.once('success', function success() {
                    factory.getContent(widget, url, utils.extend(options, transient));
                });
                auth.once('error', function() {
                    widget.showLoading(false);
                });
            } else if(auth.isSuccess()) {
                factory.getContent(widget, url, utils.extend(options, transient));
            } else {
                widget.showLoading(false);
            }

            return widget;
        };
    });
})();