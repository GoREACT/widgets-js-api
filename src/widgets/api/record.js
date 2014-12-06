(function () {
    var name = 'record';
    var minHeight = 340;

    exports[name] = function (options) {
        options = options || {};

        var container = options.container;
        delete options.container;

        var params = utils.clone(options);
        utils.extend(params, authData);

        var widget = interlace.load({
            container: container,
            url: exports.baseUrl + '@@recordUri',
            params: params
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

        widget.on('error', function (evt, data) {
            exports.fire(name + '::error', this, data);
        });

        widget.on('destroyed', function () {
            exports.fire(name + '::destroyed', this);
        });

        widget.on('recordReady', function (evt, data) {
            exports.fire(name + '::ready', this, data);
        });

        widget.on('recordStart', function (evt, data) {
            exports.fire(name + '::start', this, data);
        });

        widget.on('recordStarted', function (evt, data) {
            exports.fire(name + '::started', this, data);
        });

        widget.on('recordStop', function (evt, data) {
            exports.fire(name + '::stop', this, data);
        });

        widget.on('recordStopped', function (evt, data) {
            exports.fire(name + '::stopped', this, data);
        });

        widget.on('recordPost', function (evt, data) {
            exports.fire(name + '::post', this, data);
        });

        widget.on('recordPostSuccess', function (evt, data) {
            exports.fire(name + '::postSuccess', this, data);
        });

        widget.on('recordPostError', function (evt, data) {
            exports.fire(name + '::postError', this, data);
        });

        widget.on('recordDiscard', function (evt, data) {
            exports.fire(name + '::discard', this, data);
        });

        widget.on('recordDiscardSuccess', function (evt, data) {
            exports.fire(name + '::discardSuccess', this, data);
        });

        widget.on('recordDiscardError', function (evt, data) {
            exports.fire(name + '::discardError', this, data);
        });

        widget.on('recordTimeout', function (evt, data) {
            exports.fire(name + '::timeout', this, data);
        });

        return widget.id;
    };
})();
