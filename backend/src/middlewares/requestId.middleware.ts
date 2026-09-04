import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

import { logger } from "../lib/logger.js";
import { requestContext } from "../lib/requestContext.js";

export const requestIdMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const requestId = randomUUID();

    req.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);

    const requestLogger = logger.child({
        requestId,
    });

    requestContext.run(
        {
            requestId,
            logger: requestLogger,
        },
        () => {
            next();
        },
    );
};