/// <reference types="node" />
/**
 * Common logic for NodeJS HTTP servers.
 *
 * @module
 */
import { IncomingMessage } from 'http';
import { Fief, FiefAccessTokenInfo, FiefACR, FiefError, FiefUserInfo } from './client';
export declare class FiefAuthError extends FiefError {
}
export declare class FiefAuthUnauthorized extends FiefAuthError {
}
export declare class FiefAuthForbidden extends FiefAuthError {
}
/**
 * Type of a function that can be used to retrieve an access token.
 *
 * @param req — A NodeJS request object.
 *
 * @returns An access token or `null`.
 */
export type TokenGetter<RQ> = (req: RQ) => Promise<string | null>;
/**
 * Interface that should follow a class to implement cache for user data.
 */
export interface IUserInfoCache {
    /**
     * Retrieve user information from cache, if available.
     *
     * @param id - ID of the user to retrieve the user information for.
     *
     * @returns User information or `null`.
     */
    get(id: string): Promise<FiefUserInfo | null>;
    /**
     * Store user information in cache.
     *
     * @param id - ID of the user to store user information for.
     * @param userinfo - The user information to store.
     *
     */
    set(id: string, userinfo: FiefUserInfo): Promise<void>;
    /**
     * Remove user information from cache.
     *
     * @param id - ID of the user to remove the user information for.
     *
     */
    remove(id: string): Promise<void>;
    /**
     * Clear all the user information from cache.
     */
    clear(): Promise<void>;
}
/**
 * Parameters to apply when authenticating a request.
 */
export interface AuthenticateRequestParameters {
    /**
     * If `false` and the request is not authenticated,
     * a {@link FiefAuthUnauthorized} error will be raised.
     */
    optional?: boolean;
    /**
     * Optional list of scopes required.
     * If the access token lacks one of the required scope,
     * a {@link FiefAuthForbidden} error will be raised.
     */
    scope?: string[];
    /**
     * Optional minimum ACR level required.
     * If the access token doesn't meet the minimum level,
     * a {@link FiefAccessTokenACRTooLow} error will be raised.
     */
    acr?: FiefACR;
    /**
     * Optional list of permissions required.
     * If the access token lacks one of the required permission,
     * a {@link FiefAuthForbidden} error will be raised.
     */
    permissions?: string[];
    /**
     * If `true`, the user information will be refreshed from the Fief API.
     * Otherwise, the cache will be used.
     */
    refresh?: boolean;
}
/**
 * Data returned after a request has been successfully authenticated.
 */
export interface AuthenticateRequestResult {
    /**
     * Information about the current access token.
     */
    accessTokenInfo: FiefAccessTokenInfo | null;
    /**
     * Current user information.
     */
    user: FiefUserInfo | null;
}
/**
 * Class implementing common logic for authenticating requests in NodeJS servers.
 */
export declare class FiefAuth<RQ> {
    private client;
    private tokenGetter;
    private userInfoCache?;
    /**
     * @param client - Instance of a {@link Fief} client.
     * @param tokenGetter - A {@link TokenGetter} function.
     * @param userInfoCache - An instance of a {@link IUserInfoCache} class.
     */
    constructor(client: Fief, tokenGetter: TokenGetter<RQ>, userInfoCache?: IUserInfoCache);
    /**
     * Factory to generate handler for authenticating NodeJS requests.
     *
     * @param parameters - Parameters to apply when authenticating the request.
     *
     * @returns A handler to authenticate NodeJS requests.
     */
    authenticate(parameters: AuthenticateRequestParameters): (req: RQ) => Promise<AuthenticateRequestResult>;
}
/**
 * Return a {@link TokenGetter} function retrieving a token
 * from the `Authorization` header of an HTTP request
 * with the specified scheme.
 *
 * @param scheme - Scheme of the token. Defaults to `bearer`.
 *
 * @returns A {@link TokenGetter} function.
 */
export declare const authorizationSchemeGetter: (scheme?: string) => TokenGetter<IncomingMessage>;
/**
 * Return a {@link TokenGetter} function retrieving a token
 * from a `Cookie` of an HTTP request.
 *
 * @param cookieName - Name of the cookie.
 *
 * @returns A {@link TokenGetter} function.
 */
export declare const cookieGetter: (cookieName: string) => TokenGetter<IncomingMessage>;
