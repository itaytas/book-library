import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
// import Redis from "ioredis-mock";
import {createClient} from 'redis-mock'
import { createServer } from "..";
import { userService } from "../services";
import { jwtSign } from "../utils/jwt";
import { Application } from "express";

jest.mock("../dataSource", () => ({
	redis: {
		run: jest.fn(),
		client: createClient(),
	},
	mongoose: {
		run: jest.fn(),
	},
}));

describe("Auth Routes", () => {
	let mongoServer: MongoMemoryServer;
	let app: Application;
	let server: any;

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();
		await mongoose.connect(mongoUri);
		app = await createServer();
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

	describe("POST /api/auth/sign-up", () => {
		it("should create a new user and return an access token", async () => {
			const response = await request(app).post("/api/auth/sign-up").send({
				email: "test@example.com",
				password: "password123",
			});

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveProperty("accessToken");
		});

		it("should return 409 if user already exists", async () => {
			await userService.create({
				email: "customer1@example.com",
				password: "$2b$10$zr7LOEFHzx7LmbPFQNrqvuUkngyqxmzgD.dhcFCXjeOdax1Cxgb5e",
				firstName: "Customer",
				lastName: "One",
				role: "customer",
			});

			const response = await request(app).post("/api/auth/sign-up").send({
				email: "customer1@example.com",
				password: "customer123",
			});

			expect(response.status).toBe(409);
		});
	});

	describe("POST /api/auth/sign-in", () => {
		beforeEach(async () => {
			await userService.create({
				email: "customer1@example.com",
				password: "$2b$10$zr7LOEFHzx7LmbPFQNrqvuUkngyqxmzgD.dhcFCXjeOdax1Cxgb5e",
				firstName: "Customer",
				lastName: "One",
				role: "customer",
			});
		});

		it("should sign in a user and return an access token", async () => {
			const response = await request(app).post("/api/auth/sign-in").send({
				email: "customer1@example.com",
				password: "customer123",
			});

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveProperty("accessToken");
		});

		it("should return 404 for non-existent user", async () => {
			const response = await request(app).post("/api/auth/sign-in").send({
				email: "nonexistent@example.com",
				password: "password123",
			});

			expect(response.status).toBe(404);
		});
	});

	describe("GET /api/auth/sign-out", () => {
		it("should sign out a user", async () => {
			const user = await userService.create({
				email: "customer1@example.com",
				password: "$2b$10$zr7LOEFHzx7LmbPFQNrqvuUkngyqxmzgD.dhcFCXjeOdax1Cxgb5e",
				firstName: "Customer",
				lastName: "One",
				role: "customer",
			});
			const { accessToken } = jwtSign(user.id);

			const response = await request(app)
				.get("/api/auth/sign-out")
				.set("Authorization", `Bearer ${accessToken}`);

			expect(response.status).toBe(200);
		});

		it("should return 401 for unauthenticated request", async () => {
			const response = await request(app).get("/api/auth/sign-out");

			expect(response.status).toBe(401);
		});
	});
});
