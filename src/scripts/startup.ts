import bcrypt from "bcrypt";
import { User } from "../models";
import { logger } from "../infrastructure";
import { UserRole } from "../contracts/user";

export async function seedUsers() {
    try {
      // Check if there are any users in the database
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
        logger.info("Users already exist in the database. Skipping seeding.");
      }
    } catch (error) {
      logger.error("Error seeding users: ", error);
    }
  }