'use strict';

var react = require('react');

const stub = () => {
    throw new Error('You forgot to wrap your component in <FiefAuthProvider>.');
};
// @ts-ignore
const FiefAuthContext = react.createContext(stub);

exports.FiefAuthContext = FiefAuthContext;
//# sourceMappingURL=context.js.map
