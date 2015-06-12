(function() {
    "use strict";

    var api = {
        upload: "@@uploadUri",
        record: "@@recordUri",
        list: "@@listUri",
        playback: "@@playbackUri",
        review: "@@reviewUri"
    };

    /**
     * Setup api
     */
    utils.forEach(api, function(uri, method) {

        exports[method] = function (options) {
            options = options || {};

            var params = utils.clone(options);
            utils.extend(params, transient);
            params.mode = "collaborate";

            var widget = factory.load({
                container: options.container,
                url: exports.config.baseUrl + uri,
                params: params
            });

            widget.type = method;

            widget.on('hide', function () {
                widget.hide();
            });

            widget.on('show', function () {
                widget.show();
            });

            widget.on('destroy', function () {
                widget.destroy();
            });

            return widget.id;
        };
    });
})();