import supertest from "supertest";
import jwt from "jsonwebtoken";
import { logger } from "../src/app/logging";
import web from "../src/app/web";
import {
  createUserActive,
  createUserInactive,
  loginUser,
  userResetToken,
  userResetTokenExpired,
  deleteAllRefrestToken,
  findUser,
  findUserToken,
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

describe("POST /api/auth/refresh-token", () => {
  let agent: ReturnType<typeof supertest.agent>;
  const loginPayload = {
    email: "john@example.com",
    password: "@Jhone123",
  };
  beforeEach(async () => {
    agent = supertest.agent(web);
    await createUserActive();
  });

  it("should refresh access token successfully", async () => {
    const response = await agent.post("/api/auth/login").send(loginPayload);

    logger.debug(response.body);

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.headers["set-cookie"]).toBeDefined();

    const oldAccessToken = response.body.accessToken;

    const refreshResponse = await agent.post("/api/auth/refresh-token");

    logger.debug(refreshResponse.body);

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.message).toBe("Refresh token successfully");
    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.accessToken).not.toBe(oldAccessToken);
    expect(typeof refreshResponse.body.accessToken).toBe("string");
    expect(refreshResponse.headers["set-cookie"]).toBeDefined();

    const cookies = refreshResponse.headers[
      "set-cookie"
    ] as unknown as string[];

    expect(cookies.some((cookie) => cookie.startsWith("refreshToken="))).toBe(
      true,
    );
    expect(cookies.some((cookie) => cookie.includes("HttpOnly"))).toBe(true);

    const newAccessToken = refreshResponse.body.accessToken;

    expect(newAccessToken).not.toBe(oldAccessToken);

    const decodedToken = jwt.decode(newAccessToken);

    expect(decodedToken).not.toBeNull();
  });

  it("should be able to access protected endpoint using new access token", async () => {
    const loginResponse = await agent
      .post("/api/auth/login")
      .send(loginPayload);

    logger.debug(loginResponse.body);

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toBeDefined();
    expect(loginResponse.body.message).toBe("Welcome John Doe");

    const oldAccessToken = loginResponse.body.accessToken;

    const refreshTokenResponse = await agent.post("/api/auth/refresh-token");

    logger.debug(refreshTokenResponse.body);

    expect(refreshTokenResponse.status).toBe(200);
    expect(refreshTokenResponse.body.message).toBe(
      "Refresh token successfully",
    );
    expect(refreshTokenResponse.body.accessToken).not.toBe(oldAccessToken);
    expect(refreshTokenResponse.body.accessToken).toBeDefined();

    const newAccessToken = refreshTokenResponse.body.accessToken;

    const taskResponse = await agent
      .get("/api/task")
      .set("Authorization", `Bearer ${newAccessToken}`);

    expect(taskResponse.status).toBe(200);
  });

  it("should return 401 when refresh token cookie is missing", async () => {
    const response = await supertest(web).post("/api/auth/refresh-token");

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Refresh token is required");
  });

  it("should reject invalid refresh token", async () => {
    const response = await supertest(web)
      .post("/api/auth/refresh-token")
      .set("Cookie", "refreshToken=invalid-refresh-token");

    logger.debug(response.body);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Refresh token is invalid or expired");
  });

  it("should reject valid JWT that is not stored in database", async () => {
    const loginResponse = await agent
      .post("/api/auth/login")
      .send(loginPayload);

    logger.debug(loginResponse.body);

    expect(loginResponse.status).toBe(200);

    await deleteAllRefrestToken();

    const refreshTokenResponse = await agent.post("/api/auth/refresh-token");

    logger.debug(refreshTokenResponse.body);

    expect(refreshTokenResponse.status).toBe(401);
    expect(refreshTokenResponse.body.accessToken).toBeUndefined();
    expect(refreshTokenResponse.body.message).toBe(
      "Refresh token not found or already used",
    );
  });
});

describe("POST /api/auth/logout", () => {
  let agent: ReturnType<typeof supertest.agent>;
  const loginPayload = {
    email: "john@example.com",
    password: "@Jhone123",
  };
  beforeEach(async () => {
    agent = supertest.agent(web);
    await createUserActive();
  });

  it("should logout successfully", async () => {
    const loginResponse = await agent
      .post("/api/auth/login")
      .send(loginPayload);

    logger.debug(loginResponse.body);
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toBeDefined();
    expect(loginResponse.body.message).toBe("Welcome John Doe");

    const logoutResponse = await agent.post("/api/auth/logout");

    logger.debug(logoutResponse.body);
    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.message).toBe("Logout successfully");
  });

  it("should clear refresh token cookie", async () => {
    const loginResponse = await agent
      .post("/api/auth/login")
      .send(loginPayload);

    expect(loginResponse.status).toBe(200);

    const logoutResponse = await agent.post("/api/auth/logout");

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.headers["set-cookie"]).toBeDefined();

    const cookies = logoutResponse.headers["set-cookie"] as unknown as string[];

    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.startsWith("refreshToken="),
    );

    expect(refreshTokenCookie).toBeDefined();
    expect(
      refreshTokenCookie!.includes("refreshToken=;") ||
        refreshTokenCookie!.includes("Max-Age=0") ||
        refreshTokenCookie!.includes("Expires=Thu, 01 Jan 1970"),
    ).toBe(true);
  });

  it("should delete refresh token from database", async () => {
    const loginResponse = await agent
      .post("/api/auth/login")
      .send(loginPayload);
    logger.debug(loginResponse);

    expect(loginResponse.status).toBe(200);

    const user = await findUser(loginPayload.email);

    expect(user).not.toBeNull();

    const tokenBeforeLogout = await findUserToken(user!.id);

    expect(tokenBeforeLogout).not.toBeNull();

    const logoutResponse = await agent.post("/api/auth/logout");

    expect(logoutResponse.status).toBe(200);

    const tokenAfterLogout = await findUserToken(user!.id);

    expect(tokenAfterLogout).toBeNull();
  });

  it("should not be able to refresh token after logout", async () => {
    const loginResponse = await agent
      .post("/api/auth/login")
      .send(loginPayload);
    logger.debug(loginResponse.body);
    expect(loginResponse.status).toBe(200);

    const logoutResponse = await agent.post("/api/auth/logout");
    logger.debug(logoutResponse.body);
    expect(logoutResponse.status).toBe(200);

    const refreshResponse = await agent.post("/api/auth/refresh-token");
    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body.message).toBe("Refresh token is required");
  });
});
