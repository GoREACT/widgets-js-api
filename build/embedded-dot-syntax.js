(function() {
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
        var firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(script, firstScript);
        window["goreact"] = service;
    }
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "widgets.js";
    init("init on ready record upload playback collaborate list");
})();