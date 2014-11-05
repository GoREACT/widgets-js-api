var interlace = (function () {

    var exports = {};
    var prefix = 'interlace_';
    var count = 0;

    var bodyOverflow = '';

    var preventDefault = function (e) {
        e.preventDefault();
    };

    function isElement(o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    }

    var hashToParams = function (hash) {
        var search = hash ? '?' : '';
        for (var k in hash) {
            if (hash[k].isArray) {
                for (var i = 0; i < hash[k].length; i++) {
                    search += search === '?' ? '' : '&';
                    search += encodeURIComponent(k) + '=' + encodeURIComponent(hash[k][i]);
                }
            } else {
                search += search === '?' ? '' : '&';
                search += encodeURIComponent(k) + '=' + encodeURIComponent(hash[k]);
            }
        }
        return search;
    };

    var getParam = function (name, from) {
        from = from || window.location.search;
        var regexS = '[?&]' + name + '=([^&#]*)';
        var regex = new RegExp(regexS);
        var results = regex.exec(from);
        if (results === null) {
            return '';
        }
        return decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    var styleToString = function (obj) {
        var str = '';
        for (var e in obj) {
            if (obj.hasOwnProperty(e)) {
                str += e + ':' + obj[e] + ';';
            }
        }
        return str;
    };

    exports.prefix = function (value) {
        prefix = value;
    };

    exports.load = function (payload) {
        var frameId = prefix + (count += 1);
        var iframe = document.createElement('iframe');

        var params = payload.params || {};
        params.interlace = frameId;

        var url = payload.url + hashToParams(params);

        payload.options = payload.options || {};

        // Append the initial width as a querystring parameter, and the fragment id
        iframe.id = frameId;
        iframe.src = url;

        // Set some attributes to this proto-iframe.
        iframe.setAttribute('width', typeof payload.options.width === 'undefined' ? '100%' : payload.options.width);
        iframe.setAttribute('height', typeof payload.options.height === 'undefined' ? '100%' : payload.options.height);
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('marginheight', '0');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowtransparency', 'true');
        iframe.setAttribute('style', 'display:none');

        iframe.send = function (event, data) {
            var payload = {};
            payload.id = this.id;
            payload.event = event;
            payload.data = data;
            var json = JSON.stringify(payload);

            this.contentWindow.postMessage(json, '*');
        };

        iframe.show = function () {
            if (iframe.parentNode.style.display === 'none') {
                iframe.parentNode.style.display = iframe.$$display;
            }
        };

        iframe.hide = function () {
            if (!iframe.$$display) {
                iframe.$$display = iframe.parentNode.style.display;
                iframe.parentNode.style.display = 'none';
            }
        };

        iframe.destroy = function () {
            document.body.style.overflow = bodyOverflow;
            document.body.removeEventListener('touchstart', preventDefault);
            document.body.removeEventListener('touchmove', preventDefault);
            if (iframe.parentNode.getAttribute('data-interlace')) { // if this id exist, we created it
                iframe.parentNode.parentNode.removeChild(iframe.parentNode);
            } else {
                iframe.parentNode.removeChild(iframe);
            }
            iframe.fire('destroyed');
        };

        iframe.onload = function () {
            iframe.removeAttribute('style');
            if (payload.class) {
                iframe.setAttribute('class', payload.class);
            }
            iframe.fire('loaded');
        };

        iframe.setAttribute('data-interlace-frame', frameId);

        // Append the iframe to our element.
        var container = payload.container;
        if (isElement(container)) {
            //container.innerHTML = '';
        } else if (!container) { // null or undefined
            container = document.createElement('div');
            container.setAttribute('data-interlace', 'container-' + frameId);
            container.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:99999');
            document.body.style.overflow = 'hidden';
            document.body.addEventListener('touchstart', preventDefault);
            document.body.addEventListener('touchmove', preventDefault);
            document.body.appendChild(container);
        } else if (typeof container === 'object') { // container is acting as a set of style options
            container = document.createElement('div');
            container.setAttribute('data-interlace', 'container-' + frameId);
            container.setAttribute('style', styleToString(payload.container));
            document.body.style.overflow = 'hidden';
            document.body.addEventListener('touchstart', preventDefault);
            document.body.addEventListener('touchmove', preventDefault);
            document.body.appendChild(container);
        }

        var iframes = container.querySelectorAll('[data-interlace-frame]');
        var i = iframes.length;
        while (i) {
            i -= 1;
            iframes[i].parentNode.removeChild(iframes[i]);
        }

        container.appendChild(iframe);

//        window.addEventListener('resize', function() {
//            that.sendWidth();
//        });

        dispatcher(iframe);

        return iframe;
    };

    exports.send = function (event, data) {
        var interlaceId = getParam('interlace');

        var payload = {};
        payload.id = interlaceId;
        payload.event = event;
        payload.data = data;

        var json = JSON.stringify(payload);

        if (interlaceId) {
            parent.postMessage(json, '*');
        }
    };

    dispatcher(exports);

    window.addEventListener('message', function (evt) {
        var payload = JSON.parse(evt.data);
        var iframe = document.getElementById(payload.id);
        if (iframe) { // we are the parent
//            console.log('### WE ARE THE PARENT ###');
            iframe.fire(payload.event, payload.data);
        } else { // we are the child
//            console.log('### WE ARE THE CHILD ####');
            exports.fire(payload.event, payload.data);
        }
    });

    var interlaceId = getParam('interlace');
    if (interlaceId) { // this file has been loaded into an iframe by interlace
        exports.send('ready');
    }

    return exports;

})();