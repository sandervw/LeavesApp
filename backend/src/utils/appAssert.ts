import assert from "node:assert";
import { AppError } from "./errorUtils";
import { HttpStatusCode } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

type AppAssert = (
    condition: unknown,
    httpStatusCode: HttpStatusCode,
    message: string,
    appErrorCode?: AppErrorCode
) => asserts condition; // asserts is a typescript keyword that tells the compiler that this function will throw if the condition is false

/**
 * Asserts a condition, throws AppError if condition is falsy.
 */
const appAssert: AppAssert = (
    condition,
    httpStatusCode,
    message,
    appErrorCode) => {
    if (!condition) {
        throw new AppError(httpStatusCode, message, appErrorCode);
    }
    return assert(condition);
}

export default appAssert;