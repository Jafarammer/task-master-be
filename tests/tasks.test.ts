import supertest from "supertest";
import { logger } from "../src/app/logging";
import web from "../src/app/web";
import { loginUser } from "./test-utils";

describe("POST /api/task", () => {
  let token: string;
  let user: any;

  beforeEach(async () => {
    const login = await loginUser();
    token = login.token;
    user = login.user;
  });

  it("should be able create new task", async () => {
    const response = await supertest(web)
      .post("/api/task")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "test",
        description: "test",
        startDate: "2026-06-23",
        endDate: "2026-06-23",
        priority: "high",
      });
    logger.debug(response.body);
    expect(user._id).toBeDefined();
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Create task successfully");
  });

  it("should reject task creation when title is missing", async () => {
    const response = await supertest(web)
      .post("/api/task")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: null,
        description: "test",
        startDate: "2026-06-23",
        endDate: "2026-06-23",
        priority: "high",
      });
    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Title is required");
  });

  it("should reject task creation when description is missing", async () => {
    const response = await supertest(web)
      .post("/api/task")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "test",
        description: null,
        startDate: "2026-06-23",
        endDate: "2026-06-23",
        priority: "high",
      });
    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Description is required");
  });

  it("should reject task creation when start date  is invalid", async () => {
    const response = await supertest(web)
      .post("/api/task")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "test",
        description: "test",
        startDate: "2026-06-02",
        endDate: "2026-06-23",
        priority: "high",
      });
    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Date cannot be earlier than today");
  });

  it("should reject task creation when end date  is invalid", async () => {
    const response = await supertest(web)
      .post("/api/task")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "test",
        description: "test",
        startDate: "2026-06-23",
        endDate: "2026-06-02",
        priority: "high",
      });
    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Date cannot be earlier than today");
  });

  it("should reject task creation when end date  is greater than start date", async () => {
    const response = await supertest(web)
      .post("/api/task")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "test",
        description: "test",
        startDate: "2026-06-23",
        endDate: "2026-06-22",
        priority: "high",
      });
    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "End date must be greater than start date",
    );
  });

  it("should reject task creation when token is missing", async () => {
    const response = await supertest(web)
      .post("/api/task")
      // .set("Authorization", `Bearer ${token}`)
      .send({
        title: "test",
        description: "test",
        startDate: "2026-06-23",
        endDate: "2026-06-23",
        priority: "high",
      });
    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  it("should reject task creation when token is invalid", async () => {
    const response = await supertest(web)
      .post("/api/task")
      .set("Authorization", `Bearer invalid-token`)
      .send({
        title: "test",
        description: "test",
        startDate: "2026-06-23",
        endDate: "2026-06-23",
        priority: "high",
      });
    logger.debug(response.body);
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Invalid or expired token");
  });
});
