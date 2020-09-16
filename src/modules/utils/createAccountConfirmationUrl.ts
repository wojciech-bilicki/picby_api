import { v4 } from "uuid";
import { redis } from "../../redis";
import { CONFIRM_USER_PREFIX } from "../constants/redisPrefixes";
import { ONE_DAY_EXPIRATION_TIME } from "../constants/timeDateConstants";

export const createAccountConfirmationUrl = async (userId: string) => {
  const confirmationToken = v4();
  await redis.set(
    CONFIRM_USER_PREFIX + confirmationToken,
    userId,
    "ex",
    ONE_DAY_EXPIRATION_TIME
  );

  //TODO: set the proper URL for development and production
  return `https://hungry-kilby-128f75.netlify.com/login?token=${confirmationToken}`;
};
