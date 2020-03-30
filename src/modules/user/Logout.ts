import { Context } from "src/types/Context";
import { Ctx, Mutation, Resolver } from "type-graphql";
import { AUTH_COOKIE_NAME } from "../constants/cookies";

@Resolver()
export class LogoutResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: Context): Promise<Boolean> {
    return new Promise((res, rej) =>
      ctx.req.session!.destroy(err => {
        if (err) {
          console.log(err);
          return rej(false);
        }
        ctx.res.clearCookie(AUTH_COOKIE_NAME);
        return res(true);
      })
    );
  }
}
