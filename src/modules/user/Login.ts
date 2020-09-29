import * as bcrypt from "bcryptjs";
import { Context } from "src/types/Context";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { User } from "../../entity/User";
import { AuthorizationInput } from "./AuthorizationInput";
import AuthorizationResponse from "./AuthorizationResponse";


const loginErrors =  [{
  field: 'password',
  message: 'Wrong password or email'
}, {
  field: 'email',
  message: 'Wrong password or email'
}]

@Resolver(User)
export class LoginResolver {
  @Mutation(() => AuthorizationResponse)
  async login(
    @Arg("data") {email, password}: AuthorizationInput,
    @Ctx() ctx: Context
  ): Promise<AuthorizationResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
     return {
       errors: loginErrors
     }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return  {
        errors: loginErrors
      }
    }

    if (!user.isConfirmed) {
      return {
        errors: [{
          field: 'general',
          message: 'User is not confirmed'
        }]
      }
    }

    ctx.req.session!.userId = user.id;

    return {
      user
    };
  }
}
