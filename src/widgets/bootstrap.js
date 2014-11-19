var queue = exports.q || exports;

// if string syntax, setup as function
if (exports.hasOwnProperty('q')) { // if string syntax
    exports = window['@@name'] = function () {
        var args = Array.prototype.slice.call(arguments);
        var method = args.shift();
        if (exports.hasOwnProperty(method)) {
            exports[method].apply(exports, args);
        }
    };
}

// make the widget a dispatcher
dispatcher(exports);

function setup() {
    var i = queue.length;
    // reverse the queue to ensure that we iterate
    // through the queue in the order each item got added
    queue.reverse();
    while(i--) {
        var args = Array.prototype.slice.call(queue[i]);
        var method = args.shift();
        if (method === 'authorize' || method === 'on' || method === 'off') {
            if (exports.hasOwnProperty(method)) {
                queue.splice(i, 1);
                exports[method].apply(exports, args);
            }
        }
    }
}

/**
 * Fired by init.js if successful, initializes the rest of the queued items
 */
exports.on('authorize::success', function () {
    var len = queue.length;
    for (var i = 0; i < len; i += 1) {
        var args = Array.prototype.slice.call(queue[i]);
        var method = args.shift();
        if (exports.hasOwnProperty(method)) {
            try {
                exports[method].apply(exports, args);
            } catch (e) {
            }
        }
    }
    queue.length = 0;
});

setTimeout(setup);
