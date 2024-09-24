import { __awaiter } from '../node_modules/tslib/tslib.es6.js';
import { CryptoHelperError } from './base.js';

/* eslint-disable no-restricted-globals */
class BrowserCryptoHelperError extends CryptoHelperError {
}
const toURLSafeBase64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, '')
    .replace(/[+/]/g, (m0) => (m0 === '+' ? '-' : '_'));
class BrowserCryptoHelper {
    constructor() {
        // Native crypto from window
        if (typeof window !== 'undefined' && window.crypto) {
            this.crypto = window.crypto;
        }
        // Native crypto in web worker (Browser)
        if (typeof self !== 'undefined' && self.crypto) {
            this.crypto = self.crypto;
        }
        // Next.js Edge runtime
        // @ts-ignore
        // eslint-disable-next-line no-undef
        if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime === 'vercel') {
            this.crypto = globalThis.crypto;
        }
        // @ts-ignore
        if (this.crypto === undefined) {
            throw new BrowserCryptoHelperError('Cannot find the Crypto module. Are you sure you are in a browser environment?');
        }
    }
    getValidationHash(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const msgBuffer = new TextEncoder().encode(value);
            const hashBuffer = yield this.crypto.subtle.digest('SHA-256', msgBuffer);
            const halfHash = hashBuffer.slice(0, hashBuffer.byteLength / 2);
            return toURLSafeBase64(halfHash);
        });
    }
    isValidHash(value, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const valueHash = yield this.getValidationHash(value);
            return valueHash === hash;
        });
    }
    generateCodeVerifier() {
        return __awaiter(this, void 0, void 0, function* () {
            const randomArray = new Uint8Array(96);
            this.crypto.getRandomValues(randomArray);
            return toURLSafeBase64(randomArray);
        });
    }
    getCodeChallenge(code, method) {
        return __awaiter(this, void 0, void 0, function* () {
            if (method === 'plain') {
                return code;
            }
            if (method === 'S256') {
                const msgBuffer = new TextEncoder().encode(code);
                const hashBuffer = yield this.crypto.subtle.digest('SHA-256', msgBuffer);
                return toURLSafeBase64(hashBuffer);
            }
            throw new CryptoHelperError(`Invalid method "${method}". Allowed methods are: plain, S256`);
        });
    }
}

export { BrowserCryptoHelper };
//# sourceMappingURL=browser.js.map
