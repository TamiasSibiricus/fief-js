import { useContext } from 'react';
import { FiefAuthContext } from './context.js';

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
const useFiefAuth = () => {
    const { auth } = useContext(FiefAuthContext);
    return auth;
};
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
 * Return the token information object available in session, or `null` if no current session.
 *
 * @returns The token information, or null if not available.
 *
 * @example
 * ```tsx
 * const tokenInfo = useFiefTokenInfo();
 * ```
 */
const useFiefTokenInfo = () => {
    const { state } = useContext(FiefAuthContext);
    return state.tokenInfo;
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
    const userinfo = useFiefUserinfo();
    return userinfo !== null;
};

export { useFiefAuth, useFiefIsAuthenticated, useFiefTokenInfo, useFiefUserinfo };
//# sourceMappingURL=hooks.js.map
