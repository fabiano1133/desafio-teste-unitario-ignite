import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Create user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const user = await request(app).post("/users").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });
    expect(user.status).toBe(201);
  });
});
