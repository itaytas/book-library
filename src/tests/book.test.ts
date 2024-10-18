import { Application, Request, Response, NextFunction } from "express";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import Redis from "ioredis-mock";
// import {createClient} from 'redis-mock'
import mongoose, { Types } from 'mongoose';
import { createServer } from "..";
import { bookService, loanService, userService } from "../services";
import { jwtSign, jwtVerify } from "../utils/jwt";
import { redis } from "../dataSource";
import { authMiddleware } from "../middlewares";
import { UserRole } from "../contracts/user";

// jest.mock("../middlewares", () => ({
// 	authMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
// 		req.context = {
// 			user: {
// 				id: "67122ad0506974df0cd5a07c",
// 				role: "customer",
// 			},
// 			accessToken:
// 				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MTIyYWQwNTA2OTc0ZGYwY2Q1YTA3YyIsImlhdCI6MTcyOTI0Mzg1NiwiZXhwIjoxNzI5MzMwMjU2fQ.4FQdaXRbF810dBxpdPWLeH8IqlXVBWN0cgsdjWx5mKg",
// 		};
// 		return next();
// 	}),
// }));

jest.mock("../middlewares", () => {
	return {
		authMiddleware: jest.fn(
			(
				req: Request,
				res: Response,
				next: NextFunction,
				userType: "employee" | "customer" = "customer"
			) => {
				if (userType === "employee") {
					req.context = {
						user: {
							id: "671231a3a9749352ed487e3b",
							role: "employee",
						},
						accessToken:
							"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MTIzMWEzYTk3NDkzNTJlZDQ4N2UzYiIsImlhdCI6MTcyOTI0NTYwMywiZXhwIjoxNzI5MzMyMDAzfQ.3UAJaTSbLnwBOTCF0qcm4yINlSh-yMeQMHIeaNKFXUs",
					};
				} else {
					req.context = {
						user: {
							id: "67122ad0506974df0cd5a07c",
							role: "customer",
						},
						accessToken:
							"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MTIyYWQwNTA2OTc0ZGYwY2Q1YTA3YyIsImlhdCI6MTcyOTI0Mzg1NiwiZXhwIjoxNzI5MzMwMjU2fQ.4FQdaXRbF810dBxpdPWLeH8IqlXVBWN0cgsdjWx5mKg",
					};
				}
				return next();
			}
		),
	};
});

jest.mock("../dataSource", () => ({
	redis: {
		run: jest.fn(),
		client: new Redis(),
	},
	mongoose: {
		run: jest.fn(),
	},
}));

describe("Books Routes", () => {
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
			password: "$2b$10$3oLGzaNLrBiVPbJ3zsvWXuf47anj.afWW2iXuPVozxprVLwpedK8m",
			firstName: "Employee",
			lastName: "One",
			role: "employee",
		});
		const customer = await userService.create({
			email: "customer1@example.com",
			password: "$2b$10$zr7LOEFHzx7LmbPFQNrqvuUkngyqxmzgD.dhcFCXjeOdax1Cxgb5e",
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

		if (redis.client) {
			await redis.client.set(`expiredToken:${employeeToken}`, "true");
			await redis.client.set(`expiredToken:${customerToken}`, "true");
		}
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

	describe("GET /api/books", () => {
		it("should allow a customer to view books", async () => {
			await bookService.addBook({
				title: "Moby Dick",
				author: "Herman Melville",
				genre: "Adventure",
				rating: 3,
				totalCopies: 0,
			});

			injectUserToRequest(customerId, customerToken, UserRole.CUSTOMER);

			const headers = { Authorization: `Bearer ${customerToken}` };
			const response = await request(app).get("/api/books").set(headers);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0]).toHaveProperty("title", "Moby Dick");
		});

		it("should allow an employee to view books", async () => {
			await bookService.addBook({
				title: "Moby Dick",
				author: "Herman Melville",
				genre: "Adventure",
				rating: 3,
				totalCopies: 2,
			});

			injectUserToRequest(employeeId, employeeToken, UserRole.EMPLOYEE);

			const headers = { Authorization: `Bearer ${employeeToken}` };
			const response = await request(app).get("/api/books").set(headers);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0]).toHaveProperty("title", "Moby Dick");
		});
	});

	describe("GET /api/books/:id", () => {
		it("should return book details for a customer", async () => {
			const book = await bookService.addBook({
				title: "Moby Dick",
				author: "Herman Melville",
				genre: "Adventure",
				rating: 3,
				totalCopies: 2,
			});

			injectUserToRequest(customerId, customerToken, UserRole.CUSTOMER);

			const headers = { Authorization: `Bearer ${customerToken}` };
			const response = await request(app).get(`/api/books/${book.id}`).set(headers);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("title", "Moby Dick");
		});

		it("should return 404 if book is not found", async () => {
			injectUserToRequest(customerId, customerToken, UserRole.CUSTOMER);

			const headers = { Authorization: `Bearer ${customerToken}` };
			const response = await request(app).get("/api/books/worngId").set(headers);

			expect(response.status).toBe(404);
		});

		it("should return 404 if book is not found", async () => {
			injectUserToRequest(customerId, customerToken, UserRole.CUSTOMER);

			const headers = { Authorization: `Bearer ${customerToken}` };
			const response = await request(app).get("/api/books/60d021d95a632a001c6e1b2b").set(headers);

			expect(response.status).toBe(404);
		});
	});

	describe("PUT /api/books/:id", () => {
		it("should allow an employee to edit a book", async () => {
			const book = await bookService.addBook({
				title: "Moby Dick",
				author: "Herman Melville",
				genre: "Adventure",
				rating: 3,
				totalCopies: 2,
			});
			injectUserToRequest(employeeId, employeeToken, UserRole.EMPLOYEE);
			const headers = { Authorization: `Bearer ${employeeToken}` };

			const response = await request(app)
				.put(`/api/books/${book.id}`)
				.set(headers)
				.send({ title: "Updated Title" });

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveProperty("title", "Updated Title");
		});

		it("should return 403 if a customer tries to edit a book", async () => {
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
				.put(`/api/books/${book.id}`)
				.set(headers)
				.send({ title: "Updated Title" });

			expect(response.status).toBe(403);
		});
	});

	describe("DELETE /api/books/:id", () => {
		it("should allow an employee to delete a book if not loaned", async () => {
			const book = await bookService.addBook({
				title: "Moby Dick",
				author: "Herman Melville",
				genre: "Adventure",
				rating: 3,
				totalCopies: 2,
			});

			injectUserToRequest(employeeId, employeeToken, UserRole.EMPLOYEE);
			const headers = { Authorization: `Bearer ${employeeToken}` };
			const response = await request(app)
				.delete(`/api/books/${book.id}`)
				.set(headers);

			expect(response.status).toBe(204);
		});

		it("should prevent deleting a loaned book", async () => {
			const book = await bookService.addBook({
				title: "Moby Dick",
				author: "Herman Melville",
				genre: "Adventure",
				rating: 3,
				totalCopies: 2,
			});

			const loan = await loanService.loanBook({userId: employeeObjectId, bookId: book._id})

			injectUserToRequest(employeeId, employeeToken, UserRole.EMPLOYEE);
			const headers = { Authorization: `Bearer ${employeeToken}` };

			const response = await request(app)
				.delete(`/api/books/${book.id}`)
				.set(headers);

			expect(response.status).toBe(409);
			expect(response.body.message).toBe("Cannot delete loaned book");
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
