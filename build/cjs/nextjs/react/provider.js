'use strict';

var tslib_es6 = require('../../node_modules/tslib/tslib.es6.js');
var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var context = require('./context.js');
var state = require('./state.js');

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
    const [state$1, dispatch] = state.useAuthStorageReducer();
    const refresh = react.useCallback((useCache) => tslib_es6.__awaiter(void 0, void 0, void 0, function* () {
        const refreshParam = useCache === undefined ? false : !useCache;
        const response = yield window.fetch(`${props.currentUserPath}?refresh=${refreshParam}`);
        if (response.status === 200) {
            const data = yield response.json();
            dispatch({ type: 'setAccessTokenInfo', value: data.access_token_info });
            dispatch({ type: 'setUserinfo', value: data.userinfo });
        }
    }), [dispatch]);
    react.useEffect(() => {
        refresh();
    }, [refresh]);
    return (jsxRuntime.jsx(context.FiefAuthContext.Provider, { value: { state: state$1, refresh }, children: props.children }));
};

exports.FiefAuthProvider = FiefAuthProvider;
//# sourceMappingURL=provider.js.map
