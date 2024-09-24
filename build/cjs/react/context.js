'use strict';

var react = require('react');

const stub = () => {
    throw new Error('You forgot to wrap your component in <FiefAuthProvider>.');
};
/**
 * Context storing the {@link index.browser.FiefAuth} helper and the authentication state.
 */
// @ts-ignore
const FiefAuthContext = react.createContext(stub);

exports.FiefAuthContext = FiefAuthContext;
//# sourceMappingURL=context.js.map
