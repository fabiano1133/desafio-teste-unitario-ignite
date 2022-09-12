import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Authenticate user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    await request(app).post("/users").send({
      name: "John Doe",
      email: "johndoe@example.com.br",
      password: "123456",
    });

    const userToken = await request(app).post("/sessions").send({
      email: "johndoe@example.com.br",
      password: "123456",
    });
    expect(userToken.status).toBe(200);
  });
});
