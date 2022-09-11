import { ProfileMap } from "@modules/users/mappers/ProfileMap";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });
  it("Should be able to show a user profile", async () => {
    await createUserUseCase.execute({
      name: "any user",
      email: "any@email.com",
      password: "anypassword",
    });
    const token = await authenticateUserUseCase.execute({
      email: "any@email.com",
      password: "anypassword",
    });
    const showProfile: ProfileMap = await showUserProfileUseCase.execute(
      token.user.id
    );
    expect(showProfile).toHaveProperty("id");
  });

  it("Should be able to show a user non exists", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("non exists");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
