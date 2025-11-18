/** *verificationCodeType.ts */
// total size: 109 chars
export default VerificationCodeType;

declare const enum VerificationCodeType {
    EMAILVERIFICATION = 'email_verification',
    PASSWORDRESET = 'password_reset'
}

/** *http.ts */
// total size: 399 chars
export const OK: 200;
export const CREATED: 201;
export const BAD_REQUEST: 400;
export const UNAUTHORIZED: 401;
export const FORBIDDEN: 403;
export const NOT_FOUND: 404;
export const CONFLICT: 409;
export const UNPROCESSABLE_CONTENT: 422;
export const TOO_MANY_REQUESTS: 429;
export const INTERNAL_SERVER_ERROR: 500;

export type HttpStatusCode =
    typeof OK |
    typeof CREATED |
    typeof BAD_REQUEST |
    typeof UNAUTHORIZED |
    typeof FORBIDDEN |
    typeof NOT_FOUND |
    typeof CONFLICT |
    typeof UNPROCESSABLE_CONTENT |
    typeof TOO_MANY_REQUESTS |
    typeof INTERNAL_SERVER_ERROR;

/** *appErrorCode.ts */
// total size: 69 chars
export default AppErrorCode;

declare const enum AppErrorCode {
    InvalidAccessToken = 'InvalidAccessToken'
}

/** *env.ts */
// total size: 579 chars
export const SECRET_NAMES: readonly ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'EMAIL_SENDER', 'RESEND_API_KEY'];
export const NODE_ENV: string;
export const PORT: string;
export const MONGO_URI: string;
export const JWT_SECRET: string;
export const APP_ORIGIN: string;
export const JWT_REFRESH_SECRET: string;
export const EMAIL_SENDER: string;
export const RESEND_API_KEY: string;
export const MAX_TREE_DEPTH: number;
export const KEY_VAULT_URL: string;
