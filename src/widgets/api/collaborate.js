(function () {
    var name = 'collaborate';

    exports[name] = function (options) {
        options = options || {};

        var container = options.container;
        delete options.container;

        var widget = interlace.load({
            container: container,
            url: exports.baseUrl + '@@collaborateUri',
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

    }
})();
