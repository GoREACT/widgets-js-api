(function() {
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
    var interlace = function() {
        var exports = {};
        var prefix = "interlace-";
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
        exports.load = function(payload) {
            var frameId = prefix + (count += 1);
            var iframe = document.createElement("iframe");
            var params = payload.params || {};
            params.interlace = frameId;
            var url = payload.url + hashToParams(params);
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
            iframe.close = function() {
                if (iframe.parentNode.getAttribute("data-ic")) {
                    iframe.parentNode.parentNode.removeChild(iframe.parentNode);
                } else {
                    iframe.parentNode.removeChild(iframe);
                }
            };
            iframe.onload = function() {
                iframe.removeAttribute("style");
                if (payload.class) {
                    iframe.setAttribute("class", payload.class);
                }
                iframe.fire("loaded");
            };
            var container = payload.container;
            if (isElement(container)) {} else if (typeof container === "object") {
                container = document.createElement("div");
                container.setAttribute("data-ic", "container-" + frameId);
                container.setAttribute("style", styleToString(payload.container));
                document.body.appendChild(container);
            } else if (typeof container === "undefined") {
                container = document.createElement("div");
                container.setAttribute("data-ic", "container-" + frameId);
                container.setAttribute("style", "position:absolute;top:0;left:0;width:100%;height:100%;z-index:99999");
                document.body.appendChild(container);
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
            if (method === "init" || method === "on") {
                if (exports.hasOwnProperty(method)) {
                    queue.splice(i, 1);
                    exports[method].apply(exports, args);
                }
            }
        }
    }
    exports.on("init::complete", function() {
        console.log("###INIT###COMPLETE###");
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
    exports.collaborate = function() {
        console.log("collaborate");
        exports.fire("collaborate::complete");
    };
    exports.init = function(settings) {
        var iframe = interlace.load({
            url: "widgets/success.html",
            params: settings,
            options: {
                width: "0px",
                height: "0px"
            }
        });
        iframe.on("success", function(event, data) {
            console.log("init::success", data);
            iframe.close();
            exports.fire("init::success", data);
        });
        iframe.on("error", function(event, data) {
            console.log("init::error", data);
            iframe.close();
            exports.fire("init::error", data);
        });
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
        var iframe = interlace.load({
            container: document.getElementById("containerEl"),
            url: "widgets/recorder.html",
            "class": "shadow",
            params: {
                api_key: "123",
                signature: "abc123"
            },
            options: {}
        });
        iframe.on("ready", function() {
            console.log("iframe ready");
            exports.fire("init::complete");
            iframe.send("reveal", {
                message: "I am your father!"
            });
        });
        iframe.on("shout", function(event, data) {
            console.log("### FROM CHILD ###", data);
        });
        iframe.on("close", function(event, data) {
            console.log("CLOSE FROM PARENT");
            iframe.close();
        });
        iframe.on("hide", function(event, data) {
            iframe.hide();
        });
        iframe.on("show", function(event, data) {
            iframe.show();
        });
        return iframe;
    };
    exports.upload = function() {
        console.log("upload");
        exports.fire("upload::complete");
    };
})();