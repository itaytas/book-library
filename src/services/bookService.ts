// services/bookService.ts
import { Loan, Book } from "../models";
import { AddBookPayload, IBook, UpdateBookPayload } from "../contracts/book";
import { UserRole } from "../contracts/user";
import { Schema } from "mongoose";

export const bookService = {
	getBooks: async (page: number, limit: number) => {
		const skip = (page - 1) * limit;
		const books = await Book.find().skip(skip).limit(limit);
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

	getBookWithLoanStatus: async (bookId: string) => {
		const book = await Book.findById(bookId);
		if (!book) return null;
		const isLoaned = await Loan.exists({ book: bookId, returned: false });
		return { isLoaned };
	},

	getBookDtoByRole: (book: IBook, role: UserRole) => {
		let bookByRole;
		switch (role) {
			case UserRole.CUSTOMER:
				bookByRole = bookService.getBookDtoForCustomer(book);
				break;

			default:
				bookByRole = book;
				break;
		}
		return bookByRole;
	},

	getBookClosestDueDate: async (bookId: Schema.Types.ObjectId): Promise<Date | null> => {
		const availableAt = await Loan.find({
			book: bookId,
			returned: false,
		})
			.sort({ dueDate: 1 })
			.limit(1)
			.select("dueDate")
			.lean();
		return availableAt.length > 0 ? availableAt[0].dueDate : null;
	},

	getBookDtoForCustomer: async (book: IBook) => {
		let availableAt: Date | null = null;
		if (book.availableCopies === 0) {
			availableAt = await bookService.getBookClosestDueDate(book.id);
		}

		return {
			id: book.id,
			title: book.title,
			author: book.author,
			genre: book.genre,
			rating: book.rating,
			...(book.availableCopies > 0
				? { availableCopies: book.availableCopies }
				: { availableAt }), 
		};
	},
};
