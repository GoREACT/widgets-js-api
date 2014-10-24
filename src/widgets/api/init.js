exports.init = function (settings) {

    var iframe = interlace.load({
        url: 'widgets/success.html',
        params: settings,
        options: {
            width: '0px',
            height: '0px'
        }
    });

    iframe.on('success', function (event, data) {
        console.log('init::success', data);
        iframe.close();
        exports.fire('init::success', data);
    });

    iframe.on('error', function (event, data) {
        console.log('init::error', data);
        iframe.close();
        exports.fire('init::error', data);
    });

};