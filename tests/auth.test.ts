import User from "../src/models/user.model";
import supertest from "supertest";
import { logger } from "../src/app/logging";
import web from "../src/app/web";
import {
  createUserActive,
  createUserInactive,
  loginUser,
  userResetToken,
  userResetTokenExpired,
} from "./test-utils";

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

describe("POST /api/auth/forgot-password", () => {
  beforeEach(async () => {
    await createUserActive();
  });
  it("should forgot password successfully", async () => {
    const response = await supertest(web)
      .post("/api/auth/forgot-password")
      .send({
        email: "john@example.com",
      });

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Reset password email sent");
  });

  it("should forgot password email is invalid", async () => {
    const response = await supertest(web)
      .post("/api/auth/forgot-password")
      .send({
        email: "john@example",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email format not valid");
  });

  it("should forgot password user is not found", async () => {
    const response = await supertest(web)
      .post("/api/auth/forgot-password")
      .send({
        email: "johneee@example.com",
      });

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });
});

describe("PATCH /api/auth/change-password", () => {
  let token: string;

  beforeEach(async () => {
    const login = await loginUser();
    token = login.token;
  });

  it("should change password successfully", async () => {
    const response = await supertest(web)
      .patch("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "@Jhone123",
        newPassword: "@Jhondoe321",
        confirmPassword: "@Jhondoe321",
      });

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Password changed successfully");
    expect(response.body.data.requireRelogin).toBe(true);
  });

  it("should change password is currentPassword incorect", async () => {
    const response = await supertest(web)
      .patch("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "@Jhone1234",
        newPassword: "@Jhondoe321",
        confirmPassword: "@Jhondoe321",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Current password is incorrect");
  });

  it("should change password is new password and confirm password not match", async () => {
    const response = await supertest(web)
      .patch("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "@Jhone123",
        newPassword: "@Jhondoe321",
        confirmPassword: "@Jhondoe3212",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "New password and confirm password not match",
    );
  });
});

describe("POST /api/auth/reset-password", () => {
  it("should reset password successfully", async () => {
    const user = await userResetToken();

    const response = await supertest(web)
      .post("/api/auth/reset-password")
      .send({
        token: user.token,
        newPassword: "@Jhone321",
        confirmPassword: "@Jhone321",
      });

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Password reset successfully");
  });

  it("should reset password expired", async () => {
    const user = await userResetTokenExpired();

    const response = await supertest(web)
      .post("/api/auth/reset-password")
      .send({
        token: user.reset_password_token,
        newPassword: "@Jhone321",
        confirmPassword: "@Jhone321",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Reset password expired");
  });

  it("should reset password token is invalid", async () => {
    await userResetToken();

    const response = await supertest(web)
      .post("/api/auth/reset-password")
      .send({
        token: "xxxxxxxx",
        newPassword: "@Jhone321",
        confirmPassword: "@Jhone321",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid reset token");
  });

  it("should reset password current password is same new password", async () => {
    const user = await userResetToken();

    const response = await supertest(web)
      .post("/api/auth/reset-password")
      .send({
        token: user.token,
        newPassword: "OldPassword123!",
        confirmPassword: "OldPassword123!",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "New password cannot be the same as current password",
    );
  });

  it("should reset password is invalid", async () => {
    const user = await userResetToken();

    const response = await supertest(web)
      .post("/api/auth/reset-password")
      .send({
        token: user.token,
        newPassword: "12345678",
        confirmPassword: "12345678",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Password must contain uppercase letters, lowercase letters, numbers, and special characters.",
    );
  });

  it("should reset password, new password and confirm password not match", async () => {
    const user = await userResetToken();

    const response = await supertest(web)
      .post("/api/auth/reset-password")
      .send({
        token: user.token,
        newPassword: "@Jhone321",
        confirmPassword: "@Jhone123",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "New password and confirm password not match",
    );
  });
});
