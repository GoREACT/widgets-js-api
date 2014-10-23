(function () {
    'use strict';

    var namespace = 'goreact';
    var target = window[namespace];
    var settings = window[namespace + 'Settings'];
    var queue = target.q || target;

    var setup = function () {
        target.ready = function (callback) {
            if (typeof callback === 'function') {
                setTimeout(callback, 1000);
            }
        };

        target.update = function (a, b, c) {
            console.log(a, b, c);
        };

        target.record = function (options) {
            console.log('record', options);
        };

        target.list = function () {
            console.log('list');
        };
    };

    var onInit = function () {
        setup();
        for (var i = 0; i < queue.length; i += 1) {
            var args = Array.prototype.slice.call(queue[i]);
            var method = args.shift();
            if (target.hasOwnProperty(method)) {
                target[method].apply(target, args);
            }
        }
    };

    if (target.hasOwnProperty('q')) { // if string syntax
        target = window[namespace] = function () {
            var args = Array.prototype.slice.call(arguments);
            var method = args.shift();
            if (target.hasOwnProperty(method)) {
                target[method].apply(target, args);
            }
        };
    }

    var initialized = false;
    target.init = function (settings) {
        if (initialized) {
            return;
        }
        initialized = true;
        console.log('settings', settings);
        onInit();
    };


    for (var i = 0; i < queue.length; i += 1) {
        var args = Array.prototype.slice.call(queue[i]);
        var method = args.shift();
        if(method === 'init') {
            if (target.hasOwnProperty(method)) {
                target[method].apply(target, args);
            }
        }
    }

})();