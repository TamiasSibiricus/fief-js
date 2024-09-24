/// <reference types="react" />
import type { FiefAuth } from '../browser';
import { FiefAuthState } from './storage';
/**
 * Context storing the {@link index.browser.FiefAuth} helper and the authentication state.
 */
export declare const FiefAuthContext: import("react").Context<{
    auth: FiefAuth;
    state: FiefAuthState;
}>;
