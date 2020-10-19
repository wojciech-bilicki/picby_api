import { AuthenticationError } from "apollo-server";
import { Context } from "src/types/Context";
import { MiddlewareFn } from "type-graphql";

export const withAuthenticatedUser: MiddlewareFn<Context> = async ({ context }, next) => {
  if(!context.req.session){
    throw new Error('no session found/not authenticated')
  }

  const userId = context.req.session.userId;

  
  if(!userId) {
    throw new AuthenticationError('no user id/not authenticated')
  }

  return next();
};