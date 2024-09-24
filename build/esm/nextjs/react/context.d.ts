/// <reference types="react" />
import { FiefAuthState } from './state';
/**
 * Function to refresh the user information from the API.
 *
 * @param useCache - If `true`, the data will be read from your server cache (much faster).
 * If `false`, the data will be retrieved from the Fief API (fresher data).
 * Defaults to `true`.
 */
type RefreshFunction = (useCache?: boolean) => Promise<void>;
interface FiefAuthContextType {
    state: FiefAuthState;
    refresh: RefreshFunction;
}
declare const FiefAuthContext: import("react").Context<FiefAuthContextType>;
export { FiefAuthContext, };
export type { RefreshFunction, };
