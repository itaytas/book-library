import { LoanDueDate } from "../constants";
import { LoanBookPayload, ReturnBookPayload } from "../contracts/loan";
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

    const dueDate = loanService.calculateDueDate(book.rating);

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

  calculateDueDate: (rating: number): Date => {
    const currentDate = new Date();
    let days = 0;

    switch (rating) {
      case 5:
        days = LoanDueDate.Rating5;
        break;
      case 4:
        days = LoanDueDate.Rating4;
        break;
      default:
        days = LoanDueDate.DefaultRating;
        break;
    }

    currentDate.setDate(currentDate.getDate() + days);
    return currentDate;
  },
};
