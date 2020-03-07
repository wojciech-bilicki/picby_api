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

const meQuery = `
query {
    me {
      id
      email
  }
}
`

describe('Me Resolver', () => {
  it('should retrieve current user ', async () => {


    const {email, id} = await User.create({
      email: internet.email(),
      password: internet.password(8)
    }).save();

   const response =  await gCall({
      source: meQuery,
      userId: id
    })


    expect(response).toMatchObject({
      data: {
        me: {
          id: `${id}`,
          email: email
        }
      }
    })
  })

  it("return null if there's no userId in context", async () => {
    const response = await gCall({
      source: meQuery
    })

    expect(response).toMatchObject({
      data: {
        me: null
      }
    })
  })
})