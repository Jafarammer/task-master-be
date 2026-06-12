import supertest from "supertest";
import { logger } from "../src/app/logging";
import web from "../src/app/web";
import { createUserActive, createUserInactive } from "./test-utils";

describe("Health Check", () => {
  it("should return OK", async () => {
    const response = await supertest(web).get("/health");
    logger.debug(response.body);
    expect(response.status).toBe(200);
  });
});

describe("POST /api/auth/register", () => {
  it("should register user", async () => {
    const response = await supertest(web).post("/api/auth/register").send({
      fullName: "Jhone Doe",
      email: "jhon@example.com",
      password: "@Jhondoe123",
      confirmPassword: "@Jhondoe123",
    });
    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe(
      "Registered successfully. Check your email to activate account.",
    );
  });

  it("should register user full name is invalid", async () => {
    const response = await supertest(web).post("/api/auth/register").send({
      fullName: null,
      email: "jhon@example.com",
      password: "@Jhondoe123",
      confirmPassword: "@Jhondoe123",
    });
    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("fullName is required");
  });

  it("should register user email is invalid", async () => {
    const response = await supertest(web).post("/api/auth/register").send({
      fullName: "Jhone Doe",
      email: "jhon@example",
      password: "@Jhondoe123",
      confirmPassword: "@Jhondoe123",
    });
    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email format not valid");
  });

  it("should register user password is invalid", async () => {
    const response = await supertest(web).post("/api/auth/register").send({
      fullName: "Jhone Doe",
      email: "jhon@example.com",
      password: "12345678",
      confirmPassword: "12345678",
    });
    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Password must contain uppercase letters, lowercase letters, numbers, and special characters.",
    );
  });

  it("should register user password is not match with confirm password", async () => {
    const response = await supertest(web).post("/api/auth/register").send({
      fullName: "Jhone Doe",
      email: "jhon@example.com",
      password: "@JhoneDoe123",
      confirmPassword: "@JhoneDoe321",
    });
    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Password and confirm password not match",
    );
  });

  it("should register user is user registered", async () => {
    await createUserActive();
    const response = await supertest(web).post("/api/auth/register").send({
      fullName: "Jhone Doe",
      email: "john@example.com",
      password: "@Jhone123",
      confirmPassword: "@Jhone123",
    });
    logger.debug(response.body);
    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Email already registered");
  });
});

describe("POST /api/auth/login", () => {
  it("should login successfully", async () => {
    await createUserActive();
    const response = await supertest(web).post("/api/auth/login").send({
      email: "john@example.com",
      password: "@Jhone123",
    });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.message).toBe("Welcome John Doe");
  });

  it("should login rejected is email or password is invalid", async () => {
    await createUserActive();
    const response = await supertest(web).post("/api/auth/login").send({
      email: "johne@example.com",
      password: "@Jhone321",
    });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.accessToken).toBeUndefined();
    expect(response.body.message).toBe("Email or password is invalid");
  });

  it("should login rejected is email not activated", async () => {
    await createUserInactive();
    const response = await supertest(web).post("/api/auth/login").send({
      email: "john@example.com",
      password: "@Jhone123",
    });

    logger.debug(response.body);
    expect(response.status).toBe(403);
    expect(response.body.accessToken).toBeUndefined();
    expect(response.body.message).toBe(
      "Please activate your account via email",
    );
  });
});
