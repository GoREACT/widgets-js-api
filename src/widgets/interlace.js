var interlace = (function () {

    var exports = {};
    var prefix = 'interlace-';
    var count = 0;

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

    exports.load = function (payload) {
        var frameId = prefix + (count += 1);
        var iframe = document.createElement('iframe');

        var params = payload.params || {};
        params.interlace = frameId;

        var url = payload.url + hashToParams(params);

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
            data = data || {};
            data.$$id = this.id;
            data.$$event = event;
            var json = JSON.stringify(data);

            this.contentWindow.postMessage(json, '*');
        };

        iframe.show = function () {
            if(iframe.parentNode.style.display === 'none') {
                iframe.parentNode.style.display = iframe.$$display;
            }
        };

        iframe.hide = function () {
            if(!iframe.$$display) {
                iframe.$$display = iframe.parentNode.style.display;
                iframe.parentNode.style.display = 'none';
            }
        };

        iframe.close = function () {
            if(iframe.parentNode.getAttribute('data-ic')) { // if this id exist, we created it
                iframe.parentNode.parentNode.removeChild(iframe.parentNode);
            } else {
                iframe.parentNode.removeChild(iframe);
            }
        };

        iframe.onload = function () {
            iframe.removeAttribute('style');
            if (payload.class) {
                iframe.setAttribute('class', payload.class);
            }
            iframe.fire('loaded');
        };

        // Append the iframe to our element.
        var container = payload.container;
        if (isElement(container)) {
//            container.setAttribute('data-ic', 'container-' + frameId);
        } else if (typeof container === 'object') { // container is acting as a set of style options
            container = document.createElement('div');
            container.setAttribute('data-ic', 'container-' + frameId);
            container.setAttribute('style', styleToString(payload.container));
            document.body.appendChild(container);
        } else if (typeof container === 'undefined') { // default element
            container = document.createElement('div');
            container.setAttribute('data-ic', 'container-' + frameId);
            container.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:99999');
            document.body.appendChild(container);
        }

        container.appendChild(iframe);

//        window.addEventListener('resize', function() {
//            that.sendWidth();
//        });

        dispatcher(iframe);

        return iframe;
    };

    exports.send = function (event, data) {
        var target = arguments[2];

        var interlaceId = getParam('interlace');

        data = data || {};
        data.$$id = interlaceId;
        data.$$event = event;
        var json = JSON.stringify(data);

        if (interlaceId) {
            parent.postMessage(json, '*')
        }
    };

    dispatcher(exports);

    window.addEventListener('message', function (evt) {
        var data = JSON.parse(evt.data);
        var interlaceId = data.$$id;
        var interlaceEvent = data.$$event;
        delete data.$$id;
        delete data.$$event;
//        console.log('message received', data);

        var iframe = document.getElementById(interlaceId);
        if (iframe) { // we are the parent
//            console.log('### WE ARE THE PARENT ###');
            iframe.fire(interlaceEvent, data);
        } else { // we are the child
//            console.log('### WE ARE THE CHILD ####');
            exports.fire(interlaceEvent, data);
        }
    });

    var interlaceId = getParam('interlace');
    if (interlaceId) { // this file has been loaded into an iframe by interlace
        exports.send('ready');
    }

    return exports;

})();