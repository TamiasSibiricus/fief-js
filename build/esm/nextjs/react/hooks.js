import { useContext } from 'react';
import { FiefAuthContext } from './context.js';

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
const useFiefUserinfo = () => {
    const { state } = useContext(FiefAuthContext);
    return state.userinfo;
};
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
const useFiefAccessTokenInfo = () => {
    const { state } = useContext(FiefAuthContext);
    return state.accessTokenInfo;
};
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
const useFiefIsAuthenticated = () => {
    const accessTokenInfo = useFiefAccessTokenInfo();
    return accessTokenInfo !== null;
};
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
const useFiefRefresh = () => {
    const { refresh } = useContext(FiefAuthContext);
    return refresh;
};

export { useFiefAccessTokenInfo, useFiefIsAuthenticated, useFiefRefresh, useFiefUserinfo };
//# sourceMappingURL=hooks.js.map
