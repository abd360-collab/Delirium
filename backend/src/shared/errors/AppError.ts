export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(
        code: string,
        message: string,
        statusCode: number,
    ) {
        super(message);

        this.name = "AppError";
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}