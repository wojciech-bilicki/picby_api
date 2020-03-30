module.exports = [
  {
    name: "default",
    type: "postgres",
    database: "picby_db",
    host: "localhost",
    port: 5432,
    synchronize: true,
    logging: true,
    username: "test",
    password: "test",
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber"
    }
  }
];
