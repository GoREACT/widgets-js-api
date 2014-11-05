(function () {
    var name = 'record';

    exports[name] = function (options) {
        options = options || {};

        var widget = interlace.load({
            container: options.container,
            url: exports.baseUrl + '/v1/record',
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

        widget.on('recordStart', function () {
            exports.fire(name + '::start', this);
        });

        widget.on('recordStarted', function () {
            exports.fire(name + '::started', this);
        });

        widget.on('recordStop', function () {
            exports.fire(name + '::stop', this);
        });

        widget.on('recordStopped', function () {
            exports.fire(name + '::stopped', this);
        });

        widget.on('recordKeep', function () {
            exports.fire(name + '::keep', this);
        });

        widget.on('recordDiscard', function () {
            exports.fire(name + '::discard', this);
        });

    };
})();
