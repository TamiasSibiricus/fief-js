import { __awaiter } from './node_modules/tslib/tslib.es6.js';
import * as jose from 'jose';
import { getCrypto } from './crypto/index.js';
import { getFetch } from './fetch/index.js';

const serializeQueryString = (object) => {
    const elements = [];
    Object.keys(object).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            elements.push(`${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`);
        }
    });
    return elements.join('&');
};
/**
 * List of defined Authentication Context Class Reference.
 */
// eslint-disable-next-line no-shadow
var FiefACR;
(function (FiefACR) {
    /**
     * Level 0. No authentication was performed, a previous session was used.
     */
    FiefACR["LEVEL_ZERO"] = "0";
    /**
     * Level 1. Password authentication was performed.
     */
    FiefACR["LEVEL_ONE"] = "1";
})(FiefACR || (FiefACR = {}));
const ACR_LEVELS_ORDER = [FiefACR.LEVEL_ZERO, FiefACR.LEVEL_ONE];
const compareACR = (a, b) => (ACR_LEVELS_ORDER.findIndex((acr) => acr === a) - ACR_LEVELS_ORDER.findIndex((acr) => acr === b));
/**
 * Base Fief client error.
 */
class FiefError extends Error {
}
/**
 * The request to Fief server resulted in an error.
 */
class FiefRequestError extends FiefError {
    constructor(status, detail) {
        super(`[${status}] - ${detail}`);
        this.status = status;
        this.detail = detail;
    }
}
/**
 * The access token is invalid.
 */
class FiefAccessTokenInvalid extends FiefError {
}
/**
 * The access token is expired.
 */
class FiefAccessTokenExpired extends FiefError {
}
/**
 * The access token is missing a required scope.
 */
class FiefAccessTokenMissingScope extends FiefError {
}
/**
 * The access token doesn't meet the minimum ACR level.
 */
class FiefAccessTokenACRTooLow extends FiefError {
}
/**
 * The access token is missing a required permission.
 */
class FiefAccessTokenMissingPermission extends FiefError {
}
/**
 * The ID token is invalid.
 */
class FiefIdTokenInvalid extends FiefError {
}
/**
 * Fief authentication client.
 *
 * @example
 * ```ts
 *  const fief = new Fief({
 *   baseURL: 'https://example.fief.dev',
 *   clientId: 'YOUR_CLIENT_ID',
 *   clientSecret: 'YOUR_CLIENT_SECRET',
 * });
 * ```
 */
class Fief {
    constructor(parameters) {
        this.baseURL = parameters.baseURL;
        this.clientId = parameters.clientId;
        this.clientSecret = parameters.clientSecret;
        if (parameters.encryptionKey !== undefined) {
            jose
                .importJWK(JSON.parse(parameters.encryptionKey), 'RSA-OAEP-256')
                .then((encryptionKey) => {
                this.encryptionKey = encryptionKey;
            });
        }
        this.fetch = getFetch();
        this.requestInit = parameters.requestInit;
        this.crypto = getCrypto();
    }
    /**
     * Return an authorization URL.
     *
     * @param parameters.redirectURI - Your callback URI where the user
     * will be redirected after Fief authentication.
     * @param parameters.state - Optional string that will be returned back
     * in the callback parameters to allow you to retrieve state information.
     * @param parameters.scope - Optional list of scopes to ask for.
     * @param parameters.codeChallenge - Optional code challenge for [PKCE process](https://docs.fief.dev/going-further/pkce/).
     * @param parameters.codeChallengeMethod - Method used to hash the PKCE code challenge.
     * @param parameters.lang - Optional parameter to set the user locale.
     * Should be a valid [RFC 3066](https://www.rfc-editor.org/rfc/rfc3066) language identifier, like `fr` or `pt-PT`.
     * @param parameters.extrasParams - Optional object containing [specific parameters](https://docs.fief.dev/going-further/authorize-url/).
     *
     * @returns The authorization URL.
     *
     * @example
     * ```ts
     * const authURL = await fief.getAuthURL({
     *     redirectURI: 'http://localhost:8000/callback',
     *     scope: ['openid'],
     * );
     * ```
     */
    getAuthURL(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const openIDConfiguration = yield this.getOpenIDConfiguration();
            const { redirectURI, state, scope, codeChallenge, codeChallengeMethod, lang, extrasParams, } = parameters;
            const redirectURIParams = new URLSearchParams(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ response_type: 'code', client_id: this.clientId, redirect_uri: redirectURI }, state ? { state } : {}), codeChallenge ? { code_challenge: codeChallenge } : {}), codeChallengeMethod ? { code_challenge_method: codeChallengeMethod } : {}), state ? { state } : {}), scope ? { scope: scope.join(' ') } : {}), lang ? { lang } : {}), extrasParams ? Object.assign({}, extrasParams) : {}));
            const authorizationEndpoint = openIDConfiguration.authorization_endpoint;
            return `${authorizationEndpoint}?${redirectURIParams.toString()}`;
        });
    }
    /**
     * Return a {@link FiefTokenResponse} and {@link FiefUserInfo}
     * in exchange of an authorization code.
     *
     * @param code - The authorization code.
     * @param redirectURI - The exact same `redirectURI` you passed to the authorization URL.
     * @param codeVerifier - The raw [PKCE](https://docs.fief.dev/going-further/pkce/) code
     * used to generate the code challenge during authorization.
     * @param requestInit - Additional fetch init options. Mostly useful to control fetch cache.
     *
     * @returns A token response and user information.
     *
     * @example
     * ```ts
     * const [tokens, userinfo] = await fief.authCallback('CODE', 'http://localhost:8000/callback');
     * ```
     */
    authCallback(code, redirectURI, codeVerifier, requestInit) {
        return __awaiter(this, void 0, void 0, function* () {
            const openIDConfiguration = yield this.getOpenIDConfiguration();
            const payload = serializeQueryString(Object.assign(Object.assign({ grant_type: 'authorization_code', client_id: this.clientId, code, redirect_uri: redirectURI }, this.clientSecret ? { client_secret: this.clientSecret } : {}), codeVerifier ? { code_verifier: codeVerifier } : {}));
            const response = yield this.fetch(openIDConfiguration.token_endpoint, Object.assign(Object.assign({}, requestInit || {}), { method: 'POST', body: payload, headers: Object.assign(Object.assign({}, requestInit && requestInit.headers ? requestInit.headers : {}), { 'Content-Type': 'application/x-www-form-urlencoded' }) }));
            yield Fief.handleRequestError(response);
            const data = yield response.json();
            const userinfo = yield this.decodeIDToken({
                idToken: data.id_token,
                jwks: yield this.getJWKS(),
                code,
                accessToken: data.access_token,
            });
            return [data, userinfo];
        });
    }
    /**
     * Return fresh {@link FiefTokenResponse} and {@link FiefUserInfo} in exchange of a refresh token.
     *
     * @param refreshToken - A valid refresh token.
     * @param scope - Optional list of scopes to ask for.
     * If not provided, the access token will share the same list of scopes
     * as requested the first time.
     * Otherwise, it should be a subset of the original list of scopes.
     * @param requestInit - Additional fetch init options. Mostly useful to control fetch cache.
     *
     * @returns A token response and user information.
     *
     * @example
     * ```ts
     * const [tokens, userinfo] = await fief.authRefreshToken('REFRESH_TOKEN');
     * ```
     */
    authRefreshToken(refreshToken, scope, requestInit) {
        return __awaiter(this, void 0, void 0, function* () {
            const openIDConfiguration = yield this.getOpenIDConfiguration();
            const payload = serializeQueryString(Object.assign({ grant_type: 'refresh_token', client_id: this.clientId, refresh_token: refreshToken }, scope ? { scope: scope.join(' ') } : {}));
            const response = yield this.fetch(openIDConfiguration.token_endpoint, Object.assign(Object.assign({}, requestInit || {}), { method: 'POST', body: payload, headers: Object.assign(Object.assign({}, requestInit && requestInit.headers ? requestInit.headers : {}), { 'Content-Type': 'application/x-www-form-urlencoded' }) }));
            yield Fief.handleRequestError(response);
            const data = yield response.json();
            const userinfo = yield this.decodeIDToken({
                idToken: data.id_token,
                jwks: yield this.getJWKS(),
                accessToken: data.access_token,
            });
            return [data, userinfo];
        });
    }
    /**
     * Check if an access token is valid and optionally that it has a required list of scopes,
     * or a required list of [permissions](https://docs.fief.dev/getting-started/access-control/).
     *
     * @param accessToken - The access token to validate.
     * @param requiredScopes - Optional list of scopes to check for.
     * @param requiredACR - Optional minimum ACR level required. Read more: https://docs.fief.dev/going-further/acr/
     * @param requiredPermissions - Optional list of permissions to check for.
     * @param requestInit - Additional fetch init options. Mostly useful to control fetch cache.
     *
     * @returns {@link FiefAccessTokenInfo}
     * @throws {@link FiefAccessTokenInvalid} if the access token is invalid.
     * @throws {@link FiefAccessTokenExpired} if the access token is expired.
     * @throws {@link FiefAccessTokenMissingScope} if a scope is missing.
     * @throws {@link FiefAccessTokenMissingPermission} if a permission is missing.
     *
     * @example
     * ```ts
     * try {
     *     accessTokenInfo = await fief.validateAccessToken('ACCESS_TOKEN', ['required_scope']);
     *     console.log(accessTokenInfo);
     * } catch (err) {
     *     if (err instanceof FiefAccessTokenInvalid) {
     *         console.error('Invalid access token');
     *     } else if (err instanceof FiefAccessTokenExpired) {
     *         console.error('Expired access token');
     *     } else if (err instanceof FiefAccessTokenMissingScope) {
     *         console.error('Missing required scope');
     *     }
     * }
     * ```
     */
    validateAccessToken(accessToken, requiredScopes, requiredACR, requiredPermissions) {
        return __awaiter(this, void 0, void 0, function* () {
            const signatureKeys = jose.createLocalJWKSet(yield this.getJWKS());
            try {
                const { payload: claims } = yield jose.jwtVerify(accessToken, signatureKeys);
                const scope = claims.scope;
                if (scope === undefined) {
                    throw new FiefAccessTokenInvalid();
                }
                const accessTokenScopes = scope.split(' ');
                if (requiredScopes) {
                    requiredScopes.forEach((requiredScope) => {
                        const inAccessTokenScopes = accessTokenScopes.some((accessTokenScope) => accessTokenScope === requiredScope);
                        if (!inAccessTokenScopes) {
                            throw new FiefAccessTokenMissingScope();
                        }
                    });
                }
                const acr = claims.acr;
                if (acr === undefined || !Object.values(FiefACR).includes(acr)) {
                    throw new FiefAccessTokenInvalid();
                }
                if (requiredACR) {
                    if (compareACR(acr, requiredACR) < 0) {
                        throw new FiefAccessTokenACRTooLow();
                    }
                }
                const permissions = claims.permissions;
                if (permissions === undefined) {
                    throw new FiefAccessTokenInvalid();
                }
                if (requiredPermissions) {
                    requiredPermissions.forEach((requiredPermission) => {
                        const inAccessTokenPermissions = permissions.some((permission) => permission === requiredPermission);
                        if (!inAccessTokenPermissions) {
                            throw new FiefAccessTokenMissingPermission();
                        }
                    });
                }
                return {
                    id: claims.sub,
                    scope: accessTokenScopes,
                    acr,
                    permissions,
                    access_token: accessToken,
                };
            }
            catch (err) {
                if (err instanceof jose.errors.JWTExpired) {
                    throw new FiefAccessTokenExpired();
                }
                else if (err instanceof jose.errors.JOSEError) {
                    throw new FiefAccessTokenInvalid();
                }
                throw err;
            }
        });
    }
    /**
     * Return fresh {@link FiefUserInfo} from the Fief API using a valid access token.
     *
     * @param accessToken - A valid access token.
     * @param requestInit - Additional fetch init options. Mostly useful to control fetch cache.
     *
     * @returns Fresh user information.
     *
     * @example
     * ```ts
     * userinfo = await fief.userinfo('ACCESS_TOKEN');
     * ```
     */
    userinfo(accessToken, requestInit) {
        return __awaiter(this, void 0, void 0, function* () {
            const openIDConfiguration = yield this.getOpenIDConfiguration();
            const response = yield this.fetch(openIDConfiguration.userinfo_endpoint, Object.assign(Object.assign({}, requestInit || {}), { method: 'GET', headers: Object.assign(Object.assign({}, requestInit && requestInit.headers ? requestInit.headers : {}), { Authorization: `Bearer ${accessToken}` }) }));
            yield Fief.handleRequestError(response);
            const data = yield response.json();
            return data;
        });
    }
    /**
     * Updates user information with the Fief API using a valid access token.
     *
     * @param accessToken - A valid access token.
     * @param data - An object containing the data to update.
     * @param requestInit - Additional fetch init options. Mostly useful to control fetch cache.
     *
     * @returns Updated user information.
     *
     * @example
     * To update [user field](https://docs.fief.dev/getting-started/user-fields/) values,
     * you need to nest them into a `fields` object, indexed by their slug.
     * ```ts
     * userinfo = await fief.update_profile('ACCESS_TOKEN', { fields: { first_name: 'Anne' } })
     * ```
     */
    updateProfile(accessToken, data, requestInit) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateProfileEndpoint = `${this.baseURL}/api/profile`;
            const response = yield this.fetch(updateProfileEndpoint, Object.assign(Object.assign({}, requestInit || {}), { method: 'PATCH', body: JSON.stringify(data), headers: Object.assign(Object.assign({}, requestInit && requestInit.headers ? requestInit.headers : {}), { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }) }));
            yield Fief.handleRequestError(response);
            const userinfo = yield response.json();
            return userinfo;
        });
    }
    /**
     * Changes the user password with the Fief API using a valid access token.
     *
     * **An access token with an ACR of at least level 1 is required.**
     *
     * @param accessToken - A valid access token.
     * @param newPassword - The new password.
     * @param requestInit - Additional fetch init options. Mostly useful to control fetch cache.
     *
     * @returns Updated user information.
     *
     * @example
     * ```ts
     * userinfo = await fief.changePassword('ACCESS_TOKEN', 'herminetincture')
     * ```
     */
    changePassword(accessToken, newPassword, requestInit) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateProfileEndpoint = `${this.baseURL}/api/password`;
            const response = yield this.fetch(updateProfileEndpoint, Object.assign(Object.assign({}, requestInit || {}), { method: 'PATCH', body: JSON.stringify({ password: newPassword }), headers: Object.assign(Object.assign({}, requestInit && requestInit.headers ? requestInit.headers : {}), { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }) }));
            yield Fief.handleRequestError(response);
            const userinfo = yield response.json();
            return userinfo;
        });
    }
    /**
     * Requests an email change with the Fief API using a valid access token.
     *
     * The user will receive a verification code on this new email address.
     * It shall be used with the method {@link emailVerify} to complete the modification.
     *
     * **An access token with an ACR of at least level 1 is required.**
     *
     * @param accessToken - A valid access token.
     * @param newPassword - The new email address.
     * @param requestInit - Additional fetch init options. Mostly useful to control fetch cache.
     *
     * @returns Updated user information.
     *
     * @example
     * ```ts
     * userinfo = await fief.emailChange('ACCESS_TOKEN', 'anne@nantes.city')
     * ```
     */
    emailChange(accessToken, email, requestInit) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateProfileEndpoint = `${this.baseURL}/api/email/change`;
            const response = yield this.fetch(updateProfileEndpoint, Object.assign(Object.assign({}, requestInit || {}), { method: 'PATCH', body: JSON.stringify({ email }), headers: Object.assign(Object.assign({}, requestInit && requestInit.headers ? requestInit.headers : {}), { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }) }));
            yield Fief.handleRequestError(response);
            const userinfo = yield response.json();
            return userinfo;
        });
    }
    /**
     * Verifies the user email with the Fief API using a valid access token and verification code.
     *
     *
     * **An access token with an ACR of at least level 1 is required.**
     *
     * @param accessToken - A valid access token.
     * @param newPassword - The new email address.
     * @param requestInit - Additional fetch init options. Mostly useful to control fetch cache.
     *
     * @returns Updated user information.
     *
     * @example
     * ```ts
     * userinfo = await fief.emailVerify('ACCESS_TOKEN', 'ABCDE')
     * ```
     */
    emailVerify(accessToken, code, requestInit) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateProfileEndpoint = `${this.baseURL}/api/email/verify`;
            const response = yield this.fetch(updateProfileEndpoint, Object.assign(Object.assign({}, requestInit || {}), { method: 'POST', body: JSON.stringify({ code }), headers: Object.assign(Object.assign({}, requestInit && requestInit.headers ? requestInit.headers : {}), { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }) }));
            yield Fief.handleRequestError(response);
            const userinfo = yield response.json();
            return userinfo;
        });
    }
    /**
     * Returns a logout URL.
     * If you redirect the user to this page, Fief will clear the session stored on its side.
     *
     * **You're still responsible for clearing your own session mechanism if any.**
     *
     * @param parameters.redirectURI - A valid URL where the user will be
     * redirected after the logout process.
     *
     * @returns The logout URL.
     *
     * @example
     * ```ts
     * const logoutURL = await fief.getLogoutURL({
     *    redirectURI: 'http://localhost:8000',
     * });
     * ```
     */
    getLogoutURL(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = new URLSearchParams({
                redirect_uri: parameters.redirectURI,
            });
            return `${this.baseURL}/logout?${params.toString()}`;
        });
    }
    getOpenIDConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.openIDConfiguration !== undefined) {
                return this.openIDConfiguration;
            }
            const response = yield this.fetch(`${this.baseURL}/.well-known/openid-configuration`, Object.assign(Object.assign({}, this.requestInit || {}), { method: 'GET' }));
            yield Fief.handleRequestError(response);
            const data = response.json();
            this.openIDConfiguration = data;
            return data;
        });
    }
    getJWKS() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.jwks !== undefined) {
                return this.jwks;
            }
            const openIDConfiguration = yield this.getOpenIDConfiguration();
            const response = yield this.fetch(openIDConfiguration.jwks_uri, Object.assign(Object.assign({}, this.requestInit || {}), { method: 'GET' }));
            yield Fief.handleRequestError(response);
            const data = yield response.json();
            this.jwks = data;
            return data;
        });
    }
    decodeIDToken(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { idToken, jwks, code, accessToken, } = parameters;
            const signatureKeys = jose.createLocalJWKSet(jwks);
            try {
                let signedToken = idToken;
                if (this.encryptionKey !== undefined) {
                    const { plaintext } = yield jose.compactDecrypt(idToken, this.encryptionKey);
                    signedToken = plaintext;
                }
                const { payload: claims } = yield jose.jwtVerify(signedToken, signatureKeys);
                if (claims.c_hash !== undefined) {
                    if (!code || !(yield this.crypto.isValidHash(code, claims.c_hash))) {
                        throw new FiefIdTokenInvalid();
                    }
                }
                if (claims.at_hash !== undefined) {
                    if (!accessToken
                        || !(yield this.crypto.isValidHash(accessToken, claims.at_hash))) {
                        throw new FiefIdTokenInvalid();
                    }
                }
                return claims;
            }
            catch (err) {
                if (err instanceof jose.errors.JOSEError) {
                    throw new FiefIdTokenInvalid();
                }
                throw err;
            }
        });
    }
    static handleRequestError(response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (response.status < 200 || response.status > 299) {
                const detail = yield response.text();
                throw new FiefRequestError(response.status, detail);
            }
        });
    }
}

export { Fief, FiefACR, FiefAccessTokenACRTooLow, FiefAccessTokenExpired, FiefAccessTokenInvalid, FiefAccessTokenMissingPermission, FiefAccessTokenMissingScope, FiefError, FiefIdTokenInvalid, FiefRequestError };
//# sourceMappingURL=client.js.map
