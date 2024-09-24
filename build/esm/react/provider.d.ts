import * as React from 'react';
import { ReactNode } from 'react';
import { FiefParameters } from '../client';
export interface FiefAuthProviderProps extends FiefParameters {
    children?: ReactNode;
}
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
export declare const FiefAuthProvider: React.FunctionComponent<FiefAuthProviderProps>;
