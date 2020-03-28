import { Arg, Mutation, Resolver } from "type-graphql";
import { v4 } from "uuid";
import { User } from "../../entity/User";
import { redis } from "../../redis";
import { FORGET_PASSWORD_PREFIX } from "../constants/redisPrefixes";
import { ONE_DAY_EXPIRATION_TIME } from "../constants/timeDateConstants";
import { sendEmail } from "../utils/sendEmail";

@Resolver(User)
export class ForgotPasswordResolver {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return false;
    }

    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      ONE_DAY_EXPIRATION_TIME
    );

    await sendEmail({
      email,
      url: `https://hungry-kilby-128f75.netlify.com/forgotPasswordForm/${token}`
    });
    return true;
  }
}
