module.exports = [
  {
    name: 'production',
    type: 'postgres',
    synchronize: true, // switch this to false once you have the initial tables created and use migrations instead
    logging: true,
    entities: ['dist/entity/**/*.js'],
    migrations: ['dist/migration/**/*.js'],
    subscribers: ['dist/subscriber/**/*.js'],
    uuidExtension: 'pgcrypto',
    cli: {
      entitiesDir: 'dist/entity',
      migrationsDir: 'dist/migration',
      subscribersDir: 'dist/subscriber'
    }
  }
];
