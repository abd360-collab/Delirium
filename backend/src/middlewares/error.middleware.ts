import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/AppError.js";
import { logger } from "../lib/logger.js";
import { getRequestContext } from "../lib/requestContext.js";

export const errorMiddleware: ErrorRequestHandler = (
    error,
    req,
    res,
    _next,
) => {
    const context = getRequestContext();
    const requestLogger = context?.logger ?? logger;

    if (error instanceof ZodError) {
        requestLogger.warn(
            {
                errorCode: "VALIDATION_ERROR",
                statusCode: 400,
                method: req.method,
                path: req.path,
            },
            "Request validation failed",
        );

        return res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Request validation failed",
                details: error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            },
        });
    }

    if (error instanceof AppError) {
        requestLogger.warn(
            {
                errorCode: error.code,
                statusCode: error.statusCode,
                method: req.method,
                path: req.path,
            },
            error.message,
        );

        return res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
            },
        });
    }

    requestLogger.error(
        {
            err: error,
            method: req.method,
            path: req.path,
            statusCode: 500,
        },
        "Unhandled error",
    );

    return res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
        },
    });
};