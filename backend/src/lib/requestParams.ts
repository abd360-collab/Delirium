import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";

export function getRequiredParam(
    value: string | string[] | undefined,
    name: string,
): string {
    if (typeof value !== "string" || value.length === 0) {
        throw new AppError(
            ERROR_CODES.VALIDATION_ERROR,
            `${name} is required`,
            400,
        );
    }

    return value;
}