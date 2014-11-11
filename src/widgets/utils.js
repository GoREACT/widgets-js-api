var utils = (function() {
    var exports = {};

    exports.clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    return exports;
})();