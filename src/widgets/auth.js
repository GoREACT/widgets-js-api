// auth object
var auth;

var STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    ERROR: 'error'
};

/**
 * Widgets authorization request
 *
 * @param data
 * @param signature
 */
exports.authorize = function(data, signature) {

    var params = utils.clone(data);
    params.signature = signature;

    var status = STATUS.PENDING;

    auth = {
	    data: {},
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

    // Determine base url
    if(!config.baseUrl) {

        // API Key is required
        if(!data.apiKey) {
            throw new Error('Parameter "apiKey" is a required');
        }

        // Determine environment using api key
        var baseUrl = settings.config.environments[data.apiKey];
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
        if(utils.isObject(response)) {
            if(httpStatus === 200) {
	            // add transient data to auth data
	            utils.extend(auth.data, {
		            transient: response.transient
	            });
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

    return auth;
};