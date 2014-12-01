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

        // hide container
        widget.parentNode.style.display = "none";

        widget.type = 'authorize';

        widget.on('success', function (event, data) {
            widget.destroy();
            exports.fire('authorize::success', this, data);
        });

        widget.on('error', function (event, data) {
            widget.destroy();
            exports.fire('authorize::error', this, data);
        });

        return widget.id;
    };

})();