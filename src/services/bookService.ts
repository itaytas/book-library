// services/bookService.ts
import { Loan, Book } from "../models";
import { AddBookPayload, UpdateBookPayload } from "../contracts/book";

export const bookService = {
  getBooks: async (page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const books = await Book.find().skip(skip).limit(limit);
    // TODO: think of another way of pagination
    const totalBooks = await Book.countDocuments();
    return { books, totalBooks };
  },

  getBookById: async (id: string) => {
    return await Book.findById(id);
  },

  addBook: async (payload: AddBookPayload) => {
    const newBook = new Book({ ...payload, availableCopies: payload.totalCopies });
    return await newBook.save();
  },

  updateBook: async (id: string, payload: UpdateBookPayload) => {
    return await Book.findByIdAndUpdate(id, payload, { new: true });
  },

  deleteBook: async (id: string) => {
    return await Book.findByIdAndDelete(id);
  },

  isBookLoaned: async (bookId: string) => {
    const loan = await Loan.findOne({ book: bookId });
    return !!loan;
  },
};
