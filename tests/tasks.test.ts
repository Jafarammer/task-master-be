import supertest from "supertest";
import { logger } from "../src/app/logging";
import web from "../src/app/web";
import { loginUser, createTask, softDeleteTask } from "./test-utils";

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

describe("GET /api/task", () => {
  let token: string;
  let user: any;

  beforeEach(async () => {
    const login = await loginUser();
    token = login.token;
    user = login.user;
    await createTask(user._id);
  });

  it("should be able get task successfully", async () => {
    const response = await supertest(web)
      .get("/api/task")
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(user._id).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.metaData.page).toBe(1);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(1);
    expect(response.body.metaData.totalPages).toBe(1);
    expect(response.body.message).toBe("Get task successfully");
  });

  it("should be able search task using title", async () => {
    const response = await supertest(web)
      .get("/api/task")
      .set("Authorization", `Bearer ${token}`)
      .query({
        query: "Test",
      });

    logger.debug(response.body);
    expect(user._id).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.metaData.page).toBe(1);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(1);
    expect(response.body.metaData.totalPages).toBe(1);
    expect(response.body.message).toBe("Get task successfully");
  });

  it("should be able search task using description", async () => {
    const response = await supertest(web)
      .get("/api/task")
      .set("Authorization", `Bearer ${token}`)
      .query({
        query: "description",
      });

    logger.debug(response.body);
    expect(user._id).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.metaData.page).toBe(1);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(1);
    expect(response.body.metaData.totalPages).toBe(1);
    expect(response.body.message).toBe("Get task successfully");
  });

  it("should be able search task no result", async () => {
    const response = await supertest(web)
      .get("/api/task")
      .set("Authorization", `Bearer ${token}`)
      .query({
        query: "halooooo",
      });

    logger.debug(response.body);
    expect(user._id).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(0);
    expect(response.body.metaData.page).toBe(1);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(0);
    expect(response.body.metaData.totalPages).toBe(0);
    expect(response.body.message).toBe("Get task successfully");
  });

  it("should be able get task with paging & limit", async () => {
    const response = await supertest(web)
      .get("/api/task")
      .set("Authorization", `Bearer ${token}`)
      .query({
        page: 2,
        limit: 5,
      });

    logger.debug(response.body);
    expect(user._id).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(0);
    expect(response.body.metaData.page).toBe(2);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(1);
    expect(response.body.metaData.totalPages).toBe(1);
    expect(response.body.message).toBe("Get task successfully");
  });

  it("should be able get task with all params", async () => {
    const response = await supertest(web)
      .get("/api/task")
      .set("Authorization", `Bearer ${token}`)
      .query({
        page: 1,
        limit: 5,
        sortBy: "createdAt",
        order: "desc",
        query: "Tes",
      });

    logger.debug(response.body);
    expect(user._id).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.metaData.page).toBe(1);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(1);
    expect(response.body.metaData.totalPages).toBe(1);
    expect(response.body.message).toBe("Get task successfully");
  });
});

describe("PATCH /api/task/:id", () => {
  let token: string;
  let user: any;

  beforeEach(async () => {
    const login = await loginUser();
    token = login.token;
    user = login.user;
  });

  it("should be able update task", async () => {
    const task = await createTask(user._id);
    const response = await supertest(web)
      .patch(`/api/task/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Update task",
        description: "xxxxx",
        startDate: "2026-06-23",
        endDate: "2026-06-23",
        priority: "low",
      });

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(user._id).toBeDefined();
    expect(task._id).toBeDefined();
    expect(response.body.message).toBe("Update task successfully");
  });

  it("should reject update task when title is missing", async () => {
    const task = await createTask(user._id);
    const response = await supertest(web)
      .patch(`/api/task/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: null,
        description: "xxxxx",
        startDate: "2026-06-23",
        endDate: "2026-06-23",
        priority: "low",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(user._id).toBeDefined();
    expect(task._id).toBeDefined();
    expect(response.body.message).toBe("Title is required");
  });

  it("should reject update task when description is missing", async () => {
    const task = await createTask(user._id);
    const response = await supertest(web)
      .patch(`/api/task/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test",
        description: null,
        startDate: "2026-06-23",
        endDate: "2026-06-23",
        priority: "low",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(user._id).toBeDefined();
    expect(task._id).toBeDefined();
    expect(response.body.message).toBe("Description is required");
  });

  it("should reject update task when end date is greater than start date", async () => {
    const task = await createTask(user._id);
    const response = await supertest(web)
      .patch(`/api/task/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test",
        description: "Desc",
        startDate: "2026-06-23",
        endDate: "2026-06-22",
        priority: "low",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(user._id).toBeDefined();
    expect(task._id).toBeDefined();
    expect(response.body.message).toBe(
      "End date must be greater than start date",
    );
  });

  it("should reject update task when task id is not found", async () => {
    const task = await createTask(user._id);
    const taskInvalid: string = "6a2f425976e63529cea304c9";
    const response = await supertest(web)
      .patch(`/api/task/${taskInvalid}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test",
        description: "Desc",
        startDate: "2026-06-23",
        endDate: "2026-06-23",
        priority: "low",
      });

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(user._id).toBeDefined();
    expect(task._id).toBeDefined();
    expect(response.body.message).toBe("Task not found");
  });
});

describe("DELETE /api/task/soft/:id", () => {
  let token: string;
  let user: any;
  const taskInvalid: string = "6a2f425976e63529cea304c9";

  beforeEach(async () => {
    const login = await loginUser();
    token = login.token;
    user = login.user;
  });

  it("should be able soft delete task", async () => {
    const task = await createTask(user._id);
    const response = await supertest(web)
      .delete(`/api/task/soft/${task._id}`)
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(user._id).toBeDefined();
    expect(task._id).toBeDefined();
    expect(response.body.message).toBe("Task moved to trash successfully");
  });

  it("should be able soft delete task when task id is invalid", async () => {
    const task = await createTask(user._id);
    const response = await supertest(web)
      .delete(`/api/task/soft/${taskInvalid}`)
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(user._id).toBeDefined();
    expect(task._id).toBeDefined();
    expect(response.body.message).toBe("Task not found or already deleted");
  });
});

describe("PATCH /api/task/status/:taskId", () => {
  let token: string;
  let user: any;
  const taskIdInvalid: string = "6a2f425976e63529cea304c9";

  beforeEach(async () => {
    const login = await loginUser();
    token = login.token;
    user = login.user;
  });

  it("should be able update status task", async () => {
    const task = await createTask(user._id);
    const response = await supertest(web)
      .patch(`/api/task/status/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        isCompleted: true,
      });

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(user._id).toBeDefined();
    expect(task._id).toBeDefined();
    expect(response.body.message).toBe("Task status updated successfully");
  });

  it("should be able update status task when task id is invalid", async () => {
    const task = await createTask(user._id);
    const response = await supertest(web)
      .patch(`/api/task/status/${taskIdInvalid}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        isCompleted: true,
      });

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(user._id).toBeDefined();
    expect(task._id).toBeDefined();
    expect(response.body.message).toBe("Task not found");
  });

  it("should be able update status task when status send not boolean", async () => {
    const task = await createTask(user._id);
    const response = await supertest(web)
      .patch(`/api/task/status/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        isCompleted: "xxxx",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(user._id).toBeDefined();
    expect(task._id).toBeDefined();
    expect(response.body.message).toBe("Status must be true or false");
  });
});

describe("GET /api/task/detail/:id", () => {
  let token: string;
  let user: any;
  const taskIdInvalid: string = "6a2f425976e63529cea304c9";

  beforeEach(async () => {
    const login = await loginUser();
    token = login.token;
    user = login.user;
  });

  it("should be able get task detail", async () => {
    const task = await createTask(user._id);
    const response = await supertest(web)
      .get(`/api/task/detail/${task._id}`)
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(user._id).toBeDefined();
    expect(response.body.data.id).toBe(task.id);
    expect(response.body.data.description).toBe(task.description);
    expect(response.body.data.startDate).toBe(
      task.start_date?.toISOString().split("T")[0],
    );
    expect(response.body.data.endDate).toBe(
      task.end_date?.toISOString().split("T")[0],
    );
    expect(response.body.data.priority).toBe(task.priority);
    expect(response.body.data.isCompleted).toBe(task.is_completed);
    expect(response.body.data.isExpired).toBe(false);
  });

  it("should rejected get task detail when task id is invalid", async () => {
    const task = await createTask(user._id);
    const response = await supertest(web)
      .get(`/api/task/detail/${taskIdInvalid}`)
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(user._id).toBeDefined();
    expect(task._id).toBeDefined;
    expect(response.body.message).toBe("Task not found");
  });
});

describe("PATCH /api/task/restore/:taskId", () => {
  let token: string;
  let user: any;
  const taskIdInvalid: string = "6a2f425976e63529cea304c9";

  beforeEach(async () => {
    const login = await loginUser();
    token = login.token;
    user = login.user;
  });

  it("should be able restore task", async () => {
    const task = await createTask(user._id);
    await softDeleteTask(task.id);

    const response = await supertest(web)
      .patch(`/api/task/restore/${task.id}`)
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(user._id).toBeDefined();
    expect(task.id).toBeDefined();
    expect(response.body.message).toBe("Task restored successfully");
  });

  it("should rejected restore task when task not removed", async () => {
    const task = await createTask(user._id);

    const response = await supertest(web)
      .patch(`/api/task/restore/${task.id}`)
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(user._id).toBeDefined();
    expect(task.id).toBeDefined();
    expect(response.body.message).toBe("Task not found or not deleted");
  });

  it("should rejected restore task when task id is invalid", async () => {
    const task = await createTask(user._id);
    await softDeleteTask(task.id);
    const response = await supertest(web)
      .patch(`/api/task/restore/${taskIdInvalid}`)
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(user._id).toBeDefined();
    expect(task.id).toBeDefined();
    expect(response.body.message).toBe("Task not found or not deleted");
  });
});

describe("GET /api/task/trash", () => {
  let token: string;
  let user: any;

  beforeEach(async () => {
    const login = await loginUser();
    token = login.token;
    user = login.user;
    const task = await createTask(user._id);
    await softDeleteTask(task.id);
  });

  it("should be able get task trash", async () => {
    const response = await supertest(web)
      .get("/api/task/trash")
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(user._id).toBeDefined();
    expect(response.body.data.length).toBe(1);
    expect(response.body.metaData.page).toBe(1);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(1);
    expect(response.body.metaData.totalPages).toBe(1);
    expect(response.body.message).toBe("Get task trash successfully");
  });

  it("should be able search task trash using title", async () => {
    const response = await supertest(web)
      .get("/api/task/trash")
      .query({ query: "Tes" })
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(user._id).toBeDefined();
    expect(response.body.data.length).toBe(1);
    expect(response.body.metaData.page).toBe(1);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(1);
    expect(response.body.metaData.totalPages).toBe(1);
    expect(response.body.message).toBe("Get task trash successfully");
  });

  it("should be able search task trash using description", async () => {
    const response = await supertest(web)
      .get("/api/task/trash")
      .query({ query: "desc" })
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(user._id).toBeDefined();
    expect(response.body.data.length).toBe(1);
    expect(response.body.metaData.page).toBe(1);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(1);
    expect(response.body.metaData.totalPages).toBe(1);
    expect(response.body.message).toBe("Get task trash successfully");
  });

  it("should be able search task trash no result", async () => {
    const response = await supertest(web)
      .get("/api/task/trash")
      .query({ query: "halooooo" })
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(user._id).toBeDefined();
    expect(response.body.data.length).toBe(0);
    expect(response.body.metaData.page).toBe(1);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(0);
    expect(response.body.metaData.totalPages).toBe(0);
    expect(response.body.message).toBe("Get task trash successfully");
  });

  it("should be able search task trash using paging & limit", async () => {
    const response = await supertest(web)
      .get("/api/task/trash")
      .query({ page: 2, limit: 5 })
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(user._id).toBeDefined();
    expect(response.body.data.length).toBe(0);
    expect(response.body.metaData.page).toBe(2);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(1);
    expect(response.body.metaData.totalPages).toBe(1);
    expect(response.body.message).toBe("Get task trash successfully");
  });

  it("should be able search task trash using all params", async () => {
    const response = await supertest(web)
      .get("/api/task/trash")
      .query({
        page: 1,
        limit: 5,
        sortBy: "createdAt",
        order: "desc",
        query: "Tes",
      })
      .set("Authorization", `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(user._id).toBeDefined();
    expect(response.body.data.length).toBe(1);
    expect(response.body.metaData.page).toBe(1);
    expect(response.body.metaData.limit).toBe(5);
    expect(response.body.metaData.total).toBe(1);
    expect(response.body.metaData.totalPages).toBe(1);
    expect(response.body.message).toBe("Get task trash successfully");
  });
});
