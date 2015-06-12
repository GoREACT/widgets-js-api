(function(window, undefined) {
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
        exports.isArrayLike = isArrayLike;
        exports.isString = isString;
        exports.isDefined = isDefined;
        exports.isWindow = isWindow;
        exports.int = int;
        exports.lowercase = lowercase;
        exports.isElement = isElement;
        exports.serialize = serialize;
        exports.styleToString = styleToString;
        exports.sendRequest = createHttpBackend;
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
            if (obj === null || isWindow(obj)) {
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
            return value !== null && typeof value === "object";
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
        function styleToString(obj) {
            var str = "";
            for (var e in obj) {
                if (obj.hasOwnProperty(e)) {
                    str += e + ":" + obj[e] + ";";
                }
            }
            return str;
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
    var factory = function() {
        var exports = {};
        var prefix = "widget_";
        var className = "widget-container";
        var count = 0;
        exports.load = function(payload) {
            var widget = document.createElement("div"), params = payload.params || {}, url = payload.url + (payload.url.indexOf("?") === -1 ? "?" : "&") + utils.serialize(params), display = "";
            widget.id = prefix + (count += 1);
            widget.className = className;
            widget.style.position = "relative";
            widget.style.width = "100%";
            widget.style.height = "100%";
            var loadingStyle = document.createElement("style");
            loadingStyle.type = "text/css";
            loadingStyle.innerHTML = ".widget-container .load{position:absolute;width:600px;height:36px;left:50%;top:40%;margin-left:-300px;overflow:visible;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;z-index:9999}.widget-container .load div{position:absolute;width:20px;height:36px;opacity:0;font-family:Helvetica,Arial,sans-serif;animation:move 2s linear infinite;-o-animation:move 2s linear infinite;-moz-animation:move 2s linear infinite;-webkit-animation:move 2s linear infinite;transform:rotate(180deg);-o-transform:rotate(180deg);-moz-transform:rotate(180deg);-webkit-transform:rotate(180deg);color:#aaa}.widget-container .load div:nth-child(2){animation-delay:.2s;-o-animation-delay:.2s;-moz-animation-delay:.2s;-webkit-animation-delay:.2s}.widget-container .load div:nth-child(3){animation-delay:.4s;-o-animation-delay:.4s;-webkit-animation-delay:.4s}.widget-container .load div:nth-child(4){animation-delay:.6s;-o-animation-delay:.6s;-moz-animation-delay:.6s;-webkit-animation-delay:.6s}.widget-container .load div:nth-child(5){animation-delay:.8s;-o-animation-delay:.8s;-moz-animation-delay:.8s;-webkit-animation-delay:.8s}.widget-container .load div:nth-child(6){animation-delay:1s;-o-animation-delay:1s;-moz-animation-delay:1s;-webkit-animation-delay:1s}.widget-container .load div:nth-child(7){animation-delay:1.2s;-o-animation-delay:1.2s;-moz-animation-delay:1.2s;-webkit-animation-delay:1.2s}@keyframes move{0%{left:0;opacity:0}35%{left:41%;-moz-transform:rotate(0);-webkit-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0);opacity:1}65%{left:59%;-moz-transform:rotate(0);-webkit-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0);opacity:1}100%{left:100%;-moz-transform:rotate(-180deg);-webkit-transform:rotate(-180deg);-o-transform:rotate(-180deg);transform:rotate(-180deg);opacity:0}}@-moz-keyframes move{0%{left:0;opacity:0}35%{left:41%;-moz-transform:rotate(0);transform:rotate(0);opacity:1}65%{left:59%;-moz-transform:rotate(0);transform:rotate(0);opacity:1}100%{left:100%;-moz-transform:rotate(-180deg);transform:rotate(-180deg);opacity:0}}@-webkit-keyframes move{0%{left:0;opacity:0}35%{left:41%;-webkit-transform:rotate(0);transform:rotate(0);opacity:1}65%{left:59%;-webkit-transform:rotate(0);transform:rotate(0);opacity:1}100%{left:100%;-webkit-transform:rotate(-180deg);transform:rotate(-180deg);opacity:0}}@-o-keyframes move{0%{left:0;opacity:0}35%{left:41%;-o-transform:rotate(0);transform:rotate(0);opacity:1}65%{left:59%;-o-transform:rotate(0);transform:rotate(0);opacity:1}100%{left:100%;-o-transform:rotate(-180deg);transform:rotate(-180deg);opacity:0}}";
            widget.appendChild(loadingStyle);
            var loadingDiv = document.createElement("div");
            loadingDiv.className = "load";
            utils.forEach([ "G", "N", "I", "D", "A", "O", "L" ], function(letter) {
                var letterDiv = document.createElement("div");
                letterDiv.innerText = letter;
                loadingDiv.appendChild(letterDiv);
            });
            widget.appendChild(loadingDiv);
            widget.show = function() {
                if (widget.parentNode.style.display === "none") {
                    widget.parentNode.style.display = display;
                }
                widget.fire("shown");
            };
            widget.hide = function() {
                if (!display) {
                    display = widget.parentNode.style.display;
                    widget.parentNode.style.display = "none";
                }
                widget.fire("hidden");
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
                    container.setAttribute("style", utils.styleToString(payload.container));
                    document.body.appendChild(container);
                }
            }
            while (container.firstChild) {
                var w = container.firstChild;
                w.destroy();
            }
            container.appendChild(widget);
            dispatcher(widget);
            widget.on("ready", function() {
                loadingDiv.style.display = "none";
            });
            widget.on("destroyed", function() {
                widget.off();
            });
            utils.sendRequest("GET", url, {}, function(status, html) {
                var tElement = document.createElement("div");
                tElement.innerHTML = html;
                var clonedScripts = [];
                var scripts = tElement.getElementsByTagName("script");
                var i = scripts.length;
                while (i--) {
                    var script = document.createElement("script");
                    var props = [ "type", "src", "text" ];
                    for (var k = 0; k < props.length; k++) {
                        var prop = props[k];
                        if (scripts[i][prop]) {
                            script[prop] = scripts[i][prop];
                        }
                    }
                    clonedScripts.push(script);
                    scripts[i].parentNode.removeChild(scripts[i]);
                }
                for (i = 0; i < tElement.children.length; i++) {
                    widget.appendChild(tElement.children[i]);
                }
                for (i = 0; i < clonedScripts.length; i++) {
                    widget.lastChild.appendChild(clonedScripts[i]);
                }
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
    exports.authorize = function(settings, signature) {
        var params = utils.clone(settings);
        params.signature = signature;
        if (settings.api_key && settings.api_key.indexOf("sb") === 0) {
            exports.config.baseUrl = "https://sandbox.goreact.com";
        } else if (settings.api_key && settings.api_key.indexOf("dev") === 0) {
            exports.config.baseUrl = "https://dev.goreact.com";
        }
        var url = exports.config.baseUrl + "/v2/widgets/auth";
        url = url + (url.indexOf("?") === -1 ? "?" : "&") + utils.serialize(params);
        utils.sendRequest("GET", url + "?", {}, function(status, response) {
            if (response) {
                setTransientData(response);
                if (status === 200) {
                    exports.fire("authorize::success", this, response.message);
                } else {
                    exports.fire("authorize::error", this, response.message);
                }
            } else {
                exports.fire("authorize::error", this, "");
            }
        }, {}, false, "json");
        function setTransientData(data) {
            if (utils.isObject(data) && data.transient) {
                utils.extend(transient, {
                    "transient": data.transient
                });
                delete data.transient;
            }
        }
    };
    exports.destroy = function(widgetId) {
        var widget = document.getElementById(widgetId);
        if (widget) {
            widget.destroy();
        }
    };
    (function() {
        "use strict";
        var api = {
            upload: "/v2/widgets/upload",
            record: "/v2/widgets/record",
            list: "@@listUri",
            playback: "/v2/widgets/playback",
            review: ""
        };
        utils.forEach(api, function(uri, method) {
            exports[method] = function(options) {
                options = options || {};
                var params = utils.clone(options);
                utils.extend(params, transient);
                params.mode = "collaborate";
                var widget = factory.load({
                    container: options.container,
                    url: exports.config.baseUrl + uri,
                    params: params
                });
                widget.type = method;
                widget.on("hide", function() {
                    widget.hide();
                });
                widget.on("show", function() {
                    widget.show();
                });
                widget.on("destroy", function() {
                    widget.destroy();
                });
                return widget.id;
            };
        });
    })();
}).bind(window)(window);