var utils = (function() {
    var exports = {};

    exports.clone = clone;
    exports.extend = extend;
    exports.forEach = forEach;
    exports.isFunction = isFunction;
    exports.isObject = isObject;
    exports.isArray = isArray;
    exports.isString = isString;

    function clone (obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function extend(dst) {
        forEach(arguments, function(obj){
            if (obj !== dst) {
                forEach(obj, function(value, key){
                    dst[key] = value;
                });
            }
        });

        return dst;
    }

    function forEach(obj, iterator, context) {
        var key;
        if (obj) {
            if (isFunction(obj)) {
                for (key in obj) {
                    // Need to check if hasOwnProperty exists,
                    // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                    if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                        iterator.call(context, obj[key], key);
                    }
                }
            } else if (obj.forEach && obj.forEach !== forEach) {
                obj.forEach(iterator, context);
            } else if (isArrayLike(obj)) {
                for (key = 0; key < obj.length; key++)
                    iterator.call(context, obj[key], key);
            } else {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key);
                    }
                }
            }
        }
        return obj;
    }

    function isString(value) {
        return typeof value === 'string';
    }

    function isArray(value) {
        return toString.call(value) === '[object Array]';
    }

    function isArrayLike(obj) {
        if (obj == null || isWindow(obj)) {
            return false;
        }

        var length = obj.length;

        if (obj.nodeType === 1 && length) {
            return true;
        }

        return isString(obj) || isArray(obj) || length === 0 ||
            typeof length === 'number' && length > 0 && (length - 1) in obj;
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function isObject(value){
        return value != null && typeof value === 'object';
    }

    function isWindow(obj) {
        return obj && obj.document && obj.location && obj.alert && obj.setInterval;
    }

    return exports;
})();