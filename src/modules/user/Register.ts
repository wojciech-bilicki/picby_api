import * as bcrypt from "bcryptjs";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../../entity/User";
import { createAccountConfirmationUrl } from "../utils/createAccountConfirmationUrl";
import { sendEmail } from "../utils/sendEmail";
import { RegisterInput } from "./register/RegisterInput";

@Resolver(User)
export class RegisterResolver {
  @Query(() => String)
  hello() {
    return "hello!";
  }

  @Mutation(() => User)
  async register(
    @Arg("data") { email, password }: RegisterInput
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword
    }).save();

    await sendEmail({
      email,
      url: await createAccountConfirmationUrl(user.id)
    });

    return user;
  }
}
