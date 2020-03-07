import { Context } from "src/types/Context";
import { Ctx, Query, Resolver } from "type-graphql";
import { User } from '../../entity/User';

@Resolver(User)
export class MeResolver {
  @Query(() => User, {nullable: true})
  async me(@Ctx() ctx: Context): Promise<User | undefined> {
    if(!ctx.req.session) {
      return undefined;
    }
    const { userId } = ctx.req.session;
    if(!userId) {
      return undefined;
    }

    return User.findOne(userId, {relations: ["catalogs"]})
  }
}
