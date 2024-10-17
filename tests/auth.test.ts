import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Redis from "ioredis-mock";
import { closeServer, server } from "../src";
import { userService } from "../src/services";
import { jwtSign } from "../src/utils/jwt";

jest.mock("../src/dataSource", () => ({
	redis: {
		run: jest.fn(),
		client: new Redis(),
	},
	mongoose: {
		run: jest.fn(),
	},
}));

describe("Auth Routes", () => {
	let mongoServer: MongoMemoryServer;

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();
		await mongoose.connect(mongoUri);
	});

	afterAll(async () => {
		await mongoose.disconnect();
		await mongoServer.stop();
		await closeServer();
	});

	beforeEach(async () => {
		await mongoose.connection.dropDatabase();
	});

	describe("POST /api/auth/sign-up", () => {
		it("should create a new user and return an access token", async () => {
			const response = await request(server).post("/api/auth/sign-up").send({
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

			const response = await request(server).post("/api/auth/sign-up").send({
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
			const response = await request(server).post("/api/auth/sign-in").send({
				email: "customer1@example.com",
				password: "customer123",
			});

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveProperty("accessToken");
		});

		it("should return 404 for non-existent user", async () => {
			const response = await request(server).post("/api/auth/sign-in").send({
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

			const response = await request(server)
				.get("/api/auth/sign-out")
				.set("Authorization", `Bearer ${accessToken}`);

			expect(response.status).toBe(200);
		});

		it("should return 401 for unauthenticated request", async () => {
			const response = await request(server).get("/api/auth/sign-out");

			expect(response.status).toBe(401);
		});
	});
});
