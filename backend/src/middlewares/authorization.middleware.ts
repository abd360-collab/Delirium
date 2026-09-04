import type { Request, Response, NextFunction } from "express";

import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";

type UserRole = "CUSTOMER" | "ADMIN";

export const requireRole = (requiredRole: UserRole) => {
    return (
        req: Request,
        _res: Response,
        next: NextFunction,
    ) => {
        if (!req.user) {
            return next(
                new AppError(
                    ERROR_CODES.UNAUTHORIZED,
                    "Authentication required",
                    401,
                ),
            );
        }

        if (req.user.role !== requiredRole) {
            return next(
                new AppError(
                    ERROR_CODES.FORBIDDEN,
                    "You do not have permission to perform this action",
                    403,
                ),
            );
        }

        return next();
    };
};