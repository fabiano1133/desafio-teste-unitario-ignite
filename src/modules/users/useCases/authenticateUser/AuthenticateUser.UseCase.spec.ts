import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate a user", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });
  it("Should be able to authenticate a user and return a token is valid", async () => {
    const user: ICreateUserDTO = {
      name: "any user",
      email: "any@email.com",
      password: "anypassword",
    };
    await createUserUseCase.execute(user);

    const token = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });
    expect(token).toHaveProperty("token");
  });

  it("Should not be able to authenticate a user email not exists", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "any user",
        email: "any@email.com",
        password: "anypassword",
      });
      await authenticateUserUseCase.execute({
        email: "wrongemail",
        password: user.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate a user password incorrect", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "any user",
        email: "any@email.com",
        password: "anypassword",
      });
      await authenticateUserUseCase.execute({
        email: "any@email.com",
        password: "wrongpassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
