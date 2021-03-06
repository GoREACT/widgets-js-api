(function(global, undefined) {
    var settings = settings || {};
    settings["config"] = {
        authEndpoint: "/widgets/v2/auth",
        environments: {
            dev: "https://dev.goreact.com",
            sb: "https://sandbox.goreact.com",
            prod: "https://goreact.com"
        },
        api: {
            record: "/widgets/v2/templates/record",
            upload: "/widgets/v2/templates/upload",
            playback: "/widgets/v2/templates/playback",
            review: "/widgets/v2/templates/review",
            umc: "/widgets/v2/templates/umc",
            list: "/widgets/v2/templates/list",
            pay: "/widgets/v2/templates/pay",
            editAccount: "/widgets/v2/templates/edit-account",
            editGroup: "/widgets/v2/templates/edit-group",
            editActivity: "/widgets/v2/templates/edit-activity",
            viewActivity: "/widgets/v2/templates/view-activity",
            listActivities: "/widgets/v2/templates/list-activities"
        }
    };
    var exports = {};
    var config = typeof global.goreactConfig === "object" ? global.goreactConfig : {};
    config.baseUrl = config.baseUrl ? config.baseUrl : "";
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
        exports.isEmptyObject = isEmptyObject;
        exports.isString = isString;
        exports.isDefined = isDefined;
        exports.isWindow = isWindow;
        exports.int = int;
        exports.lowercase = lowercase;
        exports.camelcase = camelcase;
        exports.snakecase = snakecase;
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
        function isEmptyObject(obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
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
        var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
        var MOZ_HACK_REGEXP = /^moz([A-Z])/;
        function camelcase(name) {
            return name.replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
                return offset ? letter.toUpperCase() : letter;
            }).replace(MOZ_HACK_REGEXP, "Moz$1");
        }
        var SNAKE_CASE_REGEXP = /[A-Z]/g;
        function snakecase(name, separator) {
            separator = separator || "_";
            return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
                return (pos ? separator : "") + letter.toLowerCase();
            });
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
                if (isMSIE() && isString(response) && responseType === "json") {
                    response = JSON.parse(response);
                }
                callback(status, response, headersString, statusText);
            }
        }
        return exports;
    }();
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
        var className = "widget";
        var loadIndicatorClassName = "widget-load-indicator";
        function Widget() {}
        Widget.prototype.getBaseUrl = function() {
            return config.baseUrl;
        };
        Widget.prototype.getAuth = function() {
            return auth;
        };
        exports.load = function(uri, containerEl, options) {
            var widget = new Widget(), element = document.createElement("div"), display = "";
            var loadingDiv, loadingStyle;
            options = options || {};
            element.className = className;
            element.style.position = "relative";
            element.style.width = "100%";
            element.style.height = "100%";
            dispatcher(widget);
            if (!options.hideLoadingIndicator) {
                showLoadingIndicator(true);
            }
            if (auth.isPending() || auth.isIdle()) {
                auth.on("success", function success() {
                    loadContent(config.baseUrl + uri, utils.extend({}, auth.data));
                });
                auth.on("error", function error() {
                    showLoadingIndicator(false);
                });
            } else if (auth.isSuccess()) {
                loadContent(config.baseUrl + uri, utils.extend({}, auth.data));
            } else {
                showLoadingIndicator(false);
            }
            widget.show = function() {
                widget.fire("show");
            };
            widget.hide = function() {
                widget.fire("hide");
            };
            widget.destroy = function() {
                widget.fire("destroy");
            };
            widget.on("contentLoaded", function() {
                showLoadingIndicator(false);
            });
            widget.on("show", function() {
                if (widget.element.parentNode.style.display === "none") {
                    widget.element.parentNode.style.display = display;
                }
                widget.fire("shown");
            });
            widget.on("hide", function() {
                if (!display) {
                    display = widget.element.parentNode.style.display;
                    widget.element.parentNode.style.display = "none";
                }
                widget.fire("hidden");
            });
            widget.on("destroy", function() {
                widget.element.parentNode.removeChild(element);
                widget.fire("destroyed");
            });
            widget.on("destroyed", function() {
                showLoadingIndicator(false);
                widget.off();
            });
            if (!utils.isElement(containerEl)) {
                if (!containerEl) {
                    containerEl = document.createElement("div");
                    containerEl.setAttribute("style", "position:absolute;top:0;left:0;width:100%;height:100%;z-index:99999");
                    document.body.appendChild(containerEl);
                } else if (typeof containerEl === "object") {
                    containerEl = document.createElement("div");
                    containerEl.setAttribute("style", utils.styleToString(containerEl));
                    document.body.appendChild(containerEl);
                }
            }
            while (containerEl.firstChild) {
                var el = containerEl.firstChild;
                if (el.widget) {
                    el.widget.destroy();
                } else {
                    containerEl.removeChild(el);
                }
            }
            containerEl.appendChild(element);
            widget.element = element;
            widget.options = options;
            widget.element.widget = widget;
            function loadContent(url, params) {
                params = params || {};
                if (!utils.isEmptyObject(params)) {
                    url += (url.indexOf("?") === -1 ? "?" : "&") + utils.serialize(params);
                }
                utils.sendRequest("GET", url, {}, function(httpStatus, html) {
                    if (httpStatus === 200) {
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
                            clonedScripts.unshift(script);
                            scripts[i].parentNode.removeChild(scripts[i]);
                        }
                        for (i = 0; i < tElement.children.length; i++) {
                            element.appendChild(tElement.children[i]);
                        }
                        for (i = 0; i < clonedScripts.length; i++) {
                            element.lastChild.appendChild(clonedScripts[i]);
                        }
                        widget.fire("loadSuccess");
                    } else {
                        showLoadingIndicator(false);
                        widget.fire("loadError");
                    }
                });
            }
            function showLoadingIndicator(value) {
                if (value) {
                    loadingStyle = document.createElement("style");
                    loadingStyle.type = "text/css";
                    loadingStyle.innerHTML = ".widget>.widget-load-indicator{position:absolute;top:50%;margin-top:-20px;margin-left:-20px;left:50%;font-size:20px;width:1em;height:1em;border-radius:50%;text-indent:-9999em;-webkit-animation:load4 1.3s infinite linear;animation:load4 1.3s infinite linear;-webkit-transform:translateZ(0);-ms-transform:translateZ(0);transform:translateZ(0)}@-webkit-keyframes load4{0%,100%{box-shadow:0 -3em 0 .2em #000,2em -2em 0 0 #000,3em 0 0 -1em #000,2em 2em 0 -1em #000,0 3em 0 -1em #000,-2em 2em 0 -1em #000,-3em 0 0 -1em #000,-2em -2em 0 0 #000}12.5%{box-shadow:0 -3em 0 0 #000,2em -2em 0 .2em #000,3em 0 0 0 #000,2em 2em 0 -1em #000,0 3em 0 -1em #000,-2em 2em 0 -1em #000,-3em 0 0 -1em #000,-2em -2em 0 -1em #000}25%{box-shadow:0 -3em 0 -.5em #000,2em -2em 0 0 #000,3em 0 0 .2em #000,2em 2em 0 0 #000,0 3em 0 -1em #000,-2em 2em 0 -1em #000,-3em 0 0 -1em #000,-2em -2em 0 -1em #000}37.5%{box-shadow:0 -3em 0 -1em #000,2em -2em 0 -1em #000,3em 0 0 0 #000,2em 2em 0 .2em #000,0 3em 0 0 #000,-2em 2em 0 -1em #000,-3em 0 0 -1em #000,-2em -2em 0 -1em #000}50%{box-shadow:0 -3em 0 -1em #000,2em -2em 0 -1em #000,3em 0 0 -1em #000,2em 2em 0 0 #000,0 3em 0 .2em #000,-2em 2em 0 0 #000,-3em 0 0 -1em #000,-2em -2em 0 -1em #000}62.5%{box-shadow:0 -3em 0 -1em #000,2em -2em 0 -1em #000,3em 0 0 -1em #000,2em 2em 0 -1em #000,0 3em 0 0 #000,-2em 2em 0 .2em #000,-3em 0 0 0 #000,-2em -2em 0 -1em #000}75%{box-shadow:0 -3em 0 -1em #000,2em -2em 0 -1em #000,3em 0 0 -1em #000,2em 2em 0 -1em #000,0 3em 0 -1em #000,-2em 2em 0 0 #000,-3em 0 0 .2em #000,-2em -2em 0 0 #000}87.5%{box-shadow:0 -3em 0 0 #000,2em -2em 0 -1em #000,3em 0 0 -1em #000,2em 2em 0 -1em #000,0 3em 0 -1em #000,-2em 2em 0 0 #000,-3em 0 0 0 #000,-2em -2em 0 .2em #000}}@keyframes load4{0%,100%{box-shadow:0 -3em 0 .2em #000,2em -2em 0 0 #000,3em 0 0 -1em #000,2em 2em 0 -1em #000,0 3em 0 -1em #000,-2em 2em 0 -1em #000,-3em 0 0 -1em #000,-2em -2em 0 0 #000}12.5%{box-shadow:0 -3em 0 0 #000,2em -2em 0 .2em #000,3em 0 0 0 #000,2em 2em 0 -1em #000,0 3em 0 -1em #000,-2em 2em 0 -1em #000,-3em 0 0 -1em #000,-2em -2em 0 -1em #000}25%{box-shadow:0 -3em 0 -.5em #000,2em -2em 0 0 #000,3em 0 0 .2em #000,2em 2em 0 0 #000,0 3em 0 -1em #000,-2em 2em 0 -1em #000,-3em 0 0 -1em #000,-2em -2em 0 -1em #000}37.5%{box-shadow:0 -3em 0 -1em #000,2em -2em 0 -1em #000,3em 0 0 0 #000,2em 2em 0 .2em #000,0 3em 0 0 #000,-2em 2em 0 -1em #000,-3em 0 0 -1em #000,-2em -2em 0 -1em #000}50%{box-shadow:0 -3em 0 -1em #000,2em -2em 0 -1em #000,3em 0 0 -1em #000,2em 2em 0 0 #000,0 3em 0 .2em #000,-2em 2em 0 0 #000,-3em 0 0 -1em #000,-2em -2em 0 -1em #000}62.5%{box-shadow:0 -3em 0 -1em #000,2em -2em 0 -1em #000,3em 0 0 -1em #000,2em 2em 0 -1em #000,0 3em 0 0 #000,-2em 2em 0 .2em #000,-3em 0 0 0 #000,-2em -2em 0 -1em #000}75%{box-shadow:0 -3em 0 -1em #000,2em -2em 0 -1em #000,3em 0 0 -1em #000,2em 2em 0 -1em #000,0 3em 0 -1em #000,-2em 2em 0 0 #000,-3em 0 0 .2em #000,-2em -2em 0 0 #000}87.5%{box-shadow:0 -3em 0 0 #000,2em -2em 0 -1em #000,3em 0 0 -1em #000,2em 2em 0 -1em #000,0 3em 0 -1em #000,-2em 2em 0 0 #000,-3em 0 0 0 #000,-2em -2em 0 .2em #000}}";
                    element.appendChild(loadingStyle);
                    loadingDiv = document.createElement("div");
                    loadingDiv.className = loadIndicatorClassName;
                    element.appendChild(loadingDiv);
                } else {
                    if (loadingDiv) {
                        loadingDiv.parentElement.removeChild(loadingDiv);
                    }
                    if (loadingStyle) {
                        loadingStyle.parentElement.removeChild(loadingStyle);
                    }
                    loadingDiv = false;
                    loadingStyle = false;
                }
            }
            return widget;
        };
        dispatcher(exports);
        return exports;
    }();
    var AuthStatus = {
        IDLE: "idle",
        PENDING: "pending",
        SUCCESS: "success",
        ERROR: "error"
    };
    var currentAuthStatus = AuthStatus.IDLE;
    var auth = {
        data: {},
        isIdle: function() {
            return currentAuthStatus === AuthStatus.IDLE;
        },
        isPending: function() {
            return currentAuthStatus === AuthStatus.PENDING;
        },
        isSuccess: function() {
            return currentAuthStatus === AuthStatus.SUCCESS;
        },
        isError: function() {
            return currentAuthStatus === AuthStatus.ERROR;
        },
        getStatus: function() {
            return currentAuthStatus;
        }
    };
    dispatcher(auth);
    exports.authorize = function(apiKey, jwt) {
        if (!apiKey) {
            throw new Error('Parameter "apiKey" is required');
        } else if (!utils.isString(apiKey)) {
            throw new Error('Parameter "apiKey" must be a string.');
        }
        if (!jwt) {
            throw new Error('Parameter "jwt" is required');
        } else if (!utils.isString(jwt)) {
            throw new Error('Parameter "jwt" must be a string.');
        }
        currentAuthStatus = AuthStatus.PENDING;
        auth.fire(currentAuthStatus);
        if (!config.baseUrl) {
            var regExp = new RegExp(Object.keys(settings.config.environments).join("|")), result = apiKey.match(regExp), env = utils.isArray(result) ? result.shift() : false;
            if (env && apiKey.indexOf(env) === 0) {
                config.baseUrl = settings.config.environments[env];
            } else {
                config.baseUrl = window.location.protocol + "//" + window.location.host;
            }
        }
        var url = config.baseUrl + settings.config.authEndpoint;
        utils.sendRequest("GET", url, {}, function(httpStatus, response) {
            if (utils.isObject(response)) {
                if (httpStatus === 200) {
                    utils.extend(auth.data, {
                        "transient": response.transient
                    });
                    currentAuthStatus = AuthStatus.SUCCESS;
                    auth.fire(currentAuthStatus, response.message);
                } else {
                    currentAuthStatus = AuthStatus.ERROR;
                    auth.fire(currentAuthStatus, response.message);
                }
            } else {
                currentAuthStatus = AuthStatus.ERROR;
                auth.fire(currentAuthStatus, "An unknown error occurred");
            }
        }, {
            Authorization: "Bearer " + [ 'apiKey="' + apiKey + '"', 'jwt="' + jwt + '"' ].join(", ")
        }, false, "json");
        return auth;
    };
    (function() {
        utils.forEach(settings.config.api, function(uri, method) {
            exports[method] = function(element, options) {
                var widget = factory.load(uri, element, options);
                widget.element.className += " " + utils.snakecase(widget.element.className + "-" + method, "-");
                return widget;
            };
        });
    })();
    global["goreact"] = exports;
})(this);