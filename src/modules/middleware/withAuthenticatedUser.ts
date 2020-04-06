import { Context } from "src/types/Context";
import { MiddlewareFn } from "type-graphql";
import { User } from "../../entity/User";

export const withAuthenticatedUser: MiddlewareFn<Context> = async ({ context }, next) => {
  if(!context.req.session){
    throw new Error('no session found/not authenticated')
  }

  const userId = context.req.session.userId;

  
  if(!userId) {
    throw new Error('no user id/not authenticated')
  }
  
  console.log(userId)
  context.user = await User.findOne(userId);
  return next();
};