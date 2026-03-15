import { z } from "zod";

export const userSchema = z.object({
  kind: z.literal("User"),
  id: z.string(),
});

export const userSubject = z.tuple([
  z.union([z.literal("manage"), z.literal("get"), z.literal("update")]),
  z.union([z.literal("User"), userSchema]),
]);

export type UserSubject = z.infer<typeof userSchema>;
