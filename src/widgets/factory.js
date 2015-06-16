var factory = (function () {

    var exports = {};
    var prefix = 'widget_';
    var className = 'widget-container';
    var count = 0;

    /**
     * Create widget
     *
     * @param options
     * @returns {HTMLElement}
     */
    exports.create = function (options) {
        var widget = document.createElement('div'),
            display = '';

        // widget id
        widget.id = prefix + (count += 1);
        widget.className = className;
        widget.style.position = "relative";
        widget.style.width = '100%';
        widget.style.height = '100%';
        dispatcher(widget);

        /**
         * Show the widget
         */
        widget.show = function () {
            if (widget.parentNode.style.display === 'none') {
                widget.parentNode.style.display = display;
            }
            widget.fire('shown');
        };

        /**
         * Hide the widget
         */
        widget.hide = function () {
            if (!display) {
                display = widget.parentNode.style.display;
                widget.parentNode.style.display = 'none';
            }
            widget.fire('hidden');
        };

        /**
         * Show loading indicator
         *
         * @param value
         */
        var loadingDiv, loadingStyle;
        widget.showLoading = function(value) {
            if(value) {
                // create loading style
                loadingStyle = document.createElement('style');
                loadingStyle.type = 'text/css';
                loadingStyle.innerHTML = '@@loadingStyle';
                widget.appendChild(loadingStyle);

                // create loading dev
                loadingDiv = document.createElement('div');
                loadingDiv.className = 'load';
                utils.forEach([
                    'G', 'N', 'I', 'D', 'A', 'O', 'L'
                ], function(letter) {
                    var letterDiv = document.createElement('div');
                    letterDiv.innerText = letter;
                    loadingDiv.appendChild(letterDiv);
                });
                widget.appendChild(loadingDiv);
            } else {
                if(loadingDiv) {
                    loadingDiv.parentElement.removeChild(loadingDiv);
                }
                if(loadingStyle) {
                    loadingStyle.parentElement.removeChild(loadingStyle);
                }
            }
        };

        /**
         * Destroy the widget
         */
        widget.destroy = function () {
            widget.parentNode.removeChild(widget);
            widget.fire('destroyed');
        };

        /**
         * Widget destroyed event listener
         */
        widget.on("destroyed", function() {
            widget.off();
        });

        // resolve container
        var container = options.container;
        if (!utils.isElement(container)) {
            if (!container) { // null or undefined
                container = document.createElement('div');
                container.setAttribute('data-widget', 'container-' + widget.id);
                container.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:99999');
                document.body.appendChild(container);
            } else if (typeof container === 'object') { // container is acting as a set of style options
                container = document.createElement('div');
                container.setAttribute('data-widget', 'container-' + widget.id);
                container.setAttribute('style', utils.styleToString(options.container));
                document.body.appendChild(container);
            }
        }

        // clear container content
        while (container.firstChild) {
            var w = container.firstChild;
            w.destroy();
        }

        // add widget to container
        container.appendChild(widget);

        return widget;
    };

    /**
     * Load widget
     */
    exports.getContent = function(widget, url, params) {

        params = params || {};

        if(!utils.isEmptyObject(params)) {
            url += (url.indexOf("?") === -1 ? "?" : "&") + utils.serialize(params);
        }

        // make request for view
        utils.sendRequest("GET", url, {}, function(status, html) {

            var tElement = document.createElement('div');
            tElement.innerHTML = html;

            // clone and remove scripts for later insert
            // so that they will get executed by the browser
            var clonedScripts = [];
            var scripts = tElement.getElementsByTagName('script');
            var i = scripts.length;

            while (i--) {
                var script = document.createElement("script");
                var props = ['type', 'src', 'text'];
                for(var k = 0; k < props.length; k++) {
                    var prop = props[k];
                    if(scripts[i][prop]) {
                        script[prop] = scripts[i][prop];
                    }
                }
                clonedScripts.push(script);

                // remove script
                scripts[i].parentNode.removeChild(scripts[i]);
            }

            // Insert template element children
            for(i = 0 ; i < tElement.children.length ; i++) {
                widget.appendChild(tElement.children[i]);
            }

            // insert scripts
            for(i = 0; i < clonedScripts.length; i++) {
                widget.lastChild.appendChild(clonedScripts[i]);
            }

            widget.fire('loaded');
        });
    };

    dispatcher(exports);

    return exports;
})();