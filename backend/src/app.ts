import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import router from "./routes/index.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { requestLoggerMiddleware } from "./middlewares/requestLogger.middleware.js";


const app = express();

app.use(requestIdMiddleware); // build context for logs which needs to associated with an particular request.
app.use(requestLoggerMiddleware); // automatic logging for req-res lifecycle.

app.use(express.json());




app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});
app.use("/api/v1", router);


app.use(errorMiddleware);

export default app;