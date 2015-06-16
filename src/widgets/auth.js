// auth object
var auth = false;
// data that persists with each request
var transient = {};

/**
 * Widgets authorization request
 *
 * @param data
 * @param signature
 */
exports.authorize = function(data, signature) {

    var params = utils.clone(data);
    params.signature = signature;

    var STATUS = {
        PENDING: 'pending',
        SUCCESS: 'success',
        ERROR: 'error'
    };

    var status = STATUS.PENDING;

    auth = {
        isPending: function() {
            return status === STATUS.PENDING;
        },
        isSuccess: function() {
            return status === STATUS.SUCCESS;
        },
        isError: function() {
            return status === STATUS.ERROR;
        },
        getStatus: function() {
            return status;
        }
    };

    dispatcher(auth);

    if(!config.baseUrl) {

        // API Key is required
        if(!data.api_key) {
            throw new Error('Parameter "api_key" is a required');
        }

        // Determine environment using api key
        var baseUrl = settings.config.environments[data.api_key];
        if(baseUrl) {
            config.baseUrl = baseUrl;
        } else {
            config.baseUrl = settings.config.environments.local;
        }
    }

    // Assemble auth url
    var url = config.baseUrl + settings.config.api.authorize;
    if(!utils.isEmptyObject(params)) {
        url += (url.indexOf("?") === -1 ? "?" : "&") + utils.serialize(params);
    }

    // Make auth request
    utils.sendRequest("GET", url, {}, function(httpStatus, response) {
        if(response) {
            if(httpStatus === 200) {
                setTransientData(response);
                status = STATUS.SUCCESS;
                auth.fire(status, response.message);
            } else {
                status = STATUS.ERROR;
                auth.fire(status, response.message);
            }
        } else {
            status = STATUS.ERROR;
            auth.fire(status, "An unknown error occurred");
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

    return auth;
};