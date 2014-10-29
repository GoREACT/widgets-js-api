exports.authorize = function (settings, signature) {

    var name = 'success';
    var widgetsUrl = '@@widgetsUrl';

    interlace.prefix('widget_');

    var clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    var params = clone(settings);
    params.signature = signature;

    var widget = interlace.load({
        url: widgetsUrl + 'widgets/{name}.html'.supplant({name: name}),
        params: params,
        options: {
            width: '0px',
            height: '0px'
        }
    });

    widget.type = 'authorize';

    widget.on('success', function (event, data) {
        widget.destroy();
        exports.fire('authorize::success', this);
    });

    widget.on('error', function (event, data) {
        widget.destroy();
        exports.fire('authorize::error', this);
    });

};