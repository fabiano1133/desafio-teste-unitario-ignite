import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Get Balance a user", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to display a balance", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@example.com",
      password: "password",
    });

    const statement1 = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "any description",
    });

    const statement2: ICreateStatementDTO =
      await inMemoryStatementsRepository.create({
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: 550,
        description: "any description",
      });

    const statement3: ICreateStatementDTO =
      await inMemoryStatementsRepository.create({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 200,
        description: "any description",
      });
    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance).toHaveProperty("balance");
    expect(balance.statement.length).toBeGreaterThan(0);
    expect(balance.statement[0]).toHaveProperty("id");
  });

  it("Should not be able to display a balance to user does not exist", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "123" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
