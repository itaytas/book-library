import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { bookService } from "../services/bookService";
import { isValidObjectId } from "mongoose";
import { UserRole } from "../contracts/user";
import { IUserRequest } from "../contracts/request";

export const bookController = {
	viewBooks: async ({ context, query: { page = "1", limit = "10" } }: Request, res: Response) => {
		try {
			const { user } = context as IUserRequest;
			const pageNumber = parseInt(page.toString(), 10);
			const limitNumber = parseInt(limit.toString(), 10);
			const { books, totalBooks } = await bookService.getBooks(pageNumber, limitNumber);
			const totalPages = Math.ceil(totalBooks / limitNumber);

			res.status(StatusCodes.OK).json({
				data: user.role === UserRole.CUSTOMER ? books.map(bookService.getBookDtoForCustomer) : books,
				pagination: {
					currentPage: pageNumber,
					totalPages,
					totalBooks,
					limit: limitNumber,
				},
				message: "Books retrieved successfully",
				status: StatusCodes.OK,
			});
		} catch (error) {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: "An error occurred",
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	},

	viewBookDetails: async ({ context, params: { id } }: Request, res: Response) => {
		try {
			const { user } = context as IUserRequest;
			const book = await bookService.getBookById(id);
			if (!book) {
				res.status(StatusCodes.NOT_FOUND).json({ message: "Book not found" });
				return;
			}
			res.status(StatusCodes.OK).json(
				user.role === UserRole.CUSTOMER ? bookService.getBookDtoForCustomer(book) : book
			);
		} catch (error) {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: "An error occurred",
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	},

	editBook: async ({ params: { id }, body }: Request, res: Response) => {
		try {
			const book = await bookService.updateBook(id, body);
			if (!book) {
				res.status(StatusCodes.NOT_FOUND).json({
					message: "Book not found",
					status: StatusCodes.NOT_FOUND,
				});
				return;
			}
			res.status(StatusCodes.OK).json({
				data: book,
				message: "Book updated successfully",
				status: StatusCodes.OK,
			});
		} catch (error) {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: "An error occurred",
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	},

	deleteBook: async ({ params: { id } }: Request, res: Response) => {
		try {
			if (!isValidObjectId(id)) {
				res.status(StatusCodes.BAD_REQUEST).json({
					message: "Invalid book ID",
					status: StatusCodes.BAD_REQUEST,
				});
				return;
			}

			const bookInfo = await bookService.getBookWithLoanStatus(id);

			if (!bookInfo) {
				res.status(StatusCodes.NOT_FOUND).json({
					message: "Book not found",
					status: StatusCodes.NOT_FOUND,
				});
				return;
			}

			if (bookInfo.isLoaned) {
				res.status(StatusCodes.CONFLICT).json({
					message: "Cannot delete loaned book",
					status: StatusCodes.CONFLICT,
				});
				return;
			}

			await bookService.deleteBook(id);
			res.status(StatusCodes.NO_CONTENT).send();
		} catch (error) {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: "An error occurred",
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	},
};
