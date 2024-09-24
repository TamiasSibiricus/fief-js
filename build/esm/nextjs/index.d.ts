/// <reference types="node" />
/**
 * Next.js integration.
 *
 * @module
 */
import type { IncomingMessage, OutgoingMessage } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { Fief, FiefAccessTokenInfo, FiefUserInfo } from '../client';
import { AuthenticateRequestParameters, AuthenticateRequestResult, IUserInfoCache } from '../server';
type FiefNextApiHandler<T> = (req: NextApiRequest & AuthenticateRequestResult, res: NextApiResponse<T>) => unknown | Promise<unknown>;
/**
 * Parameters to instantiate a {@link FiefAuth} helper class.
 */
export interface FiefAuthParameters {
    /**
     * Instance of a {@link Fief} client.
     */
    client: Fief;
    /**
     * Name of the cookie that will keep the session.
     */
    sessionCookieName: string;
    /**
     * Path to the login page.
     *
     * Defaults to `/login`.
     */
    loginPath?: string;
    /**
     * Absolute callback URI where the user
     * will be redirected after Fief authentication.
     *
     * **Example:** `http://localhost:3000/auth-callback`
     */
    redirectURI: string;
    /**
     * Path to the callback page where the user
     * will be redirected after Fief authentication.
     *
     * Defaults to `/auth-callback`.
     */
    redirectPath?: string;
    /**
     * Absolute callback URI where the user
     * will be redirected after Fief logout.
     *
     * **Example:** `http://localhost:3000`
     */
    logoutRedirectURI: string;
    /**
     * Path to the logout page.
     *
     * Defaults to `/logout`.
     */
    logoutPath?: string;
    /**
     * Name of the cookie that will keep the page the user
     * was trying to access while unauthenticated.
     *
     * It allows to automatically redirect the user to the page
     * they were looking for after a successul authentication.
     *
     * Defaults to `return_to`.
     */
    returnToCookieName?: string;
    /**
     * Path where the user will be redirected by default
     * after a successfull authentication if there is
     * not `returnTo` cookie.
     *
     * Defaults to `/`.
     */
    returnToDefault?: string;
    /**
     * Path of the page showing a forbidden error to the user.
     *
     * This page will be shown when the user doesn't have the required
     * scope or permissions.
     *
     * Defaults to `/forbidden`.
     */
    forbiddenPath?: string;
    /**
     * An instance of a {@link IUserInfoCache} class.
     */
    userInfoCache?: IUserInfoCache;
    /**
     * Optional API handler for unauthorized response.
     *
     * The default handler will return a plain text response with status code 401.
     */
    apiUnauthorizedResponse?: (req: IncomingMessage, res: OutgoingMessage) => Promise<void>;
    /**
     * Optional API handler for forbidden response.
     *
     * The default handler will return a plain text response with status code 403.
     */
    apiForbiddenResponse?: (req: IncomingMessage, res: OutgoingMessage) => Promise<void>;
    /**
     * Name of the request header where authenticated user ID is made available by middleware.
     *
     * Defaults to `X-FiefAuth-User-Id`.
     */
    userIdHeaderName?: string;
    /**
     * Name of the request header where access token is made available by middleware.
     *
     * Defaults to `X-FiefAuth-Access-Token`.
     */
    accessTokenHeaderName?: string;
    /**
     * Name of the request header where access token information is made available by middleware.
     *
     * Defaults to `X-FiefAuth-Access-Token-Info`.
     */
    accessTokenInfoHeaderName?: string;
}
export interface PathConfig {
    /**
     * A string to match the path.
     *
     * It follows the same syntax as Next.js paths matching.
     *
     * @see [Matching paths](https://nextjs.org/docs/advanced-features/middleware#matcher)
     */
    matcher: string;
    /**
     * Parameters to apply when authenticating the request on this matched path.
     */
    parameters: AuthenticateRequestParameters;
}
/**
 * Helper class to integrate Fief authentication with Next.js.
 *
 * @example Basic
 * ```ts
 * import { Fief, FiefUserInfo } from '@fief/fief';
 * import { FiefAuth, IUserInfoCache } from '@fief/fief/nextjs';
 *
 * export const SESSION_COOKIE_NAME = "user_session";
 *
 * const fiefClient = new fief.Fief({
 *     baseURL: 'https://example.fief.dev',
 *     clientId: 'YOUR_CLIENT_ID',
 *     clientSecret: 'YOUR_CLIENT_SECRET',
 * });
 *
 * export const fiefAuth = new FiefAuth({
 *   client: fiefClient,
 *   sessionCookieName: SESSION_COOKIE_NAME,
 *   redirectURI: 'http://localhost:3000/auth-callback',
 *   logoutRedirectURI: 'http://localhost:3000',
 *   userInfoCache: new UserInfoCache(),
 * });
 * ```
 */
declare class FiefAuth {
    private client;
    private fiefAuth;
    private fiefAuthEdge;
    private sessionCookieName;
    private loginPath;
    private redirectURI;
    private redirectPath;
    private logoutRedirectURI;
    private logoutPath;
    private returnToCookieName;
    private returnToDefault;
    private forbiddenPath;
    private apiUnauthorizedResponse;
    private apiForbiddenResponse;
    private userIdHeaderName;
    private accessTokenHeaderName;
    private accessTokenInfoHeaderName;
    constructor(parameters: FiefAuthParameters);
    /**
     * Return a Next.js middleware to control authentication on the specified paths.
     *
     * @param pathsConfig - A list of paths matchers with their authentication parameters.
     * @returns A Next.js middleware function.
     * @see [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
     *
     * @example
     * ```ts
     * import type { NextRequest } from 'next/server'
     *
     * import { fiefAuth } from './fief'
     *
     * const authMiddleware = fiefAuth.middleware([
     *   {
     *     matcher: '/private',
     *     parameters: {},
     *   },
     *   {
     *     matcher: '/app/:path*',
     *     parameters: {},
     *   },
     *   {
     *     matcher: '/scope',
     *     parameters: {
     *         scope: ['required_scope'],
     *     },
     *   },
     *   {
     *     matcher: '/acr',
     *     parameters: {
     *         acr: FiefACR.LEVEL_ONE,
     *     },
     *   },
     *   {
     *     matcher: '/permission',
     *     parameters: {
     *         permissions: ['castles:create'],
     *     },
     *   },
     * ]);
     *
     * export async function middleware(request: NextRequest) {
     *   return authMiddleware(request);
     * };
     * ```
     */
    middleware(pathsConfig: PathConfig[]): (request: NextRequest) => Promise<NextResponse>;
    /**
     * Return an API middleware to authenticate an API route.
     *
     * @param route - Your API route handler.
     * @param authenticatedParameters - Optional parameters to apply when authenticating the request.
     * @returns An API handler.
     * @see [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
     *
     * @example Basic
     * ```ts
     * import { fiefAuth } from "../../fief"
     *
     * export default fiefAuth.authenticated(function handler(req, res) {
     *     res.status(200).json(req.user);
     * });
     * ```
     *
     * @example Required scope
     * ```ts
     * import { fiefAuth } from "../../fief"
     *
     * export default fiefAuth.authenticated(function handler(req, res) {
     *     res.status(200).json(req.user);
     * }, { scope: ['required_scope'] });
     * ```
     *
     * @example Minimum ACR level
     * ```ts
     * import { fiefAuth } from "../../fief"
     *
     * export default fiefAuth.authenticated(function handler(req, res) {
     *     res.status(200).json(req.user);
     * }, { acr: FiefACR.LEVEL_ONE });
     * ```
     *
     * @example Required permissions
     * ```ts
     * import { fiefAuth } from "../../fief"
     *
     * export default fiefAuth.authenticated(function handler(req, res) {
     *     res.status(200).json(req.user);
     * }, { permissions: ['castles:create'] });
     * ```
     */
    authenticated<T>(route: FiefNextApiHandler<T>, authenticatedParameters?: AuthenticateRequestParameters): FiefNextApiHandler<T>;
    /**
     * Return an API route to get the {@link FiefUserInfo} and {@link FiefAccessTokenInfo}
     * of the currently authenticated user.
     *
     * It's mainly useful to get the user information from the React hooks.
     *
     * @returns An API route.
     *
     * @example
     * ```
     * import { fiefAuth } from '../../fief';
     *
     * export default fiefAuth.currentUser();
     * ```
     */
    currentUser(): FiefNextApiHandler<{
        userinfo: FiefUserInfo | null;
        access_token_info: FiefAccessTokenInfo | null;
    }>;
    /**
     * Return the user ID set in headers by the Fief middleware, or `null` if not authenticated.
     *
     * This function is suitable for server-side rendering in Next.js.
     *
     * @param req - Next.js request object. Required for older versions of Next.js
     * not supporting the `headers()` function.
     * @returns The user ID, or null if not available.
     */
    getUserId(req?: IncomingMessage): string | null;
    /**
     * Return the access token information set in headers by the Fief middleware,
     * or `null` if not authenticated.
     *
     * This function is suitable for server-side rendering in Next.js.
     *
     * @param req - Next.js request object. Required for older versions of Next.js
     * not supporting the `headers()` function.
     * @returns he access token information, or null if not available.
     */
    getAccessTokenInfo(req?: IncomingMessage): FiefAccessTokenInfo | null;
    /**
     * Fetch the user information object from the Fief API, if access token is available.
     *
     * This function is suitable for server-side rendering in Next.js.
     *
     * @param req - Next.js request object. Required for older versions of Next.js
     * not supporting the `headers()` function.
     * @param refresh - If `true`, the user information will be refreshed from the Fief API.
     * Otherwise, Next.js fetch cache will be used.
     * @returns The user information, or null if access token is not available.
     */
    getUserInfo(req?: IncomingMessage, refresh?: boolean): Promise<FiefUserInfo | null>;
}
export { FiefAuth, };
export type { AuthenticateRequestParameters, IUserInfoCache, };
