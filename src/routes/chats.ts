import express, { Response, Request, NextFunction } from "express";
const router = express.Router();

router.get(
  "/initiate",
  async (_req: Request, res: Response, _next: NextFunction) => {
    res.send("respond with a resource");
  },
);
