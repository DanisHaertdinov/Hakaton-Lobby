import { Session as SessionType } from "../../../../types";
import { createMongoModel } from "../utils";
import { sessionSchema } from "./schema";

// TODO: перенести mongo из api/mongo в src/service/mongo
export const Session = createMongoModel<SessionType>("Session", sessionSchema);
