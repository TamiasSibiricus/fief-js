import { ICryptoHelper } from './base';
export declare class NodeJSCryptoHelper implements ICryptoHelper {
    private crypto;
    constructor();
    getValidationHash(value: string): Promise<string>;
    isValidHash(value: string, hash: string): Promise<boolean>;
    generateCodeVerifier(): Promise<string>;
    getCodeChallenge(code: string, method: 'plain' | 'S256'): Promise<string>;
}
