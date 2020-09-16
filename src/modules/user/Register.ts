import * as bcrypt from "bcryptjs";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../../entity/User";
import { ApiErrorCodes } from "../../utils/errorCodes";
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
  ): Promise<User | null> {
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
    const user = await User.create({
      email,
      password: hashedPassword
    }).save();

    if(!user) {
      throw new Error('')
    }

    await sendEmail({
      email,
      url: await createAccountConfirmationUrl(user.id),
      subjectIndex: 0
    });

    return user;
  } catch (e) {
    if(e.code === ApiErrorCodes.UniqueEntryConstraintErrorCode)
      throw new Error('email_not_unique') 
    }
    return null;
  }
}
