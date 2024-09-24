'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var browser = require('../browser.js');
var client = require('../client.js');
var context = require('./context.js');
var storage = require('./storage.js');

/**
 * Provide the necessary context for Fief, especially the Fief client and user session state.
 *
 * Every component nested inside this component will have access to the Fief hooks.
 *
 * @param props - Component properties.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <FiefAuthProvider
 *       baseURL="https://example.fief.dev"
 *       clientId="YOUR_CLIENT_ID"
 *     >
 *       <div className="App">
 *         <h1>Fief React example</h1>
 *       </div>
 *     </FiefAuthProvider>
 *   );
 * }
 * ```
 */
const FiefAuthProvider = (props) => {
    const { baseURL, clientId, clientSecret, encryptionKey, } = props;
    const fief = react.useMemo(() => new client.Fief({
        baseURL,
        clientId,
        clientSecret,
        encryptionKey,
    }), [baseURL, clientId, clientSecret, encryptionKey]);
    const [state, dispatch] = storage.useAuthStorageReducer();
    const storage$1 = react.useMemo(() => new storage.FiefReactAuthStorage(state, dispatch), [state, dispatch]);
    const fiefAuth = react.useMemo(() => new browser.FiefAuth(fief, storage$1), [fief]);
    react.useEffect(() => {
        storage.saveStateToStorage(state);
    }, [state]);
    return (jsxRuntime.jsx(context.FiefAuthContext.Provider, { value: { auth: fiefAuth, state }, children: props.children }));
};

exports.FiefAuthProvider = FiefAuthProvider;
//# sourceMappingURL=provider.js.map
