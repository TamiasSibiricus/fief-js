/**
 * Browser integration.
 *
 * @module
 */
import { Fief, FiefTokenResponse, FiefUserInfo } from './client';
/**
 * Interface that should follow a class to implement storage for authentication data.
 */
export interface IFiefAuthStorage {
    /**
     * Retrieve current user information from storage, if available.
     */
    getUserinfo(): FiefUserInfo | null;
    /**
     * Store current user information in storage.
     *
     * @param userinfo - The user information to store.
     */
    setUserinfo(userinfo: FiefUserInfo): void;
    /**
     * Remove current user information from storage.
     */
    clearUserinfo(): void;
    /**
     * Retrieve current token information from storage, if available.
     */
    getTokenInfo(): FiefTokenResponse | null;
    /**
     * Store current token information in storage.
     *
     * @param tokenInfo - The token information to store.
     */
    setTokenInfo(tokenInfo: FiefTokenResponse): void;
    /**
     * Remove current token information from storage.
     */
    clearTokeninfo(): void;
    /**
     * Retrieve PKCE code verifier from storage, if any.
     *
     * @see [PKCE](https://docs.fief.dev/going-further/pkce/)
     */
    getCodeVerifier(): string | null;
    /**
     * Set a PKCE code verifier in storage.
     *
     * @param code - The code verifier to store.
     *
     * @see [PKCE](https://docs.fief.dev/going-further/pkce/)
     */
    setCodeVerifier(code: string): void;
    /**
     * Remove PKCE code verifier from storage.
     *
     * @see [PKCE](https://docs.fief.dev/going-further/pkce/)
     */
    clearCodeVerifier(): void;
}
export declare class FiefAuthError extends Error {
}
export declare class FiefAuthAuthorizeError extends FiefAuthError {
    error: string;
    description: string | null;
    constructor(error: string, description?: string | null);
}
export declare class FiefAuthNotAuthenticatedError extends FiefAuthError {
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
export declare class FiefAuth {
    private client;
    private storage;
    private crypto;
    private pendingAuthCallbacks;
    /**
     * @param client - Instance of a {@link Fief} client.
     */
    constructor(client: Fief, storage?: IFiefAuthStorage);
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
    isAuthenticated(): boolean;
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
    getUserinfo(): FiefUserInfo | null;
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
    getTokenInfo(): FiefTokenResponse | null;
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
    redirectToLogin(redirectURI: string, parameters?: {
        state?: string;
        scope?: string[];
        lang?: string;
        extrasParams?: Record<string, string>;
    }): Promise<void>;
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
    authCallback(redirectURI: string): Promise<void>;
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
    refreshUserinfo(): Promise<FiefUserInfo>;
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
    logout(redirectURI: string): Promise<void>;
}
