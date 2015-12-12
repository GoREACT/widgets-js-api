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
 * Authorization request
 *
 * @param apiKey API Key
 * @param jwt Json Web Token
 * @returns Object
 */
exports.authorize = function(apiKey, jwt) {

	// API Key validation
	if(!apiKey) {
		throw new Error('Parameter "apiKey" is required');
	} else if(!utils.isString(apiKey)) {
		throw new Error('Parameter "apiKey" must be a string.');
	}

	// JWT validation
	if(!jwt) {
		throw new Error('Parameter "jwt" is required');
	} else if(!utils.isString(jwt)) {
		throw new Error('Parameter "jwt" must be a string.');
	}

	// set pending auth status
	currentAuthStatus = AuthStatus.PENDING;
	auth.fire(currentAuthStatus);

    // Determine base url
    if(!config.baseUrl) {

		// Determine environment using api key
		var regExp = new RegExp(Object.keys(settings.config.environments).join('|')),
			result = apiKey.match(regExp),
			env = utils.isArray(result) ? result.shift() : false;

        if(env && apiKey.indexOf(env) === 0) {
            config.baseUrl = settings.config.environments[env];
        } else {
            config.baseUrl = window.location.protocol + "//" + window.location.host;
        }
    }

    // Assemble auth url
    var url = config.baseUrl + settings.config.authEndpoint;

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

    }, {
		Authorization: 'Bearer ' + ['apiKey="' + apiKey + '"', 'jwt="' + jwt + '"'].join(', ')
	}, false, 'json');

    return auth;
};