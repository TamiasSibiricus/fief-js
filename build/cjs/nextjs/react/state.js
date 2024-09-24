'use strict';

var react = require('react');

const reducer = (state, action) => {
    switch (action.type) {
        case 'setUserinfo':
            return Object.assign(Object.assign({}, state), { userinfo: action.value });
        case 'clearUserinfo':
            return Object.assign(Object.assign({}, state), { userinfo: null });
        case 'setAccessTokenInfo':
            return Object.assign(Object.assign({}, state), { accessTokenInfo: action.value });
        case 'clearAccessTokenInfo':
            return Object.assign(Object.assign({}, state), { accessTokenInfo: null });
        default:
            throw new Error();
    }
};
const useAuthStorageReducer = () => react.useReducer(reducer, {
    userinfo: null,
    accessTokenInfo: null,
});

exports.useAuthStorageReducer = useAuthStorageReducer;
//# sourceMappingURL=state.js.map
