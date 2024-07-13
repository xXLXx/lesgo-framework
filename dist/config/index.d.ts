import app from './app';
import aws from './aws';
import crypto from './crypto';
import jwt from './jwt';
export { app, aws, crypto, jwt };
declare const _default: {
    app: {
        name: string;
        env: string;
        debug: boolean;
    };
    aws: {
        region: string;
        s3: {
            bucket: string;
            region: string;
        };
    };
    crypto: {
        hash: {
            algorithm: string;
        };
        encryption: {
            algorithm: string;
            secretKey: string | undefined;
            ivLength: number;
        };
    };
    jwt: {
        algorithm: string;
        secrets: {
            keyid: string;
            secret: string;
        }[];
        expiresIn: string;
        issuer: string;
        audience: string;
        validateClaims: boolean;
    };
};
export default _default;
