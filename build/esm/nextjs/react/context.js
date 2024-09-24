import { createContext } from 'react';

const stub = () => {
    throw new Error('You forgot to wrap your component in <FiefAuthProvider>.');
};
// @ts-ignore
const FiefAuthContext = createContext(stub);

export { FiefAuthContext };
//# sourceMappingURL=context.js.map
