import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(7, "Password must contain at least 7 characters");