(function () {
    var name = 'authorize';

    // default base url set to use production
    exports.baseUrl = "@@prodUrl";

    exports[name] = function (settings, signature) {
        interlace.prefix('widget_');

        var params = utils.clone(settings);
        params.signature = signature;

        // determine environment
        if(settings.api_key && settings.api_key.indexOf("sb") === 0) {
            exports.baseUrl = "@@sandboxUrl";
        } else if(settings.api_key && settings.api_key.indexOf("dev") === 0) {
            exports.baseUrl = "@@devUrl";
        }

        var widget = interlace.load({
            url: exports.baseUrl + "@@authUri",
            params: params,
            options: {
                width: '0px',
                height: '0px'
            }
        });

        // remove parent container styles
        widget.parentNode.removeAttribute("style");

        widget.type = 'authorize';

        widget.on('success', function (event, data) {
            setTransientData(data);
            widget.destroy();
            exports.fire('authorize::success', this, data);
        });

        widget.on('error', function (event, data) {
            setTransientData(data);
            widget.destroy();
            exports.fire('authorize::error', this, data);
        });

        /**
         * Set transient data
         *
         * @param data
         */
        function setTransientData (data) {
            if(utils.isObject(data) && data.transient) {
                utils.extend(transient, {
                    transient: data.transient
                });
            }
        }

        return widget.id;
    };

})();