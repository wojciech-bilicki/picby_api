import bcrypt from 'bcryptjs';
import { Context } from 'src/types/Context';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { User } from '../../entity/User';
import { redis } from '../../redis';
import { FORGET_PASSWORD_PREFIX } from '../constants/redisPrefixes';
import { ChangePasswordInput } from './changePassword/ChangePasswordInput';



@Resolver(User)
export class ChangePasswordResolver {
  @Mutation(() => User, {nullable: true})
  async changePassword(
    @Arg('data') {token, password}: ChangePasswordInput,
    @Ctx() ctx: Context
  ): Promise<User | null> {
    
    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);
    if(!userId) {
      return null;
    }

    const user = await  User.findOne(userId);

    if(!user) {
      return null;
    }

    await redis.del(FORGET_PASSWORD_PREFIX + token);
    user.password = await bcrypt.hash(password, 12);
    await user.save();

    ctx.req.session!.userId = user.id;

    return user;
  }
}
