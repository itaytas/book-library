import { calculateDueDate } from "../utils/calculateDueDate";
import { ILoan, LoanBookPayload, ReturnBookPayload } from "../contracts/loan";
import { Book, Loan } from "../models";

export const loanService = {
	getLoansByUser: async (userId: string) => {
		return await Loan.find({ user: userId });
	},

	getAllLoans: async () => {
		return await Loan.find().populate("book");
	},

	loanBook: async ({ userId, bookId }: LoanBookPayload) => {
		const book = await Book.findById(bookId);
		if (!book || book.availableCopies <= 0) {
			throw new Error("Book not available");
		}

		const dueDate = calculateDueDate(book.rating);

		const loan = new Loan({
			user: userId,
			book: bookId,
			dueDate,
			returned: false,
		});

		book.availableCopies -= 1;
		await book.save();

		return await loan.save();
	},

	returnBook: async ({ loanId }: ReturnBookPayload) => {
		const loan = await Loan.findById(loanId).populate("book");
		if (!loan) {
			throw new Error("Loan not found");
		}

		loan.returned = true;
		const book = loan.book as any;
		book.availableCopies += 1;
		await book.save();

		return await loan.save();
	},

	getLoanDtoForCustomer: (loan: ILoan) => {
		return {
			id: loan.id,
			user: loan.user,
			book: loan.book,
			dueDate: loan.dueDate,
			returned: loan.returned,
		};
	},
};
