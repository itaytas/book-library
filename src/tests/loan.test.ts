import { Application, Request, Response, NextFunction } from "express";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import Redis from "ioredis-mock";
import mongoose, { Types } from "mongoose";
import { createServer } from "..";
import { bookService, loanService, userService } from "../services";
import { jwtSign } from "../utils/jwt";
import { redis } from "../dataSource";
import { authMiddleware } from "../middlewares";
import { UserRole } from "../contracts/user";

jest.mock("../middlewares", () => ({
	authMiddleware: jest.fn(
		(req: Request, res: Response, next: NextFunction, userType: "employee" | "customer" = "customer") => {
			if (userType === "employee") {
				req.context = {
					user: {
						id: "671231a3a9749352ed487e3b",
						role: "employee",
					},
					accessToken: "employee-token",
				};
			} else {
				req.context = {
					user: {
						id: "67122ad0506974df0cd5a07c",
						role: "customer",
					},
					accessToken: "customer-token",
				};
			}
			return next();
		}
	),
}));

jest.mock("../dataSource", () => ({
	redis: {
		run: jest.fn(),
		client: new Redis(),
	},
	mongoose: {
		run: jest.fn(),
	},
}));

describe("Loan Routes", () => {
	let mongoServer: MongoMemoryServer;
	let app: Application;
	let server: any;
    let employeeToken: string = "";
	let customerToken: string = "";
	let employeeId: string = "";
	let employeeObjectId: Types.ObjectId;
	let customerId: string = "";
	let customerObjectId: Types.ObjectId;

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();
		await mongoose.connect(mongoUri);
		app = await createServer();

		const employee = await userService.create({
			email: "employee1@example.com",
			password: "password",
			firstName: "Employee",
			lastName: "One",
			role: "employee",
		});
		const customer = await userService.create({
			email: "customer1@example.com",
			password: "password",
			firstName: "Customer",
			lastName: "One",
			role: "customer",
		});

		employeeId = employee.id;
		employeeObjectId = employee._id;
		employeeToken = jwtSign(employee.id).accessToken;

		customerId = customer.id;
		customerObjectId = customer._id;
		customerToken = jwtSign(customer.id).accessToken;
	});

	afterAll(async () => {
		await mongoose.disconnect();
		await mongoServer.stop();
		if (server) {
			await new Promise((resolve) => server.close(resolve));
		}
	});

	beforeEach(async () => {
		await mongoose.connection.dropDatabase();
		const PORT = Math.floor(3000 + Math.random() * 5000);
		server = app.listen(PORT);
	});

	afterEach(async () => {
		if (server) {
			await new Promise((resolve) => server.close(resolve));
		}
	});

	describe("POST /api/loans/loan", () => {
		it("should allow a customer to loan a book", async () => {
			const book = await bookService.addBook({
				title: "Moby Dick",
				author: "Herman Melville",
				genre: "Adventure",
				rating: 3,
				totalCopies: 2,
			});

			injectUserToRequest(customerId, customerToken, UserRole.CUSTOMER);

			const headers = { Authorization: `Bearer ${customerToken}` };
			const response = await request(app)
				.post("/api/loans/loan")
				.set(headers)
				.send({ bookId: book.id });

			expect(response.status).toBe(200);
			expect(response.body.message).toBe("Book loaned successfully");
		});

		it("should return 400 if the book is not available", async () => {
			const book = await bookService.addBook({
				title: "Unavailable Book",
				author: "Author",
				genre: "Genre",
				rating: 4,
				totalCopies: 0,
			});

			injectUserToRequest(customerId, customerToken, UserRole.CUSTOMER);

			const headers = { Authorization: `Bearer ${customerToken}` };
			const response = await request(app)
				.post("/api/loans/loan")
				.set(headers)
				.send({ bookId: book.id });

			expect(response.status).toBe(400);
			expect(response.body.message).toBe("Book not available");
		});
	});

	describe("POST /api/loans/return", () => {
		it("should allow a customer to return a book", async () => {
			const book = await bookService.addBook({
				title: "Moby Dick",
				author: "Herman Melville",
				genre: "Adventure",
				rating: 3,
				totalCopies: 2,
			});

			const loan = await loanService.loanBook({ userId: customerObjectId, bookId: book._id });

			injectUserToRequest(customerId, customerToken, UserRole.CUSTOMER);

			const headers = { Authorization: `Bearer ${customerToken}` };
			const response = await request(app)
				.post("/api/loans/return")
				.set(headers)
				.send({ loanId: loan.id });

			expect(response.status).toBe(200);
			expect(response.body.message).toBe("Book returned successfully");
		});
	});

	describe("GET /api/loans/my", () => {
		it("should allow a customer to view their loans", async () => {
			const book = await bookService.addBook({
				title: "Moby Dick",
				author: "Herman Melville",
				genre: "Adventure",
				rating: 3,
				totalCopies: 2,
			});

			await loanService.loanBook({ userId: customerObjectId, bookId: book._id });

			injectUserToRequest(customerId, customerToken, UserRole.CUSTOMER);

			const headers = { Authorization: `Bearer ${customerToken}` };
			const response = await request(app).get("/api/loans/my").set(headers);

			expect(response.status).toBe(200);
			expect(response.body).toHaveLength(1);
			expect(response.body[0]).toHaveProperty("book", book._id.toString());
		});
	});

	describe("GET /api/loans", () => {
		it("should allow an employee to view all loans", async () => {
			injectUserToRequest(employeeId, employeeToken, UserRole.EMPLOYEE);

			const headers = { Authorization: `Bearer ${employeeToken}` };
			const response = await request(app).get("/api/loans").set(headers);

			expect(response.status).toBe(200);
		});
	});
});

function injectUserToRequest(userId: string, accessToken: string, role: UserRole) {
	(authMiddleware as jest.Mock).mockImplementation((req: Request, res: Response, next: NextFunction) => {
		req.context = {
			user: {
				id: userId,
				role: role,
			},
			accessToken: accessToken,
		};
		return next();
	});
}
