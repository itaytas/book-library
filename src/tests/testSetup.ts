import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Redis from "ioredis-mock";
import "dotenv/config";
import { createServer } from ".."; 
import { Application } from "express";

// Mock Redis
jest.mock("../src/dataSource", () => ({
    redis: {
        run: jest.fn(),
        client: new Redis(),
    },
    mongoose: {
        run: jest.fn(),
    },
}));

let mongoServer: MongoMemoryServer;
let server: Application;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    // if (server) {
    //     await new Promise((resolve) => server.close(resolve));
    // }
});

beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    
    // Create a new server with a random port for each test
    const PORT = Math.floor(3000 + Math.random() * 5000);
    process.env.PORT = PORT.toString();
    server = await createServer();
});

afterEach(async () => {
    // if (server) {
    //     await new Promise((resolve) => server.close(resolve));
    // }
});