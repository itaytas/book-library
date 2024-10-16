import { Schema, model } from "mongoose";
import { IBook, IBookMethods, BookModel } from "../contracts/book";

const schema = new Schema<IBook, BookModel, IBookMethods>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    availableCopies: { type: Number, required: true },
    totalCopies: { type: Number, required: true },
  },
  { timestamps: true }
);

schema.methods.checkAvailability = function () {
  return this.availableCopies > 0;
};

schema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

export const Book = model<IBook, BookModel>("Book", schema);
