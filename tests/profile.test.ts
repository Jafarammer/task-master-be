import supertest from "supertest";
import { logger } from "../src/app/logging";
import web from "../src/app/web";
import { loginUser, deleteUser } from "./test-utils";

describe("GET /api/profile", () => {
  let token: string;
  let user: any;

  beforeEach(async () => {
    const login = await loginUser();
    token = login.token;
    user = login.user;
  });

  it("should get profile user successfully", async () => {
    const response = await supertest(web)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(user._id).toBeDefined();
    expect(response.body.message).toBe("Fetch profile successfully");
    expect(response.body.data.fullName).toBe(user.full_name);
    expect(response.body.data.email).toBe(user.email);
    expect(response.body.data.profilePicture).toBe(user.profile_picture);
  });

  it("should return 404 if user not found", async () => {
    await deleteUser(user._id);

    const response = await supertest(web)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("should get profile user is token invalid", async () => {
    const response = await supertest(web)
      .get("/api/profile")
      .set("Authorization", `Bearer token-invalid`);

    logger.debug(response.body);
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Invalid or expired token");
  });

  it("should get profile user token is missing", async () => {
    const response = await supertest(web).get("/api/profile");

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });
});
