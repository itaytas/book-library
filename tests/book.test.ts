import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { closeServer, server } from "../src";
import { bookService, userService } from "../src/services";
import { jwtSign } from "../src/utils/jwt";

describe("Books Routes", () => {
	let mongoServer: MongoMemoryServer;
	let employeeToken: string;
	let customerToken: string;

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();
		await mongoose.connect(mongoUri);

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

		employeeToken = jwtSign(employee.id).accessToken;
		customerToken = jwtSign(customer.id).accessToken;
	});

	afterAll(async () => {
		await mongoose.disconnect();
		await mongoServer.stop();
        await closeServer();
	});

	beforeEach(async () => {
		await mongoose.connection.dropDatabase();
	});

	describe("GET /api/books", () => {
		it("should allow a customer to view books", async () => {
			await bookService.addBook({
				title: "Moby Dick",
				author: "Herman Melville",
				genre: "Adventure",
				rating: 3,
				totalCopies: 2,
			});

			const response = await request(server)
				.get("/api/books")
				.set("Authorization", `Bearer ${customerToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0]).toHaveProperty("title", "Book 1");
		});

		it("should allow an employee to view books", async () => {
            await bookService.addBook({
				title: "Moby Dick",
				author: "Herman Melville",
				genre: "Adventure",
				rating: 3,
				totalCopies: 2,
			});

			const response = await request(server)
				.get("/api/books")
				.set("Authorization", `Bearer ${employeeToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0]).toHaveProperty("title", "Book 1");
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

			const response = await request(server)
				.get(`/api/books/${book.id}`)
				.set("Authorization", `Bearer ${customerToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("title", "Book 1");
		});

		it("should return 404 if book is not found", async () => {
			const response = await request(server)
				.get("/api/books/60d021d95a632a001c6e1b2b")
				.set("Authorization", `Bearer ${customerToken}`);

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


			const response = await request(server)
				.put(`/api/books/${book.id}`)
				.set("Authorization", `Bearer ${employeeToken}`)
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

			const response = await request(server)
				.put(`/api/books/${book.id}`)
				.set("Authorization", `Bearer ${customerToken}`)
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

			const response = await request(server)
				.delete(`/api/books/${book.id}`)
				.set("Authorization", `Bearer ${employeeToken}`);

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

			const response = await request(server)
				.delete(`/api/books/${book.id}`)
				.set("Authorization", `Bearer ${employeeToken}`);

			expect(response.status).toBe(409);
			expect(response.body.message).toBe("Cannot delete loaned book");
		});
	});
});
