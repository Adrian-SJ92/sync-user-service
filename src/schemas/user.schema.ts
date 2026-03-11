import { z } from "zod";

export const syncUserSchema = z.object({
  credential: z.string().min(1, "credential is required"),
  email: z.email("email must be valid"),
  name: z.string().min(1, "name is required"),
});

export type SyncUserInput = z.infer<typeof syncUserSchema>;