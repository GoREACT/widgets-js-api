(function () {
    var widgetsUrl = '@@widgetsUrl',
        baseUrl = '';

    // check for widgets debug
    if((typeof window.goreactDebug === "object")) {
        if(window.goreactDebug.widgetsUrl) {
            widgetsUrl = window.goreactDebug.widgetsUrl;
        }
        if(window.goreactDebug.baseUrl) {
            baseUrl = window.goreactDebug.baseUrl;
        }
    }

    // Create an async script element for analytics.js based on your API key.
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = widgetsUrl;

    init('authorize on off destroy record upload playback collaborate list');

    function init(functions) {

        var service = [];

        // A list of all the methods in analytics.js that we want to stub.
        service.methods = functions.split(' ');

        // Define a factory to create queue stubs. These are placeholders for the
        // "real" methods in this script so that you never have to wait for the library
        // to load asynchronously to start invoking things. The `method` is always the
        // first argument, so we know which method to replay the call into.
        service.factory = function (method) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(method);
                service.push(args);
                return service;
            };
        };

        // For each of our methods, generate a queueing method.
        for (var i = 0; i < service.methods.length; i++) {
            var method = service.methods[i];
            service[method] = service.factory(method);
        }

        // Find the first script element on the page and insert our script next to it.
        var firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);

        window['@@name'] = service;
        window['@@name'].baseUrl = baseUrl;
    }
})();
