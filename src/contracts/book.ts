import { Model, ObjectId } from 'mongoose';

export interface IBook {
  id: ObjectId;
  title: string;
  author: string;
  genre: string;
  rating: number; // 1 to 5 stars
  availableCopies: number;
  totalCopies: number;
}

export interface IBookMethods {
  checkAvailability: () => boolean;
}

export type BookModel = Model<IBook, unknown, IBookMethods>;

export type AddBookPayload = Required<
  Pick<IBook, 'title' | 'author' | 'genre' | 'rating' | 'totalCopies'>
>;

export type UpdateBookPayload = Partial<
  Pick<IBook, 'title' | 'author' | 'genre' | 'rating' | 'availableCopies'>
>;
