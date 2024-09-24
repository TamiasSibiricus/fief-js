import { __awaiter } from '../node_modules/tslib/tslib.es6.js';
import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { pathToRegexp } from 'path-to-regexp';
import { FiefAuth as FiefAuth$1, cookieGetter, FiefAuthUnauthorized, FiefAuthForbidden } from '../server.js';

const defaultAPIUnauthorizedResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(401).send('Unauthorized');
});
const defaultAPIForbiddenResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(403).send('Forbidden');
});
const getServerSideHeaders = (headerName, req) => {
    // "Legacy" Next.js, req object is required
    if (req) {
        return req.headers[headerName.toLowerCase()];
    }
    // Next.js 14 style
    const headersList = headers();
    return headersList.get(headerName);
};
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
class FiefAuth {
    constructor(parameters) {
        this.client = parameters.client;
        this.fiefAuth = new FiefAuth$1(parameters.client, cookieGetter(parameters.sessionCookieName), parameters.userInfoCache);
        this.fiefAuthEdge = new FiefAuth$1(parameters.client, (request) => __awaiter(this, void 0, void 0, function* () { var _a; return ((_a = request.cookies.get(parameters.sessionCookieName)) === null || _a === void 0 ? void 0 : _a.value) || null; }));
        this.sessionCookieName = parameters.sessionCookieName;
        this.loginPath = parameters.loginPath ? parameters.loginPath : '/login';
        this.redirectURI = parameters.redirectURI;
        this.redirectPath = parameters.redirectPath ? parameters.redirectPath : '/auth-callback';
        this.logoutRedirectURI = parameters.logoutRedirectURI;
        this.logoutPath = parameters.logoutPath ? parameters.logoutPath : '/logout';
        this.returnToCookieName = parameters.returnToCookieName ? parameters.returnToCookieName : 'return_to';
        this.returnToDefault = parameters.returnToDefault ? parameters.returnToDefault : '/';
        this.forbiddenPath = parameters.forbiddenPath ? parameters.forbiddenPath : '/forbidden';
        this.apiUnauthorizedResponse = parameters.apiUnauthorizedResponse
            ? parameters.apiUnauthorizedResponse
            : defaultAPIUnauthorizedResponse;
        this.apiForbiddenResponse = parameters.apiForbiddenResponse
            ? parameters.apiForbiddenResponse
            : defaultAPIForbiddenResponse;
        this.userIdHeaderName = parameters.userIdHeaderName ? parameters.userIdHeaderName : 'X-FiefAuth-User-Id';
        this.accessTokenHeaderName = parameters.accessTokenHeaderName ? parameters.accessTokenHeaderName : 'X-FiefAuth-Access-Token';
        this.accessTokenInfoHeaderName = parameters.accessTokenInfoHeaderName ? parameters.accessTokenInfoHeaderName : 'X-FiefAuth-Access-Token-Info';
    }
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
    middleware(pathsConfig) {
        const compiledPathsAuthenticators = pathsConfig.map(({ matcher, parameters }) => ({
            matcher: pathToRegexp(matcher),
            authenticate: this.fiefAuthEdge.authenticate(parameters),
        }));
        return (request) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const isPrefetchRequest = request.headers.get('X-Middleware-Prefetch') === '1';
            // Handle login
            if (request.nextUrl.pathname === this.loginPath) {
                if (isPrefetchRequest) {
                    return new NextResponse(null, { status: 204 });
                }
                const authURL = yield this.client.getAuthURL({ redirectURI: this.redirectURI, scope: ['openid'] });
                const response = NextResponse.redirect(authURL);
                const returnTo = request.nextUrl.searchParams.get('return_to');
                if (returnTo) {
                    response.cookies.set(this.returnToCookieName, returnTo);
                }
                return response;
            }
            // Handle authentication callback
            if (request.nextUrl.pathname === this.redirectPath) {
                if (isPrefetchRequest) {
                    return new NextResponse(null, { status: 204 });
                }
                const code = request.nextUrl.searchParams.get('code');
                const [tokens] = yield this.client.authCallback(code, this.redirectURI);
                const returnTo = (_a = request.cookies.get(this.returnToCookieName)) === null || _a === void 0 ? void 0 : _a.value;
                const redirectURL = new URL(returnTo || this.returnToDefault, request.url);
                const response = NextResponse.redirect(redirectURL);
                response.cookies.set(this.sessionCookieName, tokens.access_token, {
                    maxAge: tokens.expires_in,
                    httpOnly: true,
                    secure: false,
                });
                response.cookies.set(this.returnToCookieName, '', { maxAge: 0 });
                return response;
            }
            // Handle logout
            if (request.nextUrl.pathname === this.logoutPath) {
                if (isPrefetchRequest) {
                    return new NextResponse(null, { status: 204 });
                }
                const logoutURL = yield this.client.getLogoutURL({ redirectURI: this.logoutRedirectURI });
                const response = NextResponse.redirect(logoutURL);
                response.cookies.set(this.sessionCookieName, '', { maxAge: 0 });
                return response;
            }
            // Check authentication for configured paths
            const matchingPath = compiledPathsAuthenticators.find(({ matcher }) => matcher.exec(request.nextUrl.pathname));
            if (matchingPath) {
                try {
                    const result = yield matchingPath.authenticate(request);
                    const requestHeaders = new Headers(request.headers);
                    if (result.accessTokenInfo) {
                        requestHeaders.set(this.userIdHeaderName, result.accessTokenInfo.id);
                        requestHeaders.set(this.accessTokenHeaderName, result.accessTokenInfo.access_token);
                        requestHeaders.set(this.accessTokenInfoHeaderName, JSON.stringify(result.accessTokenInfo));
                    }
                    return NextResponse.next({ request: { headers: requestHeaders } });
                }
                catch (err) {
                    if (err instanceof FiefAuthUnauthorized) {
                        const authURL = yield this.client.getAuthURL({ redirectURI: this.redirectURI, scope: ['openid'] });
                        const response = NextResponse.redirect(authURL);
                        response.cookies.set(this.returnToCookieName, `${request.nextUrl.pathname}${request.nextUrl.search}`);
                        return response;
                    }
                    if (err instanceof FiefAuthForbidden) {
                        return NextResponse.rewrite(new URL(this.forbiddenPath, request.url));
                    }
                    throw err;
                }
            }
            // Default response
            return NextResponse.next();
        });
    }
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
    authenticated(route, authenticatedParameters = {}) {
        const authenticate = this.fiefAuth.authenticate(authenticatedParameters);
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            let user = null;
            let accessTokenInfo = null;
            try {
                const result = yield authenticate(req);
                user = result.user;
                accessTokenInfo = result.accessTokenInfo;
            }
            catch (err) {
                if (err instanceof FiefAuthUnauthorized) {
                    return this.apiUnauthorizedResponse(req, res);
                }
                if (err instanceof FiefAuthForbidden) {
                    return this.apiForbiddenResponse(req, res);
                }
            }
            req.accessTokenInfo = accessTokenInfo;
            req.user = user;
            return route(req, res);
        });
    }
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
    currentUser() {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            const refresh = req.query.refresh === 'true';
            return this.authenticated((_req, _res) => __awaiter(this, void 0, void 0, function* () {
                _res.status(200).json({ userinfo: _req.user, access_token_info: _req.accessTokenInfo });
            }), { optional: true, refresh })(req, res);
        });
    }
    /**
     * Return the user ID set in headers by the Fief middleware, or `null` if not authenticated.
     *
     * This function is suitable for server-side rendering in Next.js.
     *
     * @param req - Next.js request object. Required for older versions of Next.js
     * not supporting the `headers()` function.
     * @returns The user ID, or null if not available.
     */
    getUserId(req) {
        return getServerSideHeaders(this.userIdHeaderName, req);
    }
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
    getAccessTokenInfo(req) {
        const rawAccessTokenInfo = getServerSideHeaders(this.accessTokenInfoHeaderName, req);
        return rawAccessTokenInfo ? JSON.parse(rawAccessTokenInfo) : null;
    }
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
    getUserInfo(req_1) {
        return __awaiter(this, arguments, void 0, function* (req, refresh = false) {
            const accessTokenInfo = this.getAccessTokenInfo(req);
            if (accessTokenInfo === null) {
                return null;
            }
            const userId = accessTokenInfo.id;
            if (refresh && !req) {
                revalidateTag(userId);
            }
            const userinfo = yield this.client.userinfo(accessTokenInfo.access_token, { cache: 'force-cache', next: { tags: [userId] } });
            return userinfo;
        });
    }
}

export { FiefAuth };
//# sourceMappingURL=index.js.map
