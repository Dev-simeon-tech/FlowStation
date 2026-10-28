import express from "express";
import { API_VERSION } from "@flowstation/constants";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandlerMiddleware } from "@/middleware";
import { notFoundMiddleware } from "./middleware";

import { mainRouter } from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Routes
app.use(`/api/${API_VERSION}`, mainRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
