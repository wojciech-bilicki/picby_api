import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import { createTypeormConn } from "./createTypeOrmConnection";
import { AUTH_COOKIE_NAME } from "./modules/constants/cookies";
import { redis } from "./redis";
import { createSchema } from "./utils/createSchema";

const COOKIE_MAX_AGE_LIMIT = 1000 * 60 * 60 * 24 * 7 * 36; //7 years

// TODO: we should find a way to store it secretly somewhere
const AUTH_COOKIE_SECRET = "asdasda";
const DEFAULT_PORT = process.env.NODE_ENV === "production" ? 8081 : 8090;

(async () => {
  const app = express();

  await createTypeormConn();
  const apolloServer = new ApolloServer({
    introspection: true,
    playground: true,
    schema: await createSchema(),
    context: ({ req, res }) => ({
      req,
      res,
      session: req.session,
      /* url is used to serve the path to files */
      url: req.protocol + "://" + req.get("host")
    })
  });

  const RedisStore = connectRedis(session);

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000"
    })
  );

  app.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: AUTH_COOKIE_NAME,
      secret: AUTH_COOKIE_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: COOKIE_MAX_AGE_LIMIT
      }
    })
  );

  app.use("/images", express.static("images"));

  apolloServer.applyMiddleware({ app, cors: false });
  const port = process.env.PORT || DEFAULT_PORT;
  app.listen(port, async () => {
    console.log(`server started at http://localhost:${port}/graphql`);
  });
})();
