import createError from "http-errors";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";

import PocketBase from "pocketbase";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import chatRouter from "./routes/chats";
import { createPocketBaseClient } from "./utils/create-pb-client";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PB_URL = process.env.PB_URL || "http://10.27.27.152:8080";

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
      pb?: PocketBase;
    }
  }
}

// Authentication Middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // Grab the token from the request header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // 'Bearer <token>'

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access token is missing or invalid" });
  }

  try {
    // Create a per-request PocketBase client instance with the user's token
    const pb = createPocketBaseClient(token, PB_URL);

    // Verify the token with the PocketBase client
    await pb.collection("users").authRefresh();

    // Attach the PocketBase client and the user data to the request
    req.pb = pb;
    req.user = pb.authStore.model;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token", err });
  }
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/chat", chatRouter);

// catch 404 and forward to error handler
app.use(function (_req: Request, _res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction): void => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
