'use strict';

var react = require('react');

const reducer = (state, action) => {
    switch (action.type) {
        case 'loadFromStorage':
            return action.value;
        case 'setUserinfo':
            return Object.assign(Object.assign({}, state), { userinfo: action.value });
        case 'clearUserinfo':
            return Object.assign(Object.assign({}, state), { userinfo: null });
        case 'setTokenInfo':
            return Object.assign(Object.assign({}, state), { tokenInfo: action.value });
        case 'clearTokenInfo':
            return Object.assign(Object.assign({}, state), { tokenInfo: null });
        default:
            throw new Error();
    }
};
const STATE_STORAGE_KEY = 'fief-authstate';
const loadStateFromStorage = (state) => {
    const value = window.sessionStorage.getItem(STATE_STORAGE_KEY);
    if (value) {
        return JSON.parse(value);
    }
    return state;
};
const saveStateToStorage = (state) => {
    window.sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
};
const useAuthStorageReducer = () => react.useReducer(reducer, { userinfo: null, tokenInfo: null }, loadStateFromStorage);
class FiefReactAuthStorage {
    constructor(state, dispatch) {
        this.state = state;
        this.dispatch = dispatch;
        this.sessionStorage = window.sessionStorage;
    }
    getUserinfo() {
        return this.state.userinfo || null;
    }
    setUserinfo(userinfo) {
        this.dispatch({ type: 'setUserinfo', value: userinfo });
    }
    clearUserinfo() {
        this.dispatch({ type: 'clearUserinfo' });
    }
    getTokenInfo() {
        return this.state.tokenInfo || null;
    }
    setTokenInfo(tokenInfo) {
        this.dispatch({ type: 'setTokenInfo', value: tokenInfo });
    }
    clearTokeninfo() {
        this.dispatch({ type: 'clearTokenInfo' });
    }
    getCodeVerifier() {
        const value = this.sessionStorage.getItem(FiefReactAuthStorage.CODE_VERIFIER_STORAGE_KEY);
        if (!value) {
            return null;
        }
        return value;
    }
    setCodeVerifier(code) {
        this.sessionStorage.setItem(FiefReactAuthStorage.CODE_VERIFIER_STORAGE_KEY, code);
    }
    clearCodeVerifier() {
        this.sessionStorage.removeItem(FiefReactAuthStorage.CODE_VERIFIER_STORAGE_KEY);
    }
}
FiefReactAuthStorage.CODE_VERIFIER_STORAGE_KEY = 'fief-codeverifier';

exports.FiefReactAuthStorage = FiefReactAuthStorage;
exports.saveStateToStorage = saveStateToStorage;
exports.useAuthStorageReducer = useAuthStorageReducer;
//# sourceMappingURL=storage.js.map
