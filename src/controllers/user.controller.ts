import { Request, Response } from "express";
import { ZodError } from "zod";
import { syncUserSchema } from "../schemas/user.schema";
import { upsertUser } from "../services/user.service";

function isConflictError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    (error as { code: string }).code === "23505"
  );
}

export async function syncUser(req: Request, res: Response): Promise<void> {
  const correlationId = req.correlationId || "unknown";

  try {
    console.log(`[${correlationId}] POST /sync/user - request received`, req.body);

    const parsedBody = syncUserSchema.parse(req.body);

    const user = await upsertUser(parsedBody);

    console.log(`[${correlationId}] POST /sync/user - user synced`, {
      id: user.id,
      email: user.email,
      credential: user.credential,
    });

    res.status(200).json({
      success: true,
      data: user,
      correlationId,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.warn(`[${correlationId}] POST /sync/user - invalid payload`, error.issues);

      res.status(400).json({
        success: false,
        message: "Invalid payload",
        errors: error.issues,
        correlationId,
      });
      return;
    }

    if (isConflictError(error)) {
      console.warn(`[${correlationId}] POST /sync/user - conflict`, error);

      res.status(409).json({
        success: false,
        message: "User data conflicts with an existing record",
        correlationId,
      });
      return;
    }

    console.error(`[${correlationId}] POST /sync/user - internal error`, error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      correlationId,
    });
  }
}
