import { Schema } from "mongoose";
import { User } from "../../../../types";

const userSchema = new Schema<User>(
  {
    gitHubId: Number,
    token: Number,
    name: String,
    avatarURL: String,
  },
  {
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
      },
    },
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
      },
    },
  }
);

userSchema.virtual("id").get(function () {
  // eslint-disable-next-line no-invalid-this
  return this._id;
});

export { userSchema };
