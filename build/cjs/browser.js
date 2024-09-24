'use strict';

var tslib_es6 = require('./node_modules/tslib/tslib.es6.js');
var index = require('./crypto/index.js');

/**
 * Browser integration.
 *
 * @module
 */
/**
 * Implementation of an authentication storage using standard browser `sessionStorage`.
 *
 * @see [Window.sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
 */
class FiefAuthStorage {
    constructor() {
        this.storage = window.sessionStorage;
    }
    getUserinfo() {
        const value = this.storage.getItem(FiefAuthStorage.USERINFO_STORAGE_KEY);
        if (!value) {
            return null;
        }
        return JSON.parse(value);
    }
    setUserinfo(userinfo) {
        this.storage.setItem(FiefAuthStorage.USERINFO_STORAGE_KEY, JSON.stringify(userinfo));
    }
    clearUserinfo() {
        this.storage.removeItem(FiefAuthStorage.USERINFO_STORAGE_KEY);
    }
    getTokenInfo() {
        const value = this.storage.getItem(FiefAuthStorage.TOKEN_INFO_STORAGE_KEY);
        if (!value) {
            return null;
        }
        return JSON.parse(value);
    }
    setTokenInfo(tokenInfo) {
        this.storage.setItem(FiefAuthStorage.TOKEN_INFO_STORAGE_KEY, JSON.stringify(tokenInfo));
    }
    clearTokeninfo() {
        this.storage.removeItem(FiefAuthStorage.TOKEN_INFO_STORAGE_KEY);
    }
    getCodeVerifier() {
        const value = this.storage.getItem(FiefAuthStorage.CODE_VERIFIER_STORAGE_KEY);
        if (!value) {
            return null;
        }
        return value;
    }
    setCodeVerifier(code) {
        this.storage.setItem(FiefAuthStorage.CODE_VERIFIER_STORAGE_KEY, code);
    }
    clearCodeVerifier() {
        this.storage.removeItem(FiefAuthStorage.CODE_VERIFIER_STORAGE_KEY);
    }
}
FiefAuthStorage.USERINFO_STORAGE_KEY = 'fief-userinfo';
FiefAuthStorage.TOKEN_INFO_STORAGE_KEY = 'fief-tokeninfo';
FiefAuthStorage.CODE_VERIFIER_STORAGE_KEY = 'fief-codeverifier';
class FiefAuthError extends Error {
}
class FiefAuthAuthorizeError extends FiefAuthError {
    constructor(error, description = null) {
        super();
        this.error = error;
        this.description = description;
    }
}
class FiefAuthNotAuthenticatedError extends FiefAuthError {
}
/**
 * Helper class to integrate Fief authentication in a browser application.
 *
 * @example
 * ```ts
 * const fiefClient = new fief.Fief({
 *     baseURL: 'https://example.fief.dev',
 *     clientId: 'YOUR_CLIENT_ID',
 * });
 * const fiefAuth = new fief.browser.FiefAuth(fiefClient);
 * ```
 */
class FiefAuth {
    /**
     * @param client - Instance of a {@link Fief} client.
     */
    constructor(client, storage) {
        this.client = client;
        if (storage !== undefined) {
            this.storage = storage;
        }
        else {
            this.storage = new FiefAuthStorage();
        }
        this.crypto = index.getCrypto();
        this.pendingAuthCallbacks = new Set();
    }
    /**
     * Return whether there is a valid user session in the browser.
     *
     * @returns `true` if there is a valid user session, `false` otherwise.
     *
     * @example
     * ```ts
     * const isAuthenticated = fiefAuth.isAuthenticated();
     * ```
     */
    isAuthenticated() {
        return this.storage.getTokenInfo() !== null;
    }
    /**
     * Return the user information object available in session, or `null` if no current session.
     *
     * @returns The user information, or null if not available.
     *
     * @example
     * ```ts
     * const userinfo = fiefAuth.getUserinfo();
     * ````
     */
    getUserinfo() {
        return this.storage.getUserinfo();
    }
    /**
     * Return the token information object available in session, or `null` if no current session.
     *
     * @returns The token information, or null if not available.
     *
     * @example
     * ```ts
     * const tokenInfo = fiefAuth.getTokenInfo();
     * ```
     */
    getTokenInfo() {
        return this.storage.getTokenInfo();
    }
    /**
     * Start a Fief authorization process and perform the redirection.
     *
     * Under the hood, it automatically handles
     * the [PKCE code challenge](https://docs.fief.dev/going-further/pkce/).
     *
     * @param redirectURI - Your callback URI where the user
     * will be redirected after Fief authentication.
     * @param parameters.state - Optional string that will be returned back
     * in the callback parameters to allow you to retrieve state information.
     * @param parameters.scope - Optional list of scopes to ask for. Defaults to `['openid']`.
     * @param parameters.lang - Optional parameter to set the user locale.
     * Should be a valid [RFC 3066](https://www.rfc-editor.org/rfc/rfc3066) language identifier, like `fr` or `pt-PT`.
     * @param parameters.extrasParams - Optional object containing [specific parameters](https://docs.fief.dev/going-further/authorize-url/).
     *
     * @example
     * ```ts
     * fiefAuth.redirectToLogin('http://localhost:8080/callback.html');
     * ```
     *
     * @example
     * Set the user locale.
     * ```ts
     * fiefAuth.redirectToLogin('http://localhost:8080/callback.html', { lang: 'fr-FR' });
     * ```
     */
    redirectToLogin(redirectURI, parameters) {
        return tslib_es6.__awaiter(this, void 0, void 0, function* () {
            const codeVerifier = yield this.crypto.generateCodeVerifier();
            const codeChallenge = yield this.crypto.getCodeChallenge(codeVerifier, 'S256');
            this.storage.setCodeVerifier(codeVerifier);
            const authorizeURL = yield this.client.getAuthURL(Object.assign(Object.assign(Object.assign({ redirectURI, scope: (parameters === null || parameters === void 0 ? void 0 : parameters.scope) || ['openid'], codeChallenge, codeChallengeMethod: 'S256' }, (parameters === null || parameters === void 0 ? void 0 : parameters.state) ? { state: parameters.state } : {}), (parameters === null || parameters === void 0 ? void 0 : parameters.state) ? { lang: parameters.lang } : {}), (parameters === null || parameters === void 0 ? void 0 : parameters.extrasParams) ? { extrasParams: parameters.extrasParams } : {}));
            window.location.href = authorizeURL;
        });
    }
    /**
     * Complete the Fief authentication process by exchanging
     * the authorization code available in query parameters
     * and store the tokens and user information in the browser session.
     *
     * Under the hood, it automatically handles
     * the [PKCE code challenge](https://docs.fief.dev/going-further/pkce/).
     *
     * @param redirectURI - The exact same `redirectURI` you passed to the authorization URL.
     */
    authCallback(redirectURI) {
        return tslib_es6.__awaiter(this, void 0, void 0, function* () {
            const params = new URLSearchParams(window.location.search);
            const error = params.get('error');
            const errorDescription = params.get('error_description');
            const code = params.get('code');
            if (error !== null) {
                throw new FiefAuthAuthorizeError(error, errorDescription);
            }
            else if (code === null) {
                throw new FiefAuthAuthorizeError('missing_code');
            }
            // Prevent authCallback request to be triggered twice with the same code.
            // Useful for frameworks like React which tends to re-render agressively.
            if (this.pendingAuthCallbacks.has(code)) {
                return;
            }
            const codeVerifier = this.storage.getCodeVerifier();
            this.storage.clearCodeVerifier();
            this.pendingAuthCallbacks.add(code);
            const [tokenResponse, userinfo] = yield this.client.authCallback(code, redirectURI, codeVerifier || undefined);
            this.pendingAuthCallbacks.delete(code);
            this.storage.setTokenInfo(tokenResponse);
            this.storage.setUserinfo(userinfo);
        });
    }
    /**
     * Refresh user information from the Fief API using the access token available in session.
     *
     * The fresh user information is returned **and** automatically updated in the session storage.
     *
     * @returns The refreshed user information
     *
     * @example
     * ```ts
     * fiefAuth.refreshUserinfo()
     *     .then((userinfo) => {
     *         console.log(userinfo);
     *     })
     *     .catch((err) => {
     *         if (err instance of fief.browser.FiefAuthNotAuthenticatedError) {
     *             console.error('User is not logged in');
     *         }
     *     })
     * ;
     * ```
     */
    refreshUserinfo() {
        return tslib_es6.__awaiter(this, void 0, void 0, function* () {
            const tokenInfo = this.getTokenInfo();
            if (tokenInfo === null) {
                throw new FiefAuthNotAuthenticatedError();
            }
            const userinfo = yield this.client.userinfo(tokenInfo.access_token);
            this.storage.setUserinfo(userinfo);
            return userinfo;
        });
    }
    /**
     * Clear the access token and the user information from the browser storage
     * and redirect to the Fief logout endpoint.
     *
     * @param redirectURI - A valid URL where the user will be redirected after the logout process.
     *
     * @example
     * ```ts
     * fiefAuth.logout('http://localhost:8080')
     * ```
     */
    logout(redirectURI) {
        return tslib_es6.__awaiter(this, void 0, void 0, function* () {
            this.storage.clearUserinfo();
            this.storage.clearTokeninfo();
            const logoutURL = yield this.client.getLogoutURL({ redirectURI });
            window.location.href = logoutURL;
        });
    }
}

exports.FiefAuth = FiefAuth;
exports.FiefAuthAuthorizeError = FiefAuthAuthorizeError;
exports.FiefAuthError = FiefAuthError;
exports.FiefAuthNotAuthenticatedError = FiefAuthNotAuthenticatedError;
//# sourceMappingURL=browser.js.map
