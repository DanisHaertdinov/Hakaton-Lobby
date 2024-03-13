import { Session as SessionType } from "../../../../types";
import { createMongoModel } from "../utils";
import { sessionSchema } from "./schema";

export const Session = createMongoModel<SessionType>("Session", sessionSchema);
