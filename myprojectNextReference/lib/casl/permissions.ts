import { AbilityBuilder } from "@casl/ability";
import { AppAbility } from "./abilities";
import { Role } from "./roles";
import { User } from "./types";

type PermissionsFn = (user: User, builder: AbilityBuilder<AppAbility>) => void;

export const permissions: Record<Role, PermissionsFn> = {
  admin(user, { can }) {
    can("manage", "all");
  },
  user(user, { can }) {
    can("get", "User", { id: user.id });
    can("update", "User", { id: user.id });
  },
};
