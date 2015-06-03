var interlace = (function () {

    var exports = {};
    var prefix = 'widget_';
    var count = 0;

    function styleToString(obj) {
        var str = '';
        for (var e in obj) {
            if (obj.hasOwnProperty(e)) {
                str += e + ':' + obj[e] + ';';
            }
        }
        return str;
    }

    exports.load = function (payload) {
        var widget = document.createElement('div'),
            params = payload.params || {},
            url = payload.url + (payload.url.indexOf("?") === -1 ? "?" : "&") + utils.serialize(params),
            display = '';

        console.log(payload);

        // widget id
        widget.id = prefix + (count += 1);

        /**
         * Show the widget
         */
        widget.show = function () {
            if (widget.parentNode.style.display === 'none') {
                widget.parentNode.style.display = display;
            }
        };

        /**
         * Hide the widget
         */
        widget.hide = function () {
            if (!display) {
                display = widget.parentNode.style.display;
                widget.parentNode.style.display = 'none';
            }
        };

        /**
         * Destroy the widget
         */
        widget.destroy = function () {
            widget.parentNode.removeChild(widget);
            widget.fire('destroyed');
        };

        // resolve container
        var container = payload.container;
        if (!utils.isElement(container)) {
            if (!container) { // null or undefined
                container = document.createElement('div');
                container.setAttribute('data-widget', 'container-' + widget.id);
                container.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:99999');
                document.body.appendChild(container);
            } else if (typeof container === 'object') { // container is acting as a set of style options
                container = document.createElement('div');
                container.setAttribute('data-widget', 'container-' + widget.id);
                container.setAttribute('style', styleToString(payload.container));
                document.body.appendChild(container);
            }
        }

        container.appendChild(widget);

        dispatcher(widget);

        console.log("widget", widget);

        utils.createHttpBackend("GET", url, {}, function(html) {
            console.log("html", html);

            widget.fire('loaded');
        });

        return widget;
    };

    dispatcher(exports);

    return exports;
})();