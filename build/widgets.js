(function() {
    var exports = window["goreact"];
    var utils = function() {
        var exports = {};
        var toString = Object.prototype.toString;
        var msie = isMSIE();
        exports.clone = clone;
        exports.extend = extend;
        exports.forEach = forEach;
        exports.isFunction = isFunction;
        exports.isObject = isObject;
        exports.isArray = isArray;
        exports.isString = isString;
        exports.lowercase = lowercase;
        exports.isElement = isElement;
        exports.serialize = serialize;
        exports.createHttpBackend = createHttpBackend;
        function clone(obj) {
            return JSON.parse(JSON.stringify(obj));
        }
        function extend(dst) {
            forEach(arguments, function(obj) {
                if (obj !== dst) {
                    forEach(obj, function(value, key) {
                        dst[key] = value;
                    });
                }
            });
            return dst;
        }
        function forEach(obj, iterator, context) {
            var key;
            if (obj) {
                if (isFunction(obj)) {
                    for (key in obj) {
                        if (key != "prototype" && key != "length" && key != "name" && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                            iterator.call(context, obj[key], key);
                        }
                    }
                } else if (obj.forEach && obj.forEach !== forEach) {
                    obj.forEach(iterator, context);
                } else if (isArrayLike(obj)) {
                    for (key = 0; key < obj.length; key++) iterator.call(context, obj[key], key);
                } else {
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            iterator.call(context, obj[key], key);
                        }
                    }
                }
            }
            return obj;
        }
        function isString(value) {
            return typeof value === "string";
        }
        function isArray(value) {
            return toString.call(value) === "[object Array]";
        }
        function isArrayLike(obj) {
            if (obj == null || isWindow(obj)) {
                return false;
            }
            var length = obj.length;
            if (obj.nodeType === 1 && length) {
                return true;
            }
            return isString(obj) || isArray(obj) || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
        }
        function isFunction(value) {
            return typeof value === "function";
        }
        function isObject(value) {
            return value != null && typeof value === "object";
        }
        function isDefined(value) {
            return typeof value !== "undefined";
        }
        function isWindow(obj) {
            return obj && obj.document && obj.location && obj.alert && obj.setInterval;
        }
        function lowercase(string) {
            return isString(string) ? string.toLowerCase() : string;
        }
        function int(str) {
            return parseInt(str, 10);
        }
        function isElement(o) {
            return typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
        }
        function serialize(obj, prefix) {
            var str = [];
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                    str.push(typeof v == "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
                }
            }
            return str.join("&").replace(/%20/g, "+");
        }
        function isMSIE() {
            var msie = int((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1], 10);
            if (isNaN(msie)) {
                msie = int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1], 10);
            }
            return msie;
        }
        function createXhr(method) {
            if (msie <= 8 && (!method.match(/^(get|post|head|put|delete|options)$/i) || !window.XMLHttpRequest)) {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            } else if (window.XMLHttpRequest) {
                return new window.XMLHttpRequest();
            }
            throw new Error("noxhr", "This browser does not support XMLHttpRequest.");
        }
        function urlResolve(url, base) {
            var href = url;
            var urlParsingNode = document.createElement("a");
            if (msie) {
                urlParsingNode.setAttribute("href", href);
                href = urlParsingNode.href;
            }
            urlParsingNode.setAttribute("href", href);
            return {
                href: urlParsingNode.href,
                protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
                host: urlParsingNode.host,
                search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
                hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
                hostname: urlParsingNode.hostname,
                port: urlParsingNode.port,
                pathname: urlParsingNode.pathname.charAt(0) === "/" ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
            };
        }
        function createHttpBackend(method, url, post, callback, headers, withCredentials, responseType) {
            var ABORTED = -1;
            var status;
            var xhr = createXhr(method);
            xhr.open(method, url, true);
            forEach(headers, function(value, key) {
                if (isDefined(value)) {
                    xhr.setRequestHeader(key, value);
                }
            });
            xhr.onreadystatechange = function() {
                if (xhr && xhr.readyState == 4) {
                    var responseHeaders = null, response = null;
                    if (status !== ABORTED) {
                        responseHeaders = xhr.getAllResponseHeaders();
                        response = "response" in xhr ? xhr.response : xhr.responseText;
                    }
                    completeRequest(callback, status || xhr.status, response, responseHeaders, xhr.statusText || "");
                }
            };
            if (withCredentials) {
                xhr.withCredentials = true;
            }
            if (responseType) {
                try {
                    xhr.responseType = responseType;
                } catch (e) {
                    if (responseType !== "json") {
                        throw e;
                    }
                }
            }
            xhr.send(post || null);
            function completeRequest(callback, status, response, headersString, statusText) {
                if (status === 0) {
                    status = response ? 200 : urlResolve(url).protocol == "file" ? 404 : 0;
                }
                status = status === 1223 ? 204 : status;
                statusText = statusText || "";
                callback(status, response, headersString, statusText);
            }
        }
        return exports;
    }();
    var transient = {};
    if (!String.prototype.supplant) {
        String.prototype.supplant = function(o) {
            return this.replace(/\{([^{}]*)\}/g, function(a, b) {
                var r = o[b];
                return typeof r === "string" || typeof r === "number" ? r : a;
            });
        };
    }
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
    var interlace = function() {
        var exports = {};
        var prefix = "widget_";
        var count = 0;
        function styleToString(obj) {
            var str = "";
            for (var e in obj) {
                if (obj.hasOwnProperty(e)) {
                    str += e + ":" + obj[e] + ";";
                }
            }
            return str;
        }
        exports.load = function(payload) {
            var widget = document.createElement("div"), params = payload.params || {}, url = payload.url + (payload.url.indexOf("?") === -1 ? "?" : "&") + utils.serialize(params), display = "";
            console.log(payload);
            widget.id = prefix + (count += 1);
            widget.show = function() {
                if (widget.parentNode.style.display === "none") {
                    widget.parentNode.style.display = display;
                }
            };
            widget.hide = function() {
                if (!display) {
                    display = widget.parentNode.style.display;
                    widget.parentNode.style.display = "none";
                }
            };
            widget.destroy = function() {
                widget.parentNode.removeChild(widget);
                widget.fire("destroyed");
            };
            var container = payload.container;
            if (!utils.isElement(container)) {
                if (!container) {
                    container = document.createElement("div");
                    container.setAttribute("data-widget", "container-" + widget.id);
                    container.setAttribute("style", "position:absolute;top:0;left:0;width:100%;height:100%;z-index:99999");
                    document.body.appendChild(container);
                } else if (typeof container === "object") {
                    container = document.createElement("div");
                    container.setAttribute("data-widget", "container-" + widget.id);
                    container.setAttribute("style", styleToString(payload.container));
                    document.body.appendChild(container);
                }
            }
            container.appendChild(widget);
            dispatcher(widget);
            console.log("widget", widget);
            utils.createHttpBackend("GET", url, {}, function(html) {
                console.log("html", html);
                widget.fire("loaded");
            });
            return widget;
        };
        dispatcher(exports);
        return exports;
    }();
    var queue = exports.q || exports;
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
        var i = queue.length;
        queue.reverse();
        while (i--) {
            var args = Array.prototype.slice.call(queue[i]);
            var method = args.shift();
            if (method === "authorize" || method === "on" || method === "off") {
                if (exports.hasOwnProperty(method)) {
                    queue.splice(i, 1);
                    exports[method].apply(exports, args);
                }
            }
        }
    }
    exports.on("authorize::success", function() {
        var len = queue.length;
        for (var i = 0; i < len; i += 1) {
            var args = Array.prototype.slice.call(queue[i]);
            var method = args.shift();
            if (exports.hasOwnProperty(method)) {
                try {
                    exports[method].apply(exports, args);
                } catch (e) {}
            }
        }
        queue.length = 0;
    });
    setTimeout(setup);
    (function() {
        var name = "authorize";
        if (!exports.baseUrl) {
            exports.baseUrl = "https://goreact.com";
        }
        exports[name] = function(settings, signature) {
            interlace.prefix("widget_");
            var params = utils.clone(settings);
            params.signature = signature;
            if (!exports.baseUrl) {
                if (settings.api_key && settings.api_key.indexOf("sb") === 0) {
                    exports.baseUrl = "https://sandbox.goreact.com";
                } else if (settings.api_key && settings.api_key.indexOf("dev") === 0) {
                    exports.baseUrl = "https://dev.goreact.com";
                }
            }
            var widget = interlace.load({
                url: exports.baseUrl + "/v1/auth",
                params: params,
                options: {
                    width: "0px",
                    height: "0px"
                }
            });
            widget.parentNode.removeAttribute("style");
            widget.type = "authorize";
            widget.on("success", function(event, data) {
                setTransientData(data);
                widget.destroy();
                exports.fire("authorize::success", this, data);
            });
            widget.on("error", function(event, data) {
                setTransientData(data);
                widget.destroy();
                exports.fire("authorize::error", this, data);
            });
            function setTransientData(data) {
                if (utils.isObject(data) && data.transient) {
                    utils.extend(transient, {
                        "transient": data.transient
                    });
                    delete data.transient;
                }
            }
            return widget.id;
        };
    })();
    (function() {
        var name = "collaborate";
        exports[name] = function(options) {
            options = options || {};
            var container = options.container;
            delete options.container;
            var params = utils.clone(options);
            utils.extend(params, transient);
            params.mode = "collaborate";
            var widget = interlace.load({
                container: container,
                url: exports.baseUrl + "/v1/session",
                params: params
            });
            widget.type = name;
            widget.on("destroy", function() {
                widget.destroy();
            });
            widget.on("hide", function() {
                widget.hide();
            });
            widget.on("show", function() {
                widget.show();
            });
            widget.on("destroyed", function() {
                exports.fire(name + "::destroyed", this);
            });
            widget.on("error", function(evt, data) {
                exports.fire(name + "::error", this, data);
            });
            widget.on("sessionReady", function() {
                exports.fire(name + "::ready", this);
            });
            return widget.id;
        };
    })();
    exports.destroy = function(widgetId) {
        var widget = document.getElementById(widgetId);
        if (widget) {
            widget.fire("destroy");
        }
    };
    (function() {
        var name = "list";
        exports[name] = function(options) {
            return "Not supported yet";
            options = options || {};
            var container = options.container;
            delete options.container;
            var params = utils.clone(options);
            utils.extend(params, transient);
            var widget = interlace.load({
                container: container,
                url: exports.baseUrl + "@@listUri",
                params: params
            });
            widget.type = name;
            widget.on("destroy", function() {
                widget.destroy();
            });
            widget.on("hide", function() {
                widget.hide();
            });
            widget.on("show", function() {
                widget.show();
            });
            widget.on("ready", function() {
                exports.fire(name + "::ready", this);
            });
            widget.on("destroyed", function() {
                exports.fire(name + "::destroyed", this);
            });
            widget.on("error", function(evt, data) {
                exports.fire(name + "::error", this, data);
            });
            return widget.id;
        };
    })();
    (function() {
        var name = "playback";
        exports[name] = function(options) {
            options = options || {};
            var container = options.container;
            delete options.container;
            var params = utils.clone(options);
            utils.extend(params, transient);
            var widget = interlace.load({
                container: container,
                url: exports.baseUrl + "/v1/playback",
                params: params
            });
            widget.type = name;
            widget.on("destroy", function() {
                widget.destroy();
            });
            widget.on("hide", function() {
                widget.hide();
            });
            widget.on("show", function() {
                widget.show();
            });
            widget.on("error", function(evt, data) {
                exports.fire(name + "::error", this, data);
            });
            widget.on("destroyed", function() {
                exports.fire(name + "::destroyed", this);
            });
            widget.on("playbackReady", function() {
                exports.fire(name + "::ready", this);
            });
            widget.on("playbackOnPlay", function() {
                exports.fire(name + "::play", this);
            });
            widget.on("playbackOnPause", function() {
                exports.fire(name + "::pause", this);
            });
            widget.on("playbackOnSeek", function() {
                exports.fire(name + "::seek", this);
            });
            widget.on("playbackOnBuffer", function() {
                exports.fire(name + "::buffer", this);
            });
            widget.on("playbackOnError", function() {
                exports.fire(name + "::playError", this);
            });
            return widget.id;
        };
    })();
    (function() {
        var name = "record";
        exports[name] = function(options) {
            options = options || {};
            var container = options.container;
            delete options.container;
            var params = utils.clone(options);
            utils.extend(params, transient);
            var widget = interlace.load({
                container: container,
                url: exports.baseUrl + "/v1/record",
                params: params
            });
            widget.type = name;
            widget.on("destroy", function() {
                widget.destroy();
            });
            widget.on("hide", function() {
                widget.hide();
            });
            widget.on("show", function() {
                widget.show();
            });
            widget.on("error", function(evt, data) {
                exports.fire(name + "::error", this, data);
            });
            widget.on("destroyed", function() {
                exports.fire(name + "::destroyed", this);
            });
            widget.on("recordReady", function(evt, data) {
                exports.fire(name + "::ready", this, data);
            });
            widget.on("recordStart", function(evt, data) {
                exports.fire(name + "::start", this, data);
            });
            widget.on("recordStarted", function(evt, data) {
                exports.fire(name + "::started", this, data);
            });
            widget.on("recordStop", function(evt, data) {
                exports.fire(name + "::stop", this, data);
            });
            widget.on("recordStopped", function(evt, data) {
                exports.fire(name + "::stopped", this, data);
            });
            widget.on("recordPost", function(evt, data) {
                exports.fire(name + "::post", this, data);
            });
            widget.on("recordPostSuccess", function(evt, data) {
                exports.fire(name + "::postSuccess", this, data);
            });
            widget.on("recordPostError", function(evt, data) {
                exports.fire(name + "::postError", this, data);
            });
            widget.on("recordDiscard", function(evt, data) {
                exports.fire(name + "::discard", this, data);
            });
            widget.on("recordDiscardSuccess", function(evt, data) {
                exports.fire(name + "::discardSuccess", this, data);
            });
            widget.on("recordDiscardError", function(evt, data) {
                exports.fire(name + "::discardError", this, data);
            });
            widget.on("recordTimeout", function(evt, data) {
                exports.fire(name + "::timeout", this, data);
            });
            return widget.id;
        };
    })();
    (function() {
        var name = "upload";
        exports[name] = function(options) {
            options = options || {};
            var container = options.container;
            delete options.container;
            var params = utils.clone(options);
            utils.extend(params, transient);
            var widget = interlace.load({
                container: container,
                url: exports.baseUrl + "/v1/upload",
                params: params
            });
            widget.type = name;
            widget.on("destroy", function() {
                widget.destroy();
            });
            widget.on("hide", function() {
                widget.hide();
            });
            widget.on("show", function() {
                widget.show();
            });
            widget.on("error", function(evt, data) {
                exports.fire(name + "::error", this, data);
            });
            widget.on("destroyed", function(evt, data) {
                exports.fire(name + "::destroyed", this, data);
            });
            widget.on("uploadReady", function(evt, data) {
                exports.fire(name + "::ready", this, data);
            });
            widget.on("uploadActive", function(evt, data) {
                exports.fire(name + "::active", this, data);
            });
            widget.on("uploadFileAdded", function(evt, data) {
                exports.fire(name + "::fileAdded", this, data);
            });
            widget.on("uploadStart", function(evt, data) {
                exports.fire(name + "::start", this, data);
            });
            widget.on("uploadStop", function(evt, data) {
                exports.fire(name + "::stop", this, data);
            });
            widget.on("uploadSubmit", function(evt, data) {
                exports.fire(name + "::submit", this, data);
            });
            widget.on("uploadUserAborted", function(evt, data) {
                exports.fire(name + "::userAborted", this, data);
            });
            widget.on("uploadSuccess", function(evt, data) {
                exports.fire(name + "::success", this, data);
            });
            widget.on("uploadFailed", function(evt, data) {
                exports.fire(name + "::failed", this, data);
            });
            widget.on("uploadPost", function(evt, data) {
                exports.fire(name + "::post", this, data);
            });
            widget.on("uploadPostSuccess", function(evt, data) {
                exports.fire(name + "::postSuccess", this, data);
            });
            widget.on("uploadPostError", function(evt, data) {
                exports.fire(name + "::postError", this, data);
            });
            return widget.id;
        };
    })();
})();