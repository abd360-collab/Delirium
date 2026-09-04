import app from "./app.js";

import { env } from "./config/env.js";

import { logger } from "./lib/logger.js";

let server: ReturnType<typeof app.listen>;

const shutdown = (signal: string) => {
    logger.info(
        { signal },
        "Shutdown signal received",
    );

    server?.close(() => {
        logger.info("HTTP server closed");

        process.exit(0);
    });
};

process.on("SIGTERM", () => {
    shutdown("SIGTERM");
}); // // Commonly used by infrastructure to request termination.

process.on("SIGINT", () => {
    shutdown("SIGINT");
});//Usually generated when you press:
// // Ctrl + C
// // during production it is visible.

process.on("uncaughtException", (error) => {
    logger.fatal(
        { err: error },
        "Uncaught exception",
    );

    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    logger.fatal(
        { err: reason },
        "Unhandled promise rejection",
    );

    process.exit(1);
});

server = app.listen(env.PORT, () => {
    logger.info(
        {
            port: env.PORT,
            environment: env.NODE_ENV,
        },
        "Server started",
    );
});