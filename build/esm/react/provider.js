import { jsx } from 'react/jsx-runtime';
import { useMemo, useEffect } from 'react';
import { FiefAuth } from '../browser.js';
import { Fief } from '../client.js';
import { FiefAuthContext } from './context.js';
import { useAuthStorageReducer, FiefReactAuthStorage, saveStateToStorage } from './storage.js';

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
    const fief = useMemo(() => new Fief({
        baseURL,
        clientId,
        clientSecret,
        encryptionKey,
    }), [baseURL, clientId, clientSecret, encryptionKey]);
    const [state, dispatch] = useAuthStorageReducer();
    const storage = useMemo(() => new FiefReactAuthStorage(state, dispatch), [state, dispatch]);
    const fiefAuth = useMemo(() => new FiefAuth(fief, storage), [fief]);
    useEffect(() => {
        saveStateToStorage(state);
    }, [state]);
    return (jsx(FiefAuthContext.Provider, { value: { auth: fiefAuth, state }, children: props.children }));
};

export { FiefAuthProvider };
//# sourceMappingURL=provider.js.map
