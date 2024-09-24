/**
 * Express integration.
 *
 * @module
 */
import { NextFunction, Request, Response } from 'express';
import { Fief, FiefAccessTokenInfo, FiefUserInfo } from '../client';
import { AuthenticateRequestParameters, authorizationSchemeGetter, cookieGetter, IUserInfoCache, TokenGetter } from '../server';
declare global {
    namespace Express {
        interface Request {
            accessTokenInfo: FiefAccessTokenInfo | null;
            user: FiefUserInfo | null;
        }
    }
}
/**
 * Parameters to instantiate a {@link fiefAuth} middleware.
 */
export interface FiefAuthParameters {
    /**
     * Instance of a {@link Fief} client.
     */
    client: Fief;
    /**
     *  {@link TokenGetter} function.
     */
    tokenGetter: TokenGetter<Request>;
    /**
     * An instance of a {@link IUserInfoCache} class.
     */
    userInfoCache?: IUserInfoCache;
    /**
     * Optional handler for unauthorized response.
     *
     * The default handler will return a plain text response with status code 401.
     */
    unauthorizedResponse?: (req: Request, res: Response) => Promise<void>;
    /**
     * Optional handler for forbidden response.
     *
     * The default handler will return a plain text response with status code 403.
     */
    forbiddenResponse?: (req: Request, res: Response) => Promise<void>;
}
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
declare const createMiddleware: (parameters: FiefAuthParameters) => (authenticatedParameters?: AuthenticateRequestParameters) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { authorizationSchemeGetter, cookieGetter, createMiddleware, };
export type { AuthenticateRequestParameters, IUserInfoCache, TokenGetter, };
