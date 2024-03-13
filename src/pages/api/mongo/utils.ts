import mongoose, { Model, Schema } from "mongoose";

const schemaConfig = {
  timestamps: {
    createdAt: `createdDate`,
    updatedAt: `updatedDate`,
  },
};
export const createMongoModel = <T>(
  name: string,
  schema: Schema<T>
): Model<T> => {
  return (
    mongoose.models[name] ||
    mongoose.model(name, new Schema(schema, schemaConfig))
  );
};
