import { __awaiter } from '../node_modules/tslib/tslib.es6.js';
import { FiefAuth as FiefAuth$1, FiefAuthUnauthorized, FiefAuthForbidden } from '../server.js';
export { authorizationSchemeGetter, cookieGetter } from '../server.js';

/**
 * Default handler for unauthorized response.
 *
 * Set the status code to 401.
 *
 * @param req - An Express `Request` object.
 * @param res  - An Express `Response` object.
 */
const defaultUnauthorizedResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(401).send('Unauthorized');
});
/**
 * Default handler for forbidden response.
 *
 * Set the status code to 403.
 *
 * @param req - An Express `Request` object.
 * @param res  - An Express `Response` object.
 */
const defaultForbiddenResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(403).send('Forbidden');
});
/**
 * Return an Express authentication middleware.
 *
 * @param parameters - The middleware parameters.
 *
 * @returns An Express middleware accepting {@link server.AuthenticateRequestParameters} parameters.
 *
 * @example Basic
 * ```ts
 * const fief = require('@fief/fief');
 * const fiefExpress = require('@fief/fief/express');
 * const express = require('express');
 *
 * const fiefClient = new fief.Fief({
 *     baseURL: 'https://example.fief.dev',
 *     clientId: 'YOUR_CLIENT_ID',
 *     clientSecret: 'YOUR_CLIENT_SECRET',
 * });
 * const fiefAuthMiddleware = fiefExpress.createMiddleware({
 *     client: fiefClient,
 *     tokenGetter: fiefExpress.authorizationSchemeGetter(),
 * });
 *
 * const app = express();
 * app.get('/authenticated', fiefAuthMiddleware(), (req, res) => {
 *     res.json(req.accessTokenInfo);
 * });
 * ```
 *
 * @example Required scope
 * ```ts
 * app.get(
 *     '/authenticated-scope',
 *     fiefAuthMiddleware({ scope: ['required_scope'] }),
 *     (req, res) => {
 *         res.json(req.accessTokenInfo);
 *     },
 * );
 * ```
 *
 * @example Minimum ACR level
 * ```ts
 * app.get(
 *     '/authenticated-acr',
 *     fiefAuthMiddleware({ acr: FiefACR.LEVEL_ONE }),
 *     (req, res) => {
 *         res.json(req.accessTokenInfo);
 *     },
 * );
 * ```
 *
 * @example Required permissions
 * ```ts
 * app.get(
 *     '/authenticated-permission',
 *     fiefAuthMiddleware({ permissions: ['castles:create'] }),
 *     (req, res) => {
 *         res.json(req.accessTokenInfo);
 *     },
 * );
 * ```
 */
const createMiddleware = (parameters) => {
    const fiefAuthServer = new FiefAuth$1(parameters.client, parameters.tokenGetter, parameters.userInfoCache);
    const unauthorizedResponse = (parameters.unauthorizedResponse
        ? parameters.unauthorizedResponse
        : defaultUnauthorizedResponse);
    const forbiddenResponse = (parameters.forbiddenResponse
        ? parameters.forbiddenResponse
        : defaultForbiddenResponse);
    return (authenticatedParameters = {}) => {
        const authenticate = fiefAuthServer.authenticate(authenticatedParameters);
        return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
            req.accessTokenInfo = null;
            req.user = null;
            try {
                const { accessTokenInfo, user } = yield authenticate(req);
                req.accessTokenInfo = accessTokenInfo;
                req.user = user;
            }
            catch (err) {
                if (err instanceof FiefAuthUnauthorized) {
                    return unauthorizedResponse(req, res);
                }
                if (err instanceof FiefAuthForbidden) {
                    return forbiddenResponse(req, res);
                }
            }
            return next();
        });
    };
};

export { createMiddleware };
//# sourceMappingURL=index.js.map
