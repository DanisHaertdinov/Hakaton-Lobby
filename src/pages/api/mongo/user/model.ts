import { User as UserType } from "../../../../types";
import { createMongoModel } from "../utils";
import { userSchema } from "./schema";

export const User = createMongoModel<UserType>("User", userSchema);
