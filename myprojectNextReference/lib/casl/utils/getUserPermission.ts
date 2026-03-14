import { defineAbilityFor } from "../abilities";
import { User } from "../types";
import { userSchema, UserSubject } from "../subjects/UserSubject";

export const getUserPermision = (userId: string, role: string) => {
  const user: Partial<User> = {
    id: userId,
    role: role,
  };
  const ability = defineAbilityFor(user as User);
  return ability;
};

export const mapUserToAuth = (user: UserSubject): UserSubject => {
  return userSchema.parse({ kind: user.kind, id: user.id });
};
