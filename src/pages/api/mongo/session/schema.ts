import { Schema } from "mongoose";
import { ObjectId } from "mongodb";
import { Session } from "../../../../types";

export const sessionSchema = new Schema<Session>({
  token: String,
  userId: { type: ObjectId, ref: "User" },
});
