(function () {
    var name = 'list';

    exports[name] = function (options) {
        return "Not supported yet";

        options = options || {};

        var container = options.container;
        delete options.container;

        var widget = interlace.load({
            container: container,
            url: exports.baseUrl + '@@listUri',
            params: utils.clone(options)
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

        widget.on('error', function (evt, data) {
            exports.fire(name + '::error', this, data);
        });

        return widget.id;
    };
})();
