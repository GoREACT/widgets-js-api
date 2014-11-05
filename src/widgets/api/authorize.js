exports.authorize = function (settings, signature) {
    interlace.prefix('widget_');

    var clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    var params = clone(settings);
    params.signature = signature;

    // determine environment
    if(settings.api_key && settings.api_key.indexOf("prod") === 0) {
        exports.baseUrl = "https://goreact.com";
    } else {
        exports.baseUrl = "https://dev.goreact.com";// TODO: change to sandbox
    }

    var widget = interlace.load({
        url: exports.baseUrl + '/v1/auth',
        params: params,
        options: {
            width: '0px',
            height: '0px'
        }
    });

    widget.type = 'authorize';

    widget.on('success', function (event, data) {
        widget.destroy();
        exports.fire('authorize::success', this, data);
    });

    widget.on('error', function (event, data) {
        widget.destroy();
        exports.fire('authorize::error', this, data);
    });

};