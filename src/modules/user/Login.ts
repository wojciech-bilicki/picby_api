import { ValidationError, AuthenticationError } from "apollo-server-core";
import * as bcrypt from "bcryptjs";
import { Context } from "src/types/Context";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { User } from "../../entity/User";

@Resolver(User)
export class LoginResolver {
  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: Context
  ): Promise<User | null> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ValidationError("100");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ValidationError("100");
    }

    if (!user.isConfirmed) {
      throw new AuthenticationError("101");
    }

    ctx.req.session!.userId = user.id;

    return user;
  }
}
