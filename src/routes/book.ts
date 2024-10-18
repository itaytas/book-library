import { Router } from "express";
import { bookController } from "../controllers";
import { authGuard, roleGuard } from "../guards";

export const books = (router: Router): void => {
	// Customers: View book availability (all books, but only availability details)
	// Employees: Can view and edit book details
	router.get("/books", authGuard.isAuth, bookController.viewBooks);

	// Customers: Can view specific book availability and when it will be available
	// Employees: Can view specific book details
	router.get("/books/:id", authGuard.isAuth, bookController.viewBookDetails);

	// Employees can edit book details
	router.put("/books/:id", roleGuard.isEmployee, bookController.editBook);

	// Employees: Delete a book (assumption: deleting allowed, but not if it's loaned)
	router.delete("/books/:id", roleGuard.isEmployee, bookController.deleteBook);
};
