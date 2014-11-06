(function () {
    var name = 'playback';

    exports[name] = function (options) {
        options = options || {};

        var params = {
            goreact_id: options.goreact_id
        };

        var widget = interlace.load({
            container: options.container,
            url: exports.baseUrl + '@@playbackUri',
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

        widget.on('playbackReady', function () {
            exports.fire(name + '::ready', this);
        });

        widget.on('playbackOnPlay', function () {
            exports.fire(name + '::play', this);
        });

        widget.on('playbackOnPause', function () {
            exports.fire(name + '::pause', this);
        });

        widget.on('playbackOnSeek', function () {
            exports.fire(name + '::seek', this);
        });

        widget.on('playbackOnBuffer', function () {
            exports.fire(name + '::buffer', this);
        });

        widget.on('playbackOnError', function () {
            exports.fire(name + '::error', this);
        });

    };
})();
