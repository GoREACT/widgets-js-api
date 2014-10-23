(function(){
var exports = window["goreact"];

var dispatcher = function(target, scope, map) {
    var listeners = {};
    function off(event, callback) {
        var index, list;
        list = listeners[event];
        if (list) {
            if (callback) {
                index = list.indexOf(callback);
                if (index !== -1) {
                    list.splice(index, 1);
                }
            } else {
                list.length = 0;
            }
        }
    }
    function on(event, callback) {
        listeners[event] = listeners[event] || [];
        listeners[event].push(callback);
        return function() {
            off(event, callback);
        };
    }
    function once(event, callback) {
        function fn() {
            off(event, fn);
            callback.apply(scope || target, arguments);
        }
        return on(event, fn);
    }
    function getListeners(event) {
        return listeners[event];
    }
    function fire(callback, args) {
        return callback && callback.apply(target, args);
    }
    function dispatch(event) {
        if (listeners[event]) {
            var i = 0, list = listeners[event], len = list.length;
            while (i < len) {
                fire(list[i], arguments);
                i += 1;
            }
        }
    }
    if (scope && map) {
        target.on = scope[map.on] && scope[map.on].bind(scope);
        target.off = scope[map.off] && scope[map.off].bind(scope);
        target.once = scope[map.once] && scope[map.once].bind(scope);
        target.fire = scope[map.dispatch].bind(scope);
    } else {
        target.on = on;
        target.off = off;
        target.once = once;
        target.fire = dispatch;
    }
};

var queue = exports.q || exports;

var initialized = false;

if (exports.hasOwnProperty("q")) {
    exports = window["goreact"] = function() {
        var args = Array.prototype.slice.call(arguments);
        var method = args.shift();
        if (exports.hasOwnProperty(method)) {
            exports[method].apply(exports, args);
        }
    };
}

dispatcher(exports);

function setup() {
    for (var i = 0; i < queue.length; i += 1) {
        var args = Array.prototype.slice.call(queue[i]);
        var method = args.shift();
        if (method === "init" || method === "on") {
            if (exports.hasOwnProperty(method)) {
                queue.splice(i, 1);
                exports[method].apply(exports, args);
            }
        }
    }
}

exports.on("init::complete", function() {
    var len = queue.length;
    for (var i = 0; i < len; i += 1) {
        var args = Array.prototype.slice.call(queue[i]);
        var method = args.shift();
        if (exports.hasOwnProperty(method)) {
            console.log("METHOD", method);
            try {
                exports[method].apply(exports, args);
            } catch (e) {}
        }
    }
    queue.length = 0;
});

setTimeout(setup);

exports.collaborate = function() {
    console.log("collaborate");
    exports.fire("collaborate::complete");
};

exports.init = function() {
    console.log("init");
    setTimeout(function() {
        exports.fire("init::complete");
    }, 1e3);
};

exports.list = function() {
    console.log("list");
    exports.fire("list::complete");
};

exports.playback = function() {
    console.log("playback");
    exports.fire("playback::complete");
};

exports.record = function() {
    console.log("record");
    exports.fire("record::complete");
};

exports.upload = function() {
    console.log("upload");
    exports.fire("upload::complete");
};
})();