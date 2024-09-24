/// <reference types="react" />
import type { FiefAccessTokenInfo, FiefUserInfo } from '../../client';
interface FiefAuthState {
    userinfo: FiefUserInfo | null;
    accessTokenInfo: FiefAccessTokenInfo | null;
}
interface SetUserInfoAuthReducerAction {
    type: 'setUserinfo';
    value: FiefUserInfo;
}
interface ClearUserInfoAuthReducerAction {
    type: 'clearUserinfo';
}
interface SetAccessTokenInfoAuthReducerAction {
    type: 'setAccessTokenInfo';
    value: FiefAccessTokenInfo;
}
interface ClearAccessTokenInfoAuthReducerAction {
    type: 'clearAccessTokenInfo';
}
type AuthReducerAction = (SetUserInfoAuthReducerAction | ClearUserInfoAuthReducerAction | SetAccessTokenInfoAuthReducerAction | ClearAccessTokenInfoAuthReducerAction);
declare const useAuthStorageReducer: () => [FiefAuthState, import("react").Dispatch<AuthReducerAction>];
export { useAuthStorageReducer, };
export type { FiefAuthState };
