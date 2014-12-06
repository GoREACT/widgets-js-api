(function () {
    var name = 'playback';
    var minHeight = 340;

    exports[name] = function (options) {
        options = options || {};

        var container = options.container;
        delete options.container;

        var params = utils.clone(options);
        utils.extend(params, authData);

        var widget = interlace.load({
            container: container,
            url: exports.baseUrl + '@@playbackUri',
            params: params
        });

        // set parent element height if not set (enforce minimum height)
        if(widget.parentNode && widget.parentNode.getBoundingClientRect().height < minHeight) {
            widget.parentNode.style.height = minHeight + "px";
        }

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

        widget.on('error', function (evt, data) {
            exports.fire(name + '::error', this, data);
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
            exports.fire(name + '::playError', this);
        });

        return widget.id;
    };
})();
