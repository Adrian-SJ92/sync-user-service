import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const headerValue = req.header("x-correlation-id");
  const correlationId = headerValue || randomUUID();

  req.correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);

  next();
}