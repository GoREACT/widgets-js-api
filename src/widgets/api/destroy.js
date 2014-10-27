exports.destroy = function (widgetId) {
    var widget = document.getElementById(widgetId);
    if (widget) {
        widget.destroy();
    }
};