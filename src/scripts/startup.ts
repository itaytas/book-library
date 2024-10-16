import bcrypt from "bcrypt";
import { User, Book, Loan } from "../models";
import { logger } from "../infrastructure";
import { UserRole } from "../contracts/user";

export async function seedStartupData() {
  try {
    // Seed Users
    const existingUsers = await User.find();
    if (existingUsers.length === 0) {
      logger.info("No users found. Creating default users...");

      const users = [
        {
          email: "customer1@example.com",
          password: await bcrypt.hash("customer123", 10),
          role: UserRole.CUSTOMER,
          firstName: "Customer",
          lastName: "One",
        },
        {
          email: "customer2@example.com",
          password: await bcrypt.hash("customer123", 10),
          role: UserRole.CUSTOMER,
          firstName: "Customer",
          lastName: "Two",
        },
        {
          email: "employee1@example.com",
          password: await bcrypt.hash("employee123", 10),
          role: UserRole.EMPLOYEE,
          firstName: "Employee",
          lastName: "One",
        },
        {
          email: "employee2@example.com",
          password: await bcrypt.hash("employee123", 10),
          role: UserRole.EMPLOYEE,
          firstName: "Employee",
          lastName: "Two",
        },
      ];

      await User.insertMany(users);
      logger.info("Default users created successfully.");
    } else {
      logger.info("Users already exist in the database. Skipping user seeding.");
    }

    // Seed Books
    const existingBooks = await Book.find();
    if (existingBooks.length === 0) {
      logger.info("No books found. Creating default books...");

      const books = [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          genre: "Fiction",
          rating: 5,
          totalCopies: 5,
          availableCopies: 5,
        },
        {
          title: "1984",
          author: "George Orwell",
          genre: "Dystopian",
          rating: 4,
          totalCopies: 3,
          availableCopies: 3,
        },
        {
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          genre: "Fiction",
          rating: 5,
          totalCopies: 4,
          availableCopies: 4,
        },
        {
          title: "Moby Dick",
          author: "Herman Melville",
          genre: "Adventure",
          rating: 3,
          totalCopies: 2,
          availableCopies: 2,
        },
      ];

      await Book.insertMany(books);
      logger.info("Default books created successfully.");
    } else {
      logger.info("Books already exist in the database. Skipping book seeding.");
    }

    // Seed Loans
    const existingLoans = await Loan.find();
    if (existingLoans.length === 0) {
      logger.info("No loans found. Creating default loans...");

      // Fetch some customers and books for creating loan records
      const customers = await User.find({ role: UserRole.CUSTOMER });
      console.log("🚀 ~ seedStartupData ~ customers:", customers.length)
      const books = await Book.find();
      console.log("🚀 ~ seedStartupData ~ books:", books.length)

      if (customers.length > 0 && books.length > 0) {
        const loans = [
          {
            user: customers[0]._id,
            book: books[0]._id,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
            returned: false,
          },
          {
            user: customers[1]._id,
            book: books[1]._id,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            returned: false,
          },
        ];

        await Loan.insertMany(loans);
        logger.info("Default loans created successfully.");
      } else {
        logger.warn("Not enough customers or books available to create loans.");
      }
    } else {
      logger.info("Loans already exist in the database. Skipping loan seeding.");
    }
  } catch (error) {
    logger.error("Error seeding data: ", error);
  }
}
