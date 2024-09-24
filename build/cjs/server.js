'use strict';

var tslib_es6 = require('./node_modules/tslib/tslib.es6.js');
var client = require('./client.js');

class FiefAuthError extends client.FiefError {
}
class FiefAuthUnauthorized extends FiefAuthError {
}
class FiefAuthForbidden extends FiefAuthError {
}
/**
 * Class implementing common logic for authenticating requests in NodeJS servers.
 */
let FiefAuth$1 = class FiefAuth {
    /**
     * @param client - Instance of a {@link Fief} client.
     * @param tokenGetter - A {@link TokenGetter} function.
     * @param userInfoCache - An instance of a {@link IUserInfoCache} class.
     */
    constructor(client, tokenGetter, userInfoCache) {
        this.client = client;
        this.tokenGetter = tokenGetter;
        this.userInfoCache = userInfoCache;
    }
    /**
     * Factory to generate handler for authenticating NodeJS requests.
     *
     * @param parameters - Parameters to apply when authenticating the request.
     *
     * @returns A handler to authenticate NodeJS requests.
     */
    authenticate(parameters) {
        return (req) => tslib_es6.__awaiter(this, void 0, void 0, function* () {
            const { optional, scope, acr, permissions, refresh, } = parameters;
            const token = yield this.tokenGetter(req);
            if (token === null && optional !== true) {
                throw new FiefAuthUnauthorized();
            }
            let accessTokenInfo = null;
            let user = null;
            if (token !== null) {
                try {
                    accessTokenInfo = yield this.client.validateAccessToken(token, scope, acr, permissions);
                    if (this.userInfoCache) {
                        user = yield this.userInfoCache.get(accessTokenInfo.id);
                        if (user === null || refresh === true) {
                            user = yield this.client.userinfo(accessTokenInfo.access_token);
                            yield this.userInfoCache.set(accessTokenInfo.id, user);
                        }
                    }
                }
                catch (err) {
                    if (!optional
                        && (err instanceof client.FiefAccessTokenInvalid || err instanceof client.FiefAccessTokenExpired)) {
                        throw new FiefAuthUnauthorized();
                    }
                    else if (err instanceof client.FiefAccessTokenMissingScope
                        || err instanceof client.FiefAccessTokenACRTooLow
                        || err instanceof client.FiefAccessTokenMissingPermission) {
                        throw new FiefAuthForbidden();
                    }
                    else {
                        throw err;
                    }
                }
            }
            return { accessTokenInfo, user };
        });
    }
};
/**
 * Return a {@link TokenGetter} function retrieving a token
 * from the `Authorization` header of an HTTP request
 * with the specified scheme.
 *
 * @param scheme - Scheme of the token. Defaults to `bearer`.
 *
 * @returns A {@link TokenGetter} function.
 */
const authorizationSchemeGetter = (scheme = 'bearer') => (req) => tslib_es6.__awaiter(void 0, void 0, void 0, function* () {
    const { authorization } = req.headers;
    if (authorization === undefined) {
        return null;
    }
    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== scheme) {
        return null;
    }
    return parts[1];
});
/**
 * Return a {@link TokenGetter} function retrieving a token
 * from a `Cookie` of an HTTP request.
 *
 * @param cookieName - Name of the cookie.
 *
 * @returns A {@link TokenGetter} function.
 */
const cookieGetter = (cookieName) => (req) => tslib_es6.__awaiter(void 0, void 0, void 0, function* () {
    const { cookie: cookieHeader } = req.headers;
    if (cookieHeader === undefined) {
        return null;
    }
    const cookies = cookieHeader.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
        const cookie = cookies[i].trim();
        const semicolonIndex = cookie.indexOf('=');
        const name = cookie.slice(0, semicolonIndex);
        const value = cookie.slice(semicolonIndex + 1);
        if (name === cookieName) {
            return value;
        }
    }
    return null;
});

exports.FiefAuth = FiefAuth$1;
exports.FiefAuthError = FiefAuthError;
exports.FiefAuthForbidden = FiefAuthForbidden;
exports.FiefAuthUnauthorized = FiefAuthUnauthorized;
exports.authorizationSchemeGetter = authorizationSchemeGetter;
exports.cookieGetter = cookieGetter;
//# sourceMappingURL=server.js.map
