exports.init = function (settings) {

    interlace.prefix('widget_');

    var widget = interlace.load({
        url: 'widgets/success.html',
        params: settings,
        options: {
            width: '0px',
            height: '0px'
        }
    });

    widget.type = 'init';

    widget.on('success', function (event, data) {
        widget.destroy();
        exports.fire('init::success', this);
    });

    widget.on('error', function (event, data) {
        widget.destroy();
        exports.fire('init::error', this);
    });

};