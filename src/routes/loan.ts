import { Router } from "express";
import { loanController } from "../controllers";
import { roleGuard } from "../guards";

export const loans = (router: Router): void => {
	// Customers: Loan a book
	router.post("/loans/loan", roleGuard.isCustomer, loanController.loanBook);

	// Customers: Return a book
	router.post("/loans/return", roleGuard.isCustomer, loanController.returnBook);

	// Customers: View only their loaned books
	router.get("/loans/my", roleGuard.isCustomer, loanController.viewMyLoans);

	// Employees: View all loaned books
	router.get("/loans", roleGuard.isEmployee, loanController.viewLoans);
};
