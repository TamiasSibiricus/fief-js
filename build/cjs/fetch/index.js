'use strict';

class FetchHelperError extends Error {
}
const getFetch = () => {
    if (typeof window !== 'undefined' && window.fetch) {
        return window.fetch.bind(window);
    }
    // eslint-disable-next-line no-restricted-globals
    if (typeof self !== 'undefined' && self.fetch) {
        // eslint-disable-next-line no-restricted-globals
        return self.fetch.bind(self);
    }
    if (typeof globalThis !== 'undefined' && globalThis.fetch) {
        return globalThis.fetch.bind(globalThis);
    }
    throw new FetchHelperError('Cannot find a fetch implementation for your environment');
};

exports.FetchHelperError = FetchHelperError;
exports.getFetch = getFetch;
//# sourceMappingURL=index.js.map
