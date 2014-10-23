window['@@name'].on('setup', function (exports) {
    exports.ready = function (callback) {
        if (typeof callback === 'function') {
            setTimeout(callback, 1000);
        }
    };

    exports.update = function (a, b, c) {
        console.log(a, b, c);
    };

    exports.record = function (options) {
        console.log('record', options);
    };

    exports.list = function () {
        console.log('list');
    };
});