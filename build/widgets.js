(function() {
    var exports = window["goreact"];
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
        var prefix = "interlace_";
        var count = 0;
        function isElement(o) {
            return typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
        }
        var hashToParams = function(hash) {
            var search = hash ? "?" : "";
            for (var k in hash) {
                if (hash[k].isArray) {
                    for (var i = 0; i < hash[k].length; i++) {
                        search += search === "?" ? "" : "&";
                        search += encodeURIComponent(k) + "=" + encodeURIComponent(hash[k][i]);
                    }
                } else {
                    search += search === "?" ? "" : "&";
                    search += encodeURIComponent(k) + "=" + encodeURIComponent(hash[k]);
                }
            }
            return search;
        };
        var getParam = function(name, from) {
            from = from || window.location.search;
            var regexS = "[?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(from);
            if (results === null) {
                return "";
            }
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        };
        var styleToString = function(obj) {
            var str = "";
            for (var e in obj) {
                if (obj.hasOwnProperty(e)) {
                    str += e + ":" + obj[e] + ";";
                }
            }
            return str;
        };
        exports.prefix = function(value) {
            prefix = value;
        };
        exports.load = function(payload) {
            var frameId = prefix + (count += 1);
            var iframe = document.createElement("iframe");
            var params = payload.params || {};
            params.interlace = frameId;
            var url = payload.url + hashToParams(params);
            payload.options = payload.options || {};
            iframe.id = frameId;
            iframe.src = url;
            iframe.setAttribute("width", typeof payload.options.width === "undefined" ? "100%" : payload.options.width);
            iframe.setAttribute("height", typeof payload.options.height === "undefined" ? "100%" : payload.options.height);
            iframe.setAttribute("scrolling", "no");
            iframe.setAttribute("marginheight", "0");
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("allowtransparency", "true");
            iframe.setAttribute("style", "display:none");
            iframe.send = function(event, data) {
                data = data || {};
                data.$$id = this.id;
                data.$$event = event;
                var json = JSON.stringify(data);
                this.contentWindow.postMessage(json, "*");
            };
            iframe.show = function() {
                if (iframe.parentNode.style.display === "none") {
                    iframe.parentNode.style.display = iframe.$$display;
                }
            };
            iframe.hide = function() {
                if (!iframe.$$display) {
                    iframe.$$display = iframe.parentNode.style.display;
                    iframe.parentNode.style.display = "none";
                }
            };
            iframe.destroy = function() {
                if (iframe.parentNode.getAttribute("data-ic")) {
                    iframe.parentNode.parentNode.removeChild(iframe.parentNode);
                } else {
                    iframe.parentNode.removeChild(iframe);
                }
                iframe.fire("destroyed");
            };
            iframe.onload = function() {
                iframe.removeAttribute("style");
                if (payload.class) {
                    iframe.setAttribute("class", payload.class);
                }
                iframe.fire("loaded");
            };
            var container = payload.container;
            if (isElement(container)) {} else if (!container) {
                container = document.createElement("div");
                container.setAttribute("data-ic", "container-" + frameId);
                container.setAttribute("style", "position:absolute;top:0;left:0;width:100%;height:100%;z-index:99999");
                document.body.appendChild(container);
            } else if (typeof container === "object") {
                container = document.createElement("div");
                container.setAttribute("data-ic", "container-" + frameId);
                container.setAttribute("style", styleToString(payload.container));
                document.body.appendChild(container);
            }
            if (container.children.length) {
                container.children[0].destroy();
            }
            container.appendChild(iframe);
            dispatcher(iframe);
            return iframe;
        };
        exports.send = function(event, data) {
            var target = arguments[2];
            var interlaceId = getParam("interlace");
            data = data || {};
            data.$$id = interlaceId;
            data.$$event = event;
            var json = JSON.stringify(data);
            if (interlaceId) {
                parent.postMessage(json, "*");
            }
        };
        dispatcher(exports);
        window.addEventListener("message", function(evt) {
            var data = JSON.parse(evt.data);
            var interlaceId = data.$$id;
            var interlaceEvent = data.$$event;
            delete data.$$id;
            delete data.$$event;
            var iframe = document.getElementById(interlaceId);
            if (iframe) {
                iframe.fire(interlaceEvent, data);
            } else {
                exports.fire(interlaceEvent, data);
            }
        });
        var interlaceId = getParam("interlace");
        if (interlaceId) {
            exports.send("ready");
        }
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
        while (i--) {
            var args = Array.prototype.slice.call(queue[i]);
            var method = args.shift();
            if (method === "authorize" || method === "on") {
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
        var name = "success";
        interlace.prefix("widget_");
        var clone = function(obj) {
            return JSON.parse(JSON.stringify(obj));
        };
        var params = clone(settings);
        params.signature = signature;
        var widget = interlace.load({
            url: "https://rawgit.com/GoREACT/widgets-js-api/master/example/widgets/{name}.html".supplant({
                name: name
            }),
            params: params,
            options: {
                width: "0px",
                height: "0px"
            }
        });
        widget.type = "authorize";
        widget.on("success", function(event, data) {
            widget.destroy();
            exports.fire("authorize::success", this);
        });
        widget.on("error", function(event, data) {
            widget.destroy();
            exports.fire("authorize::error", this);
        });
    };
    (function() {
        var name = "collaborate";
        exports[name] = function(options) {
            options = options || {};
            var widget = interlace.load({
                container: options.container,
                url: "https://rawgit.com/GoREACT/widgets-js-api/master/example/widgets/{name}.html".supplant({
                    name: name
                }),
                params: options.params
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
        };
    })();
    exports.destroy = function(widgetId) {
        var widget = document.getElementById(widgetId);
        if (widget) {
            widget.destroy();
        }
    };
    (function() {
        var name = "list";
        exports[name] = function(options) {
            options = options || {};
            var widget = interlace.load({
                container: options.container,
                url: "https://rawgit.com/GoREACT/widgets-js-api/master/example/widgets/{name}.html".supplant({
                    name: name
                }),
                params: options.params
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
        };
    })();
    (function() {
        var name = "playback";
        exports[name] = function(options) {
            options = options || {};
            var widget = interlace.load({
                container: options.container,
                url: "https://rawgit.com/GoREACT/widgets-js-api/master/example/widgets/{name}.html".supplant({
                    name: name
                }),
                params: options.params
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
        };
    })();
    (function() {
        var name = "record";
        exports[name] = function(options) {
            options = options || {};
            var widget = interlace.load({
                container: options.container,
                url: "https://rawgit.com/GoREACT/widgets-js-api/master/example/widgets/{name}.html".supplant({
                    name: name
                }),
                params: options.params
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
        };
    })();
    (function() {
        var name = "upload";
        exports[name] = function(options) {
            options = options || {};
            var widget = interlace.load({
                container: options.container,
                url: "https://rawgit.com/GoREACT/widgets-js-api/master/example/widgets/{name}.html".supplant({
                    name: name
                }),
                params: options.params
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
        };
    })();
})();