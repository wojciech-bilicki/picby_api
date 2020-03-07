import * as bcrypt from 'bcryptjs';
import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { User } from '../../entity/User';
import { withAuthenticatedUser } from '../middleware/withAuthenticatedUser';
import { createAccountConfirmationUrl } from '../utils/createAccountConfirmationUrl';
import { sendEmail } from '../utils/sendEmail';
import { RegisterInput } from './register/RegisterInput';

@Resolver(User)
export class RegisterResolver {

  @UseMiddleware(withAuthenticatedUser)
  @Query(() => String)
  hello() {
    return "hello!";
  }

  @Mutation(() => User)
  async register(
    @Arg("data") {email, password} :RegisterInput,
  ):Promise<User> {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await User.create({
        email,
        password: hashedPassword
      }).save();

      await sendEmail({
        email,
        url: await createAccountConfirmationUrl(user.id)
      })

      return user;
  }
}
