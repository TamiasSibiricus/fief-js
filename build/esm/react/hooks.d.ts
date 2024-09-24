import type { FiefAuth } from '../browser';
import type { FiefTokenResponse, FiefUserInfo } from '../client';
/**
 * Return an instance of the {@link index.browser.FiefAuth} browser helper.
 *
 * @returns The {@link index.browser.FiefAuth} browser helper.
 *
 * @example
 * ```tsx
 * const fiefAuth = useFiefAuth();
 * ```
 */
export declare const useFiefAuth: () => FiefAuth;
/**
 * Return the user information object available in session, or `null` if no current session.
 *
 * @returns The user information, or null if not available.
 *
 * @example
 * ```tsx
 * const userinfo = useFiefUserinfo();
 * ````
 */
export declare const useFiefUserinfo: () => FiefUserInfo | null;
/**
 * Return the token information object available in session, or `null` if no current session.
 *
 * @returns The token information, or null if not available.
 *
 * @example
 * ```tsx
 * const tokenInfo = useFiefTokenInfo();
 * ```
 */
export declare const useFiefTokenInfo: () => FiefTokenResponse | null;
/**
 * Return whether there is a valid user session.
 *
 * @returns `true` if there is a valid user session, `false` otherwise.
 *
 * @example
 * ```tsx
 * const isAuthenticated = useFiefIsAuthenticated();
 * ```
 */
export declare const useFiefIsAuthenticated: () => boolean;
