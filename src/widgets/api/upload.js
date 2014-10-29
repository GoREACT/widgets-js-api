(function () {
    var name = 'upload';
    var widgetsUrl = '@@widgetsUrl';

    exports[name] = function (options) {

        options = options || {};
        var widget = interlace.load({
            container: options.container,
            url: widgetsUrl + 'widgets/{name}.html'.supplant({name: name}),
            params: options.params
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
