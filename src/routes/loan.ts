import { Router } from "express";
import { loanController } from "../controllers";
import { roleGuard } from "../guards";
import { asyncHandler } from "../utils/asyncHandler";

export const loans = (router: Router): void => {
  // Loan a book - Customers only
  router.post("/loans/loan", roleGuard.isCustomer, loanController.loanBook);

  // Return a book - Customers only
  router.post("/loans/return", roleGuard.isCustomer, loanController.returnBook);

  // Employees can view all loaned books
  router.get("/loans", roleGuard.isEmployee, loanController.viewAllLoans);

  // Customers can view only their loaned books
  router.get("/loans/my", roleGuard.isCustomer, loanController.viewMyLoans);
};
