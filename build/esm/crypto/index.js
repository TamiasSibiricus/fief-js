export { CryptoHelperError } from './base.js';
import { BrowserCryptoHelper } from './browser.js';

// import { NodeJSCryptoHelper } from './node';
/**
 * Return a {@link ICryptoHelper} implementation suitable for the current environment.
 *
 * @returns A {@link ICryptoHelper}
 */
const getCrypto = () => {
    // Browser and workers
    // if (
    //   typeof window !== 'undefined'
    //   // eslint-disable-next-line no-restricted-globals
    //   || typeof self !== 'undefined'
    //   // @ts-ignore
    //   // eslint-disable-next-line no-undef
    //   || (typeof EdgeRuntime !== 'undefined' && EdgeRuntime === 'vercel')
    // ) {
    //   return new BrowserCryptoHelper();
    // }
    // // NodeJS
    // if (typeof require === 'function') {
    //   return new NodeJSCryptoHelper();
    // }
    return new BrowserCryptoHelper();
    // throw new CryptoHelperError('Cannot find a crypto implementation for your environment');
};

export { getCrypto };
//# sourceMappingURL=index.js.map
