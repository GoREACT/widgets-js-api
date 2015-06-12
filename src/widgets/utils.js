var utils = (function() {
    var exports = {};
    var toString = Object.prototype.toString;
    var msie = isMSIE();

    exports.clone = clone;
    exports.extend = extend;
    exports.forEach = forEach;
    exports.isFunction = isFunction;
    exports.isObject = isObject;
    exports.isArray = isArray;
    exports.isArrayLike = isArrayLike;
    exports.isString = isString;
    exports.isDefined = isDefined;
    exports.isWindow = isWindow;
    exports.int = int;
    exports.lowercase = lowercase;
    exports.isElement = isElement;
    exports.serialize = serialize;
    exports.styleToString = styleToString;
    exports.sendRequest = createHttpBackend;

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
        if (obj === null || isWindow(obj)) {
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
        return value !== null && typeof value === 'object';
    }

    function isDefined(value) {
        return typeof value !== 'undefined';
    }

    function isWindow(obj) {
        return obj && obj.document && obj.location && obj.alert && obj.setInterval;
    }

    function lowercase(string){
        return isString(string) ? string.toLowerCase() : string;
    }

    function int(str) {
        return parseInt(str, 10);
    }

    function isElement(o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    }

    /**
     * Serialize object
     *
     * @param obj
     * @param prefix
     * @returns {string}
     */
    function serialize(obj, prefix) {
        var str = [];
        for(var p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push(typeof v == "object" ?
                    serialize(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&").replace(/%20/g, "+");
    }

    /**
     * Style to string
     *
     * @param obj
     * @returns {string}
     */
    function styleToString(obj) {
        var str = '';
        for (var e in obj) {
            if (obj.hasOwnProperty(e)) {
                str += e + ':' + obj[e] + ';';
            }
        }
        return str;
    }

    /**
     * IE 11 changed the format of the UserAgent string.
     * See http://msdn.microsoft.com/en-us/library/ms537503.aspx
     */
    function isMSIE() {
        var msie = int((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1], 10);
        if (isNaN(msie)) {
            msie = int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1], 10);
        }
        return msie;
    }

    function createXhr(method) {
        //if IE and the method is not RFC2616 compliant, or if XMLHttpRequest
        //is not available, try getting an ActiveXObject. Otherwise, use XMLHttpRequest
        //if it is available
        if (msie <= 8 && (!method.match(/^(get|post|head|put|delete|options)$/i) ||
            !window.XMLHttpRequest)) {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
        } else if (window.XMLHttpRequest) {
            return new window.XMLHttpRequest();
        }

        throw new Error('noxhr', "This browser does not support XMLHttpRequest.");
    }

    /**
     *
     * Implementation Notes for non-IE browsers
     * ----------------------------------------
     * Assigning a URL to the href property of an anchor DOM node, even one attached to the DOM,
     * results both in the normalizing and parsing of the URL.  Normalizing means that a relative
     * URL will be resolved into an absolute URL in the context of the application document.
     * Parsing means that the anchor node's host, hostname, protocol, port, pathname and related
     * properties are all populated to reflect the normalized URL.  This approach has wide
     * compatibility - Safari 1+, Mozilla 1+, Opera 7+,e etc.  See
     * http://www.aptana.com/reference/html/api/HTMLAnchorElement.html
     *
     * Implementation Notes for IE
     * ---------------------------
     * IE >= 8 and <= 10 normalizes the URL when assigned to the anchor node similar to the other
     * browsers.  However, the parsed components will not be set if the URL assigned did not specify
     * them.  (e.g. if you assign a.href = "foo", then a.protocol, a.host, etc. will be empty.)  We
     * work around that by performing the parsing in a 2nd step by taking a previously normalized
     * URL (e.g. by assigning to a.href) and assigning it a.href again.  This correctly populates the
     * properties such as protocol, hostname, port, etc.
     *
     * IE7 does not normalize the URL when assigned to an anchor node.  (Apparently, it does, if one
     * uses the inner HTML approach to assign the URL as part of an HTML snippet -
     * http://stackoverflow.com/a/472729)  However, setting img[src] does normalize the URL.
     * Unfortunately, setting img[src] to something like "javascript:foo" on IE throws an exception.
     * Since the primary usage for normalizing URLs is to sanitize such URLs, we can't use that
     * method and IE < 8 is unsupported.
     *
     * References:
     *   http://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
     *   http://www.aptana.com/reference/html/api/HTMLAnchorElement.html
     *   http://url.spec.whatwg.org/#urlutils
     *   https://github.com/angular/angular.js/pull/2902
     *   http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
     *
     * @function
     * @param {string} url The URL to be parsed.
     * @description Normalizes and parses a URL.
     * @returns {object} Returns the normalized URL as a dictionary.
     *
     *   | member name   | Description    |
     *   |---------------|----------------|
     *   | href          | A normalized version of the provided URL if it was not an absolute URL |
     *   | protocol      | The protocol including the trailing colon                              |
     *   | host          | The host and port (if the port is non-default) of the normalizedUrl    |
     *   | search        | The search params, minus the question mark                             |
     *   | hash          | The hash string, minus the hash symbol
     *   | hostname      | The hostname
     *   | port          | The port, without ":"
     *   | pathname      | The pathname, beginning with "/"
     *
     */
    function urlResolve(url, base) {
        var href = url;
        var urlParsingNode = document.createElement("a");

        if (msie) {
            // Normalize before parse.  Refer Implementation Notes on why this is
            // done in two steps on IE.
            urlParsingNode.setAttribute("href", href);
            href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname : '/' + urlParsingNode.pathname
        };
    }

    /**
     * Create http backend
     *
     * @param method
     * @param url
     * @param post
     * @param callback
     * @param headers
     * @param withCredentials
     * @param responseType
     */
    function createHttpBackend(method, url, post, callback, headers, withCredentials, responseType) {
        var ABORTED = -1;
        var status;

        var xhr = createXhr(method);

        xhr.open(method, url, true);
        forEach(headers, function(value, key) {
            if (isDefined(value)) {
                xhr.setRequestHeader(key, value);
            }
        });

        // In IE6 and 7, this might be called synchronously when xhr.send below is called and the
        // response is in the cache. the promise api will ensure that to the app code the api is
        // always async
        xhr.onreadystatechange = function() {
            // onreadystatechange might get called multiple times with readyState === 4 on mobile webkit caused by
            // xhrs that are resolved while the app is in the background (see #5426).
            // since calling completeRequest sets the `xhr` variable to null, we just check if it's not null before
            // continuing
            //
            // we can't set xhr.onreadystatechange to undefined or delete it because that breaks IE8 (method=PATCH) and
            // Safari respectively.
            if (xhr && xhr.readyState == 4) {
                var responseHeaders = null,
                    response = null;

                if(status !== ABORTED) {
                    responseHeaders = xhr.getAllResponseHeaders();

                    // responseText is the old-school way of retrieving response (supported by IE8 & 9)
                    // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
                    response = ('response' in xhr) ? xhr.response : xhr.responseText;
                }

                completeRequest(callback,
                    status || xhr.status,
                    response,
                    responseHeaders,
                    xhr.statusText || '');
            }
        };

        if (withCredentials) {
            xhr.withCredentials = true;
        }

        if (responseType) {
            try {
                xhr.responseType = responseType;
            } catch (e) {
                // WebKit added support for the json responseType value on 09/03/2013
                // https://bugs.webkit.org/show_bug.cgi?id=73648. Versions of Safari prior to 7 are
                // known to throw when setting the value "json" as the response type. Other older
                // browsers implementing the responseType
                //
                // The json response type can be ignored if not supported, because JSON payloads are
                // parsed on the client-side regardless.
                if (responseType !== 'json') {
                    throw e;
                }
            }
        }

        xhr.send(post || null);

        function completeRequest(callback, status, response, headersString, statusText) {

            // fix status code when it is 0 (0 status is undocumented).
            // Occurs when accessing file resources or on Android 4.1 stock browser
            // while retrieving files from application cache.
            if (status === 0) {
                status = response ? 200 : urlResolve(url).protocol == 'file' ? 404 : 0;
            }

            // normalize IE bug (http://bugs.jquery.com/ticket/1450)
            status = status === 1223 ? 204 : status;
            statusText = statusText || '';

            callback(status, response, headersString, statusText);
        }
    }

    return exports;
})();