import { __awaiter } from '../../node_modules/tslib/tslib.es6.js';
import { jsx } from 'react/jsx-runtime';
import { useCallback, useEffect } from 'react';
import { FiefAuthContext } from './context.js';
import { useAuthStorageReducer } from './state.js';

/**
 * Provide the necessary context for Fief, especially the user session state.
 *
 * Every component nested inside this component will have access to the Fief hooks.
 *
 * @param props - Component properties.
 *
 * @example
 * ```tsx
 * import { FiefAuthProvider } from '@fief/fief/nextjs';
 * import type { AppProps } from 'next/app';
 *
 * function MyApp({ Component, pageProps }: AppProps) {
 *   return (
 *     <FiefAuthProvider currentUserPath="/api/current-user">
 *       <Component {...pageProps} />
 *     </FiefAuthProvider>
 *   );
 * };
 *
 * export default MyApp;
 * ```
 */
const FiefAuthProvider = (props) => {
    const [state, dispatch] = useAuthStorageReducer();
    const refresh = useCallback((useCache) => __awaiter(void 0, void 0, void 0, function* () {
        const refreshParam = useCache === undefined ? false : !useCache;
        const response = yield window.fetch(`${props.currentUserPath}?refresh=${refreshParam}`);
        if (response.status === 200) {
            const data = yield response.json();
            dispatch({ type: 'setAccessTokenInfo', value: data.access_token_info });
            dispatch({ type: 'setUserinfo', value: data.userinfo });
        }
    }), [dispatch]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return (jsx(FiefAuthContext.Provider, { value: { state, refresh }, children: props.children }));
};

export { FiefAuthProvider };
//# sourceMappingURL=provider.js.map
