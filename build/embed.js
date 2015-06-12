(function(window, undefined) {
    var config = typeof window.goreactConfig === "object" ? window.goreactConfig : {};
    config.baseUrl = config.baseUrl ? config.baseUrl : "https://goreact.com";
    config.widgetsUrl = config.widgetsUrl ? config.widgetsUrl : "https://d3gw3t0696ua5r.cloudfront.net/widgets/v2/widgets.min.js";
    init("authorize on off destroy record upload playback review list");
    function init(functions) {
        var service = [];
        service.methods = functions.split(" ");
        service.factory = function(method) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(method);
                service.push(args);
                return service;
            };
        };
        for (var i = 0; i < service.methods.length; i++) {
            var method = service.methods[i];
            service[method] = service.factory(method);
        }
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = config.widgetsUrl;
        var firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(script, firstScript);
        service.config = config;
        window["goreact"] = service;
    }
}).bind(window)(window);