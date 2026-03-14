import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  MongoAbility,
} from "@casl/ability";
import { z } from "zod";
import { permissions } from "./permissions";
import { userSubject } from "./subjects/UserSubject";
import type { Role } from "./roles";
import { User } from "./types";

const appAbilities = z.union([
  userSubject,
  z.tuple([z.literal("manage"), z.literal("all")]), // Admin ability
]);

type AppAbilities = z.infer<typeof appAbilities>;

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: User): AppAbility {
  const builder = new AbilityBuilder<AppAbility>(createAppAbility);

  const rolePermissions = permissions[user.role as Role];

  if (typeof rolePermissions === "function") {
    rolePermissions(user, builder);
  } else {
    throw new Error(`Unknown role "${user.role}"`);
  }

  const ability = builder.build({
    detectSubjectType(subject: any) {
      return subject.kind || subject.__typename || subject;
    },
  });

  ability.can = ability.can.bind(ability);
  ability.cannot = ability.cannot.bind(ability);

  return ability;
}
