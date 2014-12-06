(function () {
    var name = 'upload';
    var minHeight = 340;

    exports[name] = function (options) {
        options = options || {};

        var container = options.container;
        delete options.container;

        var params = utils.clone(options);
        utils.extend(params, transient);

        var widget = interlace.load({
            container: container,
            url: exports.baseUrl + '@@uploadUri',
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

        widget.on('destroyed', function (evt, data) {
            exports.fire(name + '::destroyed', this, data);
        });

        widget.on('uploadReady', function (evt, data) {
            exports.fire(name + '::ready', this, data);
        });

        widget.on('uploadActive', function (evt, data) {
            exports.fire(name + '::active', this, data);
        });

        widget.on('uploadFileAdded', function (evt, data) {
            exports.fire(name + '::fileAdded', this, data);
        });

        widget.on('uploadStart', function (evt, data) {
            exports.fire(name + '::start', this, data);
        });

        widget.on('uploadStop', function (evt, data) {
            exports.fire(name + '::stop', this, data);
        });

        widget.on('uploadSubmit', function (evt, data) {
            exports.fire(name + '::submit', this, data);
        });

        widget.on('uploadUserAborted', function (evt, data) {
            exports.fire(name + '::userAborted', this, data);
        });

        widget.on('uploadSuccess', function (evt, data) {
            exports.fire(name + '::success', this, data);
        });

        widget.on('uploadFailed', function (evt, data) {
            exports.fire(name + '::failed', this, data);
        });

        widget.on('uploadPost', function (evt, data) {
            exports.fire(name + '::post', this, data);
        });

        widget.on('uploadPostSuccess', function (evt, data) {
            exports.fire(name + '::postSuccess', this, data);
        });

        widget.on('uploadPostError', function (evt, data) {
            exports.fire(name + '::postError', this, data);
        });

        return widget.id;
    };
})();
