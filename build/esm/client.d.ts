import * as jose from 'jose';
/**
 * List of defined Authentication Context Class Reference.
 */
export declare enum FiefACR {
    /**
     * Level 0. No authentication was performed, a previous session was used.
     */
    LEVEL_ZERO = "0",
    /**
     * Level 1. Password authentication was performed.
     */
    LEVEL_ONE = "1"
}
/**
 * Object containing the tokens and related information
 * returned by Fief after a successful authentication.
 */
export interface FiefTokenResponse {
    /**
     * Access token you can use to call the Fief API.
     */
    access_token: string;
    /**
     * ID token containing user information.
     */
    id_token: string;
    /**
     * Type of token, usually `bearer`.
     */
    token_type: string;
    /**
     * Number of seconds after which the tokens will expire.
     */
    expires_in: number;
    /**
     * Token provided only if scope `offline_access` was granted.
     * Allows you to retrieve fresh tokens using the {@link Fief#authRefreshToken} method.
     */
    refresh_token?: string;
}
/**
 * Object containing information about the access token.
 *
 * **Example:**
 *
 * ```json
 * {
 *     "id": "aeeb8bfa-e8f4-4724-9427-c3d5af66190e",
 *     "scope": ["openid", "required_scope"],
 *     "acr": "1",
 *     "permissions": ["castles:read", "castles:create", "castles:update", "castles:delete"],
 *     "access_token": "ACCESS_TOKEN",
 * }
 * ```
 */
export interface FiefAccessTokenInfo {
    /**
     * ID of the user.
     */
    id: string;
    /**
     * List of granted scopes for this access token.
     */
    scope: string[];
    /**
     * Level of Authentication Context class Reference.
     */
    acr: FiefACR;
    /**
     * List of [granted permissions](https://docs.fief.dev/getting-started/access-control/) for this user.
     */
    permissions: string[];
    /**
     * Access token you can use to call the Fief API.
     */
    access_token: string;
}
/**
 * Object containing user information.
 *
 *
 * **Example:**
 *
 * ```json
 * {
 *     "sub": "aeeb8bfa-e8f4-4724-9427-c3d5af66190e",
 *     "email": "anne@bretagne.duchy",
 *     "tenant_id": "c91ecb7f-359c-4244-8385-51ecd6c0d06b",
 *     "fields": {
 *         "first_name": "Anne",
 *         "last_name": "De Bretagne"
 *     }
 * }
 * ```
 */
export interface FiefUserInfo extends jose.JWTPayload {
    /**
     * ID of the user.
     */
    sub: string;
    /**
     * Email address of the user.
     */
    email: string;
    /**
     * ID of the [tenant](https://docs.fief.dev/getting-started/tenants/) associated to the user.
     */
    tenant_id: string;
    /**
     * [User fields](https://docs.fief.dev/getting-started/user-fields/) values for this user, indexed by their slug.
     */
    fields: Record<string, any>;
}
/**
 * Base Fief client error.
 */
export declare class FiefError extends Error {
}
/**
 * The request to Fief server resulted in an error.
 */
export declare class FiefRequestError extends FiefError {
    status: number;
    detail: string;
    constructor(status: number, detail: string);
}
/**
 * The access token is invalid.
 */
export declare class FiefAccessTokenInvalid extends FiefError {
}
/**
 * The access token is expired.
 */
export declare class FiefAccessTokenExpired extends FiefError {
}
/**
 * The access token is missing a required scope.
 */
export declare class FiefAccessTokenMissingScope extends FiefError {
}
/**
 * The access token doesn't meet the minimum ACR level.
 */
export declare class FiefAccessTokenACRTooLow extends FiefError {
}
/**
 * The access token is missing a required permission.
 */
export declare class FiefAccessTokenMissingPermission extends FiefError {
}
/**
 * The ID token is invalid.
 */
export declare class FiefIdTokenInvalid extends FiefError {
}
/**
 * Constructor parameters for the Fief client.
 */
export interface FiefParameters {
    /**
     * Base URL of your Fief tenant.
     */
    baseURL: string;
    /**
     * ID of your Fief client.
     */
    clientId: string;
    /**
     * Secret of your Fief client.
     *
     * It's not recommended to use it in the context of a browser app,
     * since it can be easily found by the end-user in the source code.
     * The recommended way is to use a [Public client](https://docs.fief.dev/getting-started/clients/#public-clients).
     */
    clientSecret?: string;
    /**
     * Encryption key of your Fief client.
     * Necessary only if ID Token encryption is enabled.
     *
     * @see [ID Token encryption](https://docs.fief.dev/going-further/id-token-encryption/)
     */
    encryptionKey?: string;
    /**
     * Additional fetch init options for `getOpenIDConfiguration` and `getJWKS` requests.
     *
     * Mostly useful to control fetch cache.
     *
     * @see [fetch cache property](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache)
     * @see [Next.js fetch](https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options)
     */
    requestInit?: RequestInit;
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
export declare class Fief {
    private baseURL;
    private clientId;
    private clientSecret?;
    private encryptionKey?;
    private fetch;
    private requestInit?;
    private openIDConfiguration?;
    private jwks?;
    private crypto;
    constructor(parameters: FiefParameters);
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
    getAuthURL(parameters: {
        redirectURI: string;
        state?: string;
        scope?: string[];
        codeChallenge?: string;
        codeChallengeMethod?: 'plain' | 'S256';
        lang?: string;
        extrasParams?: Record<string, string>;
    }): Promise<string>;
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
    authCallback(code: string, redirectURI: string, codeVerifier?: string, requestInit?: RequestInit): Promise<[FiefTokenResponse, FiefUserInfo]>;
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
    authRefreshToken(refreshToken: string, scope?: string[], requestInit?: RequestInit): Promise<[FiefTokenResponse, FiefUserInfo]>;
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
    validateAccessToken(accessToken: string, requiredScopes?: string[], requiredACR?: FiefACR, requiredPermissions?: string[]): Promise<FiefAccessTokenInfo>;
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
    userinfo(accessToken: string, requestInit?: RequestInit): Promise<FiefUserInfo>;
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
    updateProfile(accessToken: string, data: Record<string, any>, requestInit?: RequestInit): Promise<FiefUserInfo>;
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
    changePassword(accessToken: string, newPassword: string, requestInit?: RequestInit): Promise<FiefUserInfo>;
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
    emailChange(accessToken: string, email: string, requestInit?: RequestInit): Promise<FiefUserInfo>;
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
    emailVerify(accessToken: string, code: string, requestInit?: RequestInit): Promise<FiefUserInfo>;
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
    getLogoutURL(parameters: {
        redirectURI: string;
    }): Promise<string>;
    private getOpenIDConfiguration;
    private getJWKS;
    private decodeIDToken;
    private static handleRequestError;
}
