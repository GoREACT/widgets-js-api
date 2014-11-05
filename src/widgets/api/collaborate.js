(function () {
    var name = 'collaborate';

    exports[name] = function (options) {
        options = options || {};

        var params = {
            goreact_id: options.goreact_id
        };

        var mode = options.mode || "view";

        var widget = interlace.load({
            container: options.container,
            url: exports.baseUrl + '/v1/session/' + mode,
            params: params
        });

        widget.type = name;

        // :: actions :: //
        widget.on('destroy', function () {
            widget.destroy();
        });

        widget.on('hide', function () {
            widget.hide();
        });

        widget.on('show', function () {
            widget.show();
        });

        // :: reactions :: //
        widget.on('ready', function () {
            exports.fire(name + '::ready', this);
        });

        widget.on('destroyed', function () {
            exports.fire(name + '::destroyed', this);
        });

    };
})();
