exports.init = function () {
    console.log('init');

//    var el = document.body;
    var iframe = interlace.load({
//        container: undefined,
        container: document.getElementById('containerEl'),
//        container: { // null, element, or object
//            'position': 'absolute',
//            'top': '50px',
//            'left': '50px',
//            'right': '50px',
//            'bottom': '50px',
//            'z-index': 99999
//        },
        url: 'widgets/recorder.html',
        class: 'shadow',
        params: {
            api_key: '123',
            signature: 'abc123'
        },
        options: {
            width: '100%',
            height: '100%'
        }
    });

    iframe.on('ready', function () {
        console.log('iframe ready');

        exports.fire('init::complete');

        setTimeout(function(){
            iframe.send('whatever', {'message': 'I am your father!'});
        });
    });

    iframe.on('shout', function (data) {
        console.log('FROM CHILD', data);
    })

};