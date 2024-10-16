import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { loanService } from "../services/loanService";

export const loanController = {
  viewLoans: async (req: Request, res: Response) => {
    try {
      const loans = await loanService.getAllLoans();
      res.status(StatusCodes.OK).json(loans);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred",
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  },

  viewUserLoans: async (req: Request, res: Response) => {
    try {
      const loans = await loanService.getLoansByUser(req.params.userId);
      res.status(StatusCodes.OK).json(loans);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred",
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  },

  loanBook: async ({ body: { userId, bookId } }: Request, res: Response) => {
    try {
      const loan = await loanService.loanBook({ userId, bookId });
      res.status(StatusCodes.OK).json({
        data: loan,
        message: "Book loaned successfully",
        status: StatusCodes.OK,
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error || "An error occurred",
        status: StatusCodes.BAD_REQUEST,
      });
    }
  },

  returnBook: async ({ body: { loanId } }: Request, res: Response) => {
    try {
      const loan = await loanService.returnBook({ loanId });
      res.status(StatusCodes.OK).json({
        data: loan,
        message: "Book returned successfully",
        status: StatusCodes.OK,
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error || "An error occurred",
        status: StatusCodes.BAD_REQUEST,
      });
    }
  },
};
