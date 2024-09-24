import type { FiefAccessTokenInfo, FiefUserInfo } from '../../client';
import { RefreshFunction } from './context';
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
declare const useFiefUserinfo: () => FiefUserInfo | null;
/**
 * Return the access token information object available in session, or `null` if no current session.
 *
 * @returns The access token information, or null if not available.
 *
 * @example
 * ```tsx
 * const accessTokenInfo = useFiefAccessTokenInfo();
 * ```
 */
declare const useFiefAccessTokenInfo: () => FiefAccessTokenInfo | null;
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
declare const useFiefIsAuthenticated: () => boolean;
/**
 * Return a function to refresh the user information from the API.
 *
 * @returns A {@link RefreshFunction}.
 *
 * @example Basic
 * ```tsx
 * const userinfo = useFiefUserinfo();
 * const refresh = useFiefRefresh();
 *
 * return (
 *     <>
 *         <p>User: {userinfo.email}</p>
 *         <button type="button" onClick={refresh}>Refresh user</button>
 *     </>
 * );
 * ```
 *
 * @example Refresh from Fief server
 * ```tsx
 * const userinfo = useFiefUserinfo();
 * const refresh = useFiefRefresh();
 *
 * return (
 *     <>
 *         <p>User: {userinfo.email}</p>
 *         <button type="button" onClick={() => refresh(false)}>Refresh user</button>
 *     </>
 * );
 * ```
 */
declare const useFiefRefresh: () => RefreshFunction;
export { useFiefAccessTokenInfo, useFiefIsAuthenticated, useFiefRefresh, useFiefUserinfo, };
