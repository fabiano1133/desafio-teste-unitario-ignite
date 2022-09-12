import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Create Statement controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a deposit", async () => {
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

    const statementDeposit = await request(app)
      .post("/statements/deposit")
      .send({
        amount: 100,
        description: "deposit",
        type: "deposit",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(statementDeposit.status).toBe(201);
    expect(statementDeposit.body).toHaveProperty("id");
  });

  it("should be able to create a withdral", async () => {
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

    const statementWithdraw = await request(app)
      .post("/statements/withdraw")
      .send({
        amount: 300,
        description: "withdraw",
        type: "withdraw",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(statementWithdraw.status).toBe(201);
  });
});
