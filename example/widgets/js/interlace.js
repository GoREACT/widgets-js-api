(function (global) {

    var exports = global.interlace = {};
    var prefix = 'interlace-';
    var count = 0;

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

    exports.load = function (payload) {
        var frameId = prefix + (count += 1);
        var iframe = document.createElement('iframe');

        var params = payload.params || {};
        params.interlace = frameId;

        var url = payload.url + hashToParams(params);

        // Append the initial width as a querystring parameter, and the fragment id
        iframe.src = url;

        // Set some attributes to this proto-iframe.
        iframe.setAttribute('width', typeof payload.options.width === 'undefined' ? '100%' : payload.options.width);
        iframe.setAttribute('height', typeof payload.options.height === 'undefined' ? '100%' : payload.options.height);
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('marginheight', '0');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowtransparency', 'true');
        iframe.setAttribute('style', 'display:none');

        iframe.onload = function(){
            iframe.removeAttribute('style');
            if (payload.class) {
                iframe.setAttribute('class', payload.class);
            }
            iframe.fire('ready');
        };

        // Append the iframe to our element.
        container.appendChild(iframe);

//        window.addEventListener('resize', function() {
//            that.sendWidth();
//        });

        dispatcher(iframe);

        return iframe;
    };

})(this);