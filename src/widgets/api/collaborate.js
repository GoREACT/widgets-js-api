(function () {
    var name = 'collaborate';

    exports[name] = function (options) {
        options = options || {};

        var container = options.container;
        delete options.container;

        var params = utils.clone(options);
        utils.extend(params, transient);
        params.mode = "collaborate";

        var widget = interlace.load({
            container: container,
            url: exports.baseUrl + '@@collaborateUri',
            params:params
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

        widget.on('destroyed', function () {
            exports.fire(name + '::destroyed', this);
        });

        widget.on('error', function (evt, data) {
            exports.fire(name + '::error', this, data);
        });

        widget.on('sessionReady', function () {
            exports.fire(name + '::ready', this);
        });

        return widget.id;
    }
})();
