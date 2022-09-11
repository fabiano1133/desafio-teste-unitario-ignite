import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let authenticatedUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticatedUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to return a statement operation", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@example.com",
      password: "1234",
    });

    const userToken = await authenticatedUserUseCase.execute({
      email: "test@example.com",
      password: "1234",
    });

    const statementDeposit = await createStatementUseCase.execute({
      user_id: userToken.user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "any description",
    });

    const getOperation = await getStatementOperationUseCase.execute({
      user_id: userToken.user.id,
      statement_id: statementDeposit.id,
    });
    expect(getOperation).toHaveProperty("id");
    expect(getOperation).toHaveProperty("user_id");
    expect(getOperation).toHaveProperty("type");
  });

  it("Should not be able to return a statement operation with user does not exist", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "123",
        statement_id: "123",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to return a statement operation with user does not exist", async () => {
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

      await getStatementOperationUseCase.execute({
        user_id: userToken.user.id,
        statement_id: "123",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
