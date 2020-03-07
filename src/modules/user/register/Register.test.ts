import { internet } from 'faker';
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
import { redis } from "../../../redis";
import { gCall } from "../../../test-utils/gCall";
import { testConnection } from "../../../test-utils/testConnection";

let conn: Connection;
beforeAll(async () => {

  conn = await testConnection();
  if(redis.status === "end") {
    await redis.connect()
  }
})


afterAll(async () => {
  await conn.close();
  redis.disconnect();
})

const registerMutation = `
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      id
      email
    }
  }
`

describe('Register', () => {
  it('create user', async () => {
    const user = {
      email: internet.email(),
      password: internet.password(8)
    }
    const response =  await gCall({
      source: registerMutation,
      variableValues: {
        data: user
      }
    })

    expect(response).toMatchObject({
      data: {
        register: {
          email: user.email
        }
      }
    })

    const dbUser = await User.findOne({where: {email: user.email}})
    expect(dbUser).toBeDefined();
    expect(dbUser?.isConfirmed).toBeFalsy();
  })
})