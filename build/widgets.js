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
        var bodyOverflow = "";
        var preventDefault = function(e) {
            e.preventDefault();
        };
        function isElement(o) {
            return typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
        }
        var hashToParams = function(hash) {
            var search = hash ? "?" : "";
            for (var k in hash) {
                if (!hash[k]) {
                    hash[k] = "";
                }
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
                var payload = {};
                payload.id = this.id;
                payload.event = event;
                payload.data = data;
                var json = JSON.stringify(payload);
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
                document.body.style.overflow = bodyOverflow;
                document.body.removeEventListener("touchstart", preventDefault);
                document.body.removeEventListener("touchmove", preventDefault);
                if (iframe.parentNode.getAttribute("data-interlace")) {
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
            iframe.setAttribute("data-interlace-frame", frameId);
            var container = payload.container;
            if (isElement(container)) {} else if (!container) {
                container = document.createElement("div");
                container.setAttribute("data-interlace", "container-" + frameId);
                container.setAttribute("style", "position:absolute;top:0;left:0;width:100%;height:100%;z-index:99999");
                document.body.style.overflow = "hidden";
                document.body.addEventListener("touchstart", preventDefault);
                document.body.addEventListener("touchmove", preventDefault);
                document.body.appendChild(container);
            } else if (typeof container === "object") {
                container = document.createElement("div");
                container.setAttribute("data-interlace", "container-" + frameId);
                container.setAttribute("style", styleToString(payload.container));
                document.body.style.overflow = "hidden";
                document.body.addEventListener("touchstart", preventDefault);
                document.body.addEventListener("touchmove", preventDefault);
                document.body.appendChild(container);
            }
            var iframes = container.querySelectorAll("[data-interlace-frame]");
            var i = iframes.length;
            while (i) {
                i -= 1;
                iframes[i].parentNode.removeChild(iframes[i]);
            }
            container.appendChild(iframe);
            dispatcher(iframe);
            return iframe;
        };
        exports.send = function(event, data) {
            var interlaceId = getParam("interlace");
            var payload = {};
            payload.id = interlaceId;
            payload.event = event;
            payload.data = data;
            var json = JSON.stringify(payload);
            if (interlaceId) {
                parent.postMessage(json, "*");
            }
        };
        dispatcher(exports);
        window.addEventListener("message", function(evt) {
            var payload = JSON.parse(evt.data);
            var iframe = document.getElementById(payload.id);
            if (iframe) {
                iframe.fire(payload.event, payload.data);
            } else {
                exports.fire(payload.event, payload.data);
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
        interlace.prefix("widget_");
        var clone = function(obj) {
            return JSON.parse(JSON.stringify(obj));
        };
        var params = clone(settings);
        params.signature = signature;
        if (settings.api_key && settings.api_key.indexOf("sb") === 0) {
            exports.baseUrl = "//sandbox.goreact.com";
        } else {
            exports.baseUrl = "//goreact.com";
        }
        var widget = interlace.load({
            url: exports.baseUrl + "/v1/auth",
            params: params,
            options: {
                width: "0px",
                height: "0px"
            }
        });
        widget.type = "authorize";
        widget.on("success", function(event, data) {
            widget.destroy();
            exports.fire("authorize::success", this, data);
        });
        widget.on("error", function(event, data) {
            widget.destroy();
            exports.fire("authorize::error", this, data);
        });
    };
    (function() {
        var name = "collaborate";
        exports[name] = function(options) {
            options = options || {};
            var params = {
                goreact_id: options.goreact_id
            };
            var widget = interlace.load({
                container: options.container,
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
            return "Not supported yet";
            var widget = interlace.load({
                container: options.container,
                url: exports.baseUrl + "@@listUri",
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
            var params = {
                goreact_id: options.goreact_id
            };
            var widget = interlace.load({
                container: options.container,
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
            widget.on("ready", function() {
                exports.fire(name + "::ready", this);
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
                exports.fire(name + "::error", this);
            });
        };
    })();
    (function() {
        var name = "record";
        exports[name] = function(options) {
            options = options || {};
            var widget = interlace.load({
                container: options.container,
                url: exports.baseUrl + "/v1/record",
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
        };
    })();
    (function() {
        var name = "upload";
        exports[name] = function(options) {
            options = options || {};
            var widget = interlace.load({
                container: options.container,
                url: exports.baseUrl + "/v1/upload",
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