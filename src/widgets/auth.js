var AuthStatus = {
	IDLE: 'idle',
	PENDING: 'pending',
	SUCCESS: 'success',
	ERROR: 'error'
};

var currentAuthStatus = AuthStatus.IDLE;

// auth object
var auth = {
	data: {},
	isIdle: function() {
		return currentAuthStatus === AuthStatus.IDLE;
	},
	isPending: function() {
		return currentAuthStatus === AuthStatus.PENDING;
	},
	isSuccess: function() {
		return currentAuthStatus === AuthStatus.SUCCESS;
	},
	isError: function() {
		return currentAuthStatus === AuthStatus.ERROR;
	},
	getStatus: function() {
		return currentAuthStatus;
	}
};

dispatcher(auth);

/**
 * Widgets authorization request
 *
 * @param data
 * @param signature
 */
exports.authorize = function(data, signature) {
    var params = utils.clone(data);
    params.signature = signature;

	// set pending auth status
	currentAuthStatus = AuthStatus.PENDING;
	auth.fire(currentAuthStatus);

    // Determine base url
    if(!config.baseUrl) {
		var apiKey = data.apiKey || data.api_key;

        // API Key is required
        if(!utils.isString(apiKey)) {
            throw new Error('Parameter "apiKey" is a required and must be a string.');
        }

		// Determine environment using api key
		var regExp = new RegExp(Object.keys(settings.config.environments).join('|')),
			result = apiKey.match(regExp),
			env = utils.isArray(result) ? result.shift() : false;

        if(env && apiKey.indexOf(env) === 0) {
            config.baseUrl = settings.config.environments[env];
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
				currentAuthStatus = AuthStatus.SUCCESS;
                auth.fire(currentAuthStatus, response.message);
            } else {
				currentAuthStatus = AuthStatus.ERROR;
                auth.fire(currentAuthStatus, response.message);
            }
        } else {
			currentAuthStatus = AuthStatus.ERROR;
            auth.fire(currentAuthStatus, "An unknown error occurred");
        }

    }, {}, false, 'json');

    return auth;
};