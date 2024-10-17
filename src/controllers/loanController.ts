import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { loanService } from "../services";
import { IUserRequest } from "../contracts/request";
import { UserRole } from "../contracts/user";

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

	viewMyLoans: async (req: Request, res: Response) => {
		const { user } = req.context as IUserRequest;
		loanController.viewLoansByUserIdAndRole(res, user.id, user.role);
	},

	viewUserLoans: async ({ params: { userId } }: Request, res: Response) => {
		loanController.viewLoansByUserIdAndRole(res, userId);
	},

	viewLoansByUserIdAndRole: async (res: Response, userId: string, role: UserRole = UserRole.EMPLOYEE) => {
		try {
			const loans = await loanService.getLoansByUser(userId);
			res.status(StatusCodes.OK).json(
				role === UserRole.CUSTOMER ? loans.map(loanService.getLoanDtoForCustomer) : loans
			);
		} catch (error) {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: "An error occurred",
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
	},

	loanBook: async ({ context, body: { bookId } }: Request, res: Response) => {
		try {
			const { user } = context as IUserRequest;
			const userId = user.id;
			// const { bookId } = req.body;
			const loan = await loanService.loanBook({ userId, bookId });
			res.status(StatusCodes.OK).json({
				data: user.role === UserRole.CUSTOMER ? loanService.getLoanDtoForCustomer(loan) : loan,
				message: "Book loaned successfully",
				status: StatusCodes.OK,
			});
		} catch (error) {
			res.status(StatusCodes.BAD_REQUEST).json({
				message: (error as Error).message || "An error occurred",
				status: StatusCodes.BAD_REQUEST,
			});
		}
	},

	returnBook: async ({ body: { loanId } }: Request, res: Response) => {
		try {
			const loan = await loanService.returnBook({ loanId });
			res.status(StatusCodes.OK).json({
				data: { loanId: loan.id, user: loan.user, returned: loan.returned },
				message: "Book returned successfully",
				status: StatusCodes.OK,
			});
		} catch (error) {
			res.status(StatusCodes.BAD_REQUEST).json({
				message: (error as Error).message || "An error occurred",
				status: StatusCodes.BAD_REQUEST,
			});
		}
	},
};
