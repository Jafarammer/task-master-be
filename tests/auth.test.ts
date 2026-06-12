import User from "../src/models/user.model";
import supertest from "supertest";
import { logger } from "../src/app/logging";
import web from "../src/app/web";

describe("Health Check", () => {
  it("should return OK", async () => {
    const response = await supertest(web).get("/health");
    logger.debug(response.body);
    expect(response.status).toBe(200);
  });
});
