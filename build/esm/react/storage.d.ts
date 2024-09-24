import * as React from 'react';
import { IFiefAuthStorage } from '../browser';
import { FiefTokenResponse, FiefUserInfo } from '../client';
export interface FiefAuthState {
    userinfo: FiefUserInfo | null;
    tokenInfo: FiefTokenResponse | null;
}
interface LoadFromStorageAuthReducerAction {
    type: 'loadFromStorage';
    value: FiefAuthState;
}
interface SetUserInfoAuthReducerAction {
    type: 'setUserinfo';
    value: FiefUserInfo;
}
interface ClearUserInfoAuthReducerAction {
    type: 'clearUserinfo';
}
interface SetTokenInfoAuthReducerAction {
    type: 'setTokenInfo';
    value: FiefTokenResponse;
}
interface ClearTokenInfoAuthReducerAction {
    type: 'clearTokenInfo';
}
type AuthReducerAction = (LoadFromStorageAuthReducerAction | SetUserInfoAuthReducerAction | ClearUserInfoAuthReducerAction | SetTokenInfoAuthReducerAction | ClearTokenInfoAuthReducerAction);
export declare const saveStateToStorage: (state: FiefAuthState) => void;
export declare const useAuthStorageReducer: () => [FiefAuthState, React.Dispatch<AuthReducerAction>];
export declare class FiefReactAuthStorage implements IFiefAuthStorage {
    private state;
    private dispatch;
    private sessionStorage;
    private static readonly CODE_VERIFIER_STORAGE_KEY;
    constructor(state: FiefAuthState, dispatch: React.Dispatch<AuthReducerAction>);
    getUserinfo(): FiefUserInfo | null;
    setUserinfo(userinfo: FiefUserInfo): void;
    clearUserinfo(): void;
    getTokenInfo(): FiefTokenResponse | null;
    setTokenInfo(tokenInfo: FiefTokenResponse): void;
    clearTokeninfo(): void;
    getCodeVerifier(): string | null;
    setCodeVerifier(code: string): void;
    clearCodeVerifier(): void;
}
export {};
