/**
 * Authorize widgets
 *
 * @param settings
 * @param signature
 */
exports.authorize = function (settings, signature) {

    var params = utils.clone(settings);
    params.signature = signature;

    // determine environment (default is production)
    if(settings.api_key && settings.api_key.indexOf("sb") === 0) {
        exports.config.baseUrl = "@@sandboxUrl";
    } else if(settings.api_key && settings.api_key.indexOf("dev") === 0) {
        exports.config.baseUrl = "@@devUrl";
    }

    // Assemble auth url
    var url = exports.config.baseUrl + "@@authUri";
    url = url + (url.indexOf("?") === -1 ? "?" : "&") + utils.serialize(params);

    // Make auth request
    utils.sendRequest("GET", url + "?", {}, function(status, response) {
        if(response) {
            setTransientData(response);
            if(status === 200) {
                exports.fire('authorize::success', this, response.message);
            } else {
                exports.fire('authorize::error', this, response.message);
            }
        } else {
            exports.fire('authorize::error', this, "");
        }

    }, {}, false, 'json');

    /**
     * Set transient data
     *
     * @param data
     */
    function setTransientData (data) {
        if(utils.isObject(data) && data.transient) {
            utils.extend(transient, {
                transient: data.transient
            });
            delete data.transient;
        }
    }
};