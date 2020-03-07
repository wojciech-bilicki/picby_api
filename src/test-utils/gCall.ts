import { graphql, GraphQLSchema } from "graphql"
import Maybe from "graphql/tsutils/Maybe"
import { createSchema } from "../utils/createSchema"

interface Options {
  source: string;
  variableValues?: Maybe<{
    [key: string]: any
  }>;
  userId?: string;
}

let schema: GraphQLSchema

export async function gCall<T> ({source, variableValues, userId }:Options)  {
  if(!schema) {
    schema = await createSchema()
  }
  return graphql<T>({
    schema,
    source,
    variableValues,
    contextValue: {
      req: {
        session: {
          userId
        }
      },
      res: {

      }
    }
  })
}