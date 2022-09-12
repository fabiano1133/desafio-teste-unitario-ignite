import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let authenticatedUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    authenticatedUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should not be able to create a statement type deposit with user does not exist", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "123",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "any description",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should be able to create a statement type deposit", async () => {
    const user: ICreateUserDTO = {
      name: "test",
      email: "test@example.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    const userToken = await authenticatedUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const statement = await createStatementUseCase.execute({
      user_id: userToken.user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "any description",
    });
    expect(statement).toHaveProperty("id");
    expect(statement.amount).toEqual(100);
  });

  it("Should be able to create a statement type withdraw", async () => {
    const user: ICreateUserDTO = {
      name: "test",
      email: "test@example.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    const userToken = await authenticatedUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    await createStatementUseCase.execute({
      user_id: userToken.user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "any description",
    });

    const statementWithdraw = await createStatementUseCase.execute({
      user_id: userToken.user.id as string,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "any description",
    });
    expect(statementWithdraw).toHaveProperty("id");
    expect(statementWithdraw).toHaveProperty("user_id");
    expect(statementWithdraw).toHaveProperty("amount");
  });

  it("Should not be possible to withdraw an amount greater than available", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "test",
        email: "test@example.com",
        password: "1234",
      });

      const userToken = await authenticatedUserUseCase.execute({
        email: "test@example.com",
        password: "1234",
      });

      await createStatementUseCase.execute({
        user_id: userToken.user.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "any description",
      });

      await createStatementUseCase.execute({
        user_id: userToken.user.id,
        type: OperationType.WITHDRAW,
        amount: 150,
        description: "any description",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
