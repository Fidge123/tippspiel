import { z } from "zod";

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(64, "Name must be less than 64 characters");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be less than 64 characters");
