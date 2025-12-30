import mongoose from "mongoose";

export const validate = {
  email: (value: any): boolean => {
    if (typeof value !== "string") return false;
    return /^\S+@\S+\.\S+$/.test(value.trim());
  },

  string: (value: any, minLength = 1): boolean => {
    return typeof value === "string" && value.trim().length >= minLength;
  },

  int: (value: any): boolean => {
    return (
      typeof value === "number" && Number.isInteger(value) && !isNaN(value)
    );
  },

  float: (value: any): boolean => {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
  },

  boolean: (value: any): boolean => {
    return typeof value === "boolean";
  },

  objectId: (value: any): boolean => {
    return mongoose.Types.ObjectId.isValid(value);
  },

  toObjectId: (value: any): mongoose.Types.ObjectId | null => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return null;
    }
    return new mongoose.Types.ObjectId(value);
  },

  required: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return true;
  },

  length: (value: any, min: number, max: number): boolean => {
    if (typeof value !== "string") return false;
    const len = value.trim().length;
    return len >= min && len <= max;
  },
};

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}
