import createError from "http-errors";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";

import PocketBase from "pocketbase";

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import chatRouter from "./routes/chats.js";
import { createPocketBaseClient } from "./utils/create-pb-client.js";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(
  cors({
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
    ],
    origin: "http://localhost:4200",
  }),
);
app.use(express.json());
app.options("*", cors());
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
  console.log("Authenticating user attempt...");
  // Grab the token from the request header
  console.log(
    "Request headers:",
    "Look for Authorization header => ",
    req.headers,
  );
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.split(" ")[1]
      ? authHeader.split(" ")[1]
      : authHeader; // 'Bearer <token>'

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access token is missing or invalid" });
  }

  console.log("Authenticating user with token:", token);
  try {
    // Create a per-request PocketBase client instance with the user's token
    const pb = createPocketBaseClient(token, PB_URL);
    console.log("PocketBase client instance:", pb);

    // Verify the token with the PocketBase client
    console.log("Verifying token...");
    const authData = await pb.collection("users").authRefresh();
    console.log("Auth data:", authData);

    // Attach the PocketBase client and the user data to the request
    req.pb = pb;
    req.user = pb.authStore.model;

    console.log("User authenticated:", req.user);

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token", err });
  }
});

// eslint-disable-next-line
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
