import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Get balance", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to return a balance", async () => {
    const user = await request(app).post("/users").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });
    const responseToken = await request(app).post("/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/statements/deposit")
      .send({
        amount: 100,
        description: "deposit",
        type: "deposit",
      })
      .set({ Authorization: `Bearer ${token}` });

    const balance = await request(app)
      .get("/statements/balance")
      .send()
      .set({ Authorization: `Bearer ${token}` });

    expect(balance.status).toBe(200);
    expect(balance.body.statement.length).toEqual(1);
  });
});
