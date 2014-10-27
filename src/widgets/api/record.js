exports.record = function (options) {

    options = options || {};

    var widget = interlace.load({
        container: options.container,
        url: 'widgets/recorder.html',
        params: options.params
    });

    widget.type = 'record';

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
        exports.fire('record::ready', this);
    });

    widget.on('destroyed', function () {
        exports.fire('record::destroyed', this);
    });

};