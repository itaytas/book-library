import { Router } from "express";
import { bookController } from "../controllers";
import { roleGuard } from "../guards";

export const books = (router: Router): void => {
  // View all books - Customers can only view availability, Employees can edit details
  router.get("/books", roleGuard.isCustomer, bookController.viewBooks);
  router.get("/books/:id", roleGuard.isCustomer, bookController.viewBookDetails);

  // Employees can edit book details
  router.put("/books/:id", roleGuard.isEmployee, bookController.editBook);

  // Prevent deletion of loaned books
  router.delete("/books/:id", roleGuard.isEmployee, bookController.deleteBook);
};
