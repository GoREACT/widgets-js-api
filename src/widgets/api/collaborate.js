(function () {
    var name = 'collaborate';
    var minHeight = 340;

    exports[name] = function (options) {
        options = options || {};

        var container = options.container;
        delete options.container;

        var params = utils.clone(options);
        utils.extend(params, persist);
        params.mode = "collaborate";

        var widget = interlace.load({
            container: container,
            url: exports.baseUrl + '@@collaborateUri',
            params:params
        });

        // set parent element height if not set (enforce minimum height)
        if(widget.parentNode && widget.parentNode.getBoundingClientRect().height < minHeight) {
            widget.parentNode.style.height = minHeight + "px";
        }

        widget.type = name;

        // :: actions :: //
        widget.on('destroy', function () {
            widget.destroy();
        });

        widget.on('hide', function () {
            widget.hide();
        });

        widget.on('show', function () {
            widget.show();
        });

        // :: reactions :: //

        widget.on('destroyed', function () {
            exports.fire(name + '::destroyed', this);
        });

        widget.on('error', function (evt, data) {
            exports.fire(name + '::error', this, data);
        });

        widget.on('sessionReady', function () {
            exports.fire(name + '::ready', this);
        });

        return widget.id;
    }
})();
