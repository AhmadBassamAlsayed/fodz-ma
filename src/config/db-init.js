require('dotenv').config();
const { Sequelize } = require('sequelize');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const readFile = promisify(fs.readFile);

const env = process.env.NODE_ENV || 'development';
const config = require('./database')[env];

// Create a connection without specifying the target database. For Postgres we connect to 'postgres' default DB.
const dialect = config.dialect || 'mysql';
const defaultDb = dialect === 'postgres' ? 'postgres' : '';

const sequelizeOptions = {
  ...config,
  database: defaultDb,
  logging: false,
};

const sequelize = new Sequelize(defaultDb, config.username, config.password, sequelizeOptions);

async function initializeDatabase() {
  try {
    if (dialect === 'mysql') {
      // MySQL: use IF NOT EXISTS and charset/collation
      await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      console.log(`Database ${process.env.DB_NAME} created or already exists (MySQL)`);
    } else if (dialect === 'postgres') {
      // Postgres: create database if not exists (use pg-specific safe pattern)
      // We check pg_database and create when missing
      await sequelize.query(`DO $$\nBEGIN\n   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${process.env.DB_NAME}') THEN\n      PERFORM pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${process.env.DB_NAME}';\n      CREATE DATABASE "${process.env.DB_NAME}";\n   END IF;\nEND\n$$;`);
      console.log(`Database ${process.env.DB_NAME} created or already exists (Postgres)`);
    } else {
      // Fallback: try a generic CREATE DATABASE
      await sequelize.query(`CREATE DATABASE ${process.env.DB_NAME};`).catch(() => {});
      console.log(`Attempted to create database ${process.env.DB_NAME}`);
    }

    // Close the temporary connection
    await sequelize.close();

    // Now require model index which will create a sequelize instance connected to the target DB
    const db = require('../../models');

    // Test the connection
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models (be careful in production)
    await db.sequelize.sync({ force: false, alter: true });
    console.log('All models were synchronized successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Unable to initialize the database:', error);
    process.exit(1);
  }
}

initializeDatabase();
