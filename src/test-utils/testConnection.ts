import { createConnection } from "typeorm";

export const testConnection = (dropDatabase: boolean = false) => createConnection({
  name: "default",
  type: "postgres",
  database: "picby_db_test",
  host:"localhost",
  port: 5432,
  synchronize: dropDatabase,
  dropSchema: dropDatabase,
  username: "test",
  password: "test",
  entities: [__dirname + "/../entity/*.*"],
})
