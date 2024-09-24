import { CryptoHelperError, ICryptoHelper } from './base';
/**
 * Return a {@link ICryptoHelper} implementation suitable for the current environment.
 *
 * @returns A {@link ICryptoHelper}
 */
export declare const getCrypto: () => ICryptoHelper;
export { CryptoHelperError };
export type { ICryptoHelper };
