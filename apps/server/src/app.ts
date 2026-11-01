import express from "express";
import { API_VERSION } from "@flowstation/constants";
import { envConfig } from "@/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandlerMiddleware } from "@/middleware";
import { notFoundMiddleware } from "./middleware";

import { mainRouter } from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: envConfig.clientUrls.customerPortal,
    credentials: true,
  }),
);
app.use(cookieParser());

// Routes
app.use(`/api/${API_VERSION}`, mainRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
