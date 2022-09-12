import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Show profile user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'test', 'test@test.com.br', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to display profile a user", async () => {
    const resonseToken = await request(app).post("/sessions").send({
      email: "test@test.com.br",
      password: "admin",
    });

    const { token } = resonseToken.body;

    const response = await request(app)
      .get("/profile")
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
  });
});
