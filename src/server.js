/**
 * this server first developed by Ahmad Al-Sayed from MA Core in SYRIA
 * if you hade a problem or a question then you can contact me on
 * phone: +963935740389
 * email: ahmad_al-sayed@outlook.com
 */


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 2801;
const apiRouter = require('./routers/api');
const wellKnownRouter = require('./routers/wellknown');
// const imageRouter = require('./routers/images');

async function startServer() {
  const app = express();
  // load models (this will initialize Sequelize and models/index.js)
  const { sequelize } = require('../models');
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger');

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));
  
  // Serve static files from resources directory
  app.use('/resources', express.static(path.join(__dirname, '../resources')));
  
  // Serve .well-known files for Universal Links and App Links
  app.use('/.well-known', wellKnownRouter);
  
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api', apiRouter);
  // app.use('/images', imageRouter);
  
  
  app.get('/version', (req, res) => {
    res.json({ version: '1.0.0' });
  });
  app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
  });
  app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
  });
  
  app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({
      message: err.message || 'Internal Server Error'
    });
  });

  try {
    await sequelize.authenticate();
    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync();
    }
    console.log('Database connection established');

    // Initialize Firebase for push notifications
    const { setupFirebase } = require('./config/firebase');
    setupFirebase();

    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    // Diagnostics: track process lifecycle
    process.on('exit', (code) => console.log('Process exiting with code', code));
    process.on('uncaughtException', (err) => console.error('uncaughtException', err));
    process.on('unhandledRejection', (reason) => console.error('unhandledRejection', reason));

    server.on('close', () => console.log('HTTP server closed'));
    server.on('error', (err) => console.error('HTTP server error', err));

    const gracefulShutdown = async (signal) => {
      try {
        console.log(`${signal} received -> shutting down gracefully`);
        await new Promise((resolve) => server.close(resolve));
        console.log('HTTP server closed');
        await sequelize.close();
        console.log('DB connection closed');
      } catch (e) {
        console.error('Error during shutdown', e);
      } finally {
        process.exit(0);
      }
    };

    // Handle Ctrl+C / kill
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    // Handle Nodemon restart
    process.once('SIGUSR2', async () => {
      console.log('SIGUSR2 received (nodemon restart)');
      try {
        await new Promise((resolve) => server.close(resolve));
        console.log('HTTP server closed for nodemon restart');
      } catch (e) {
        console.error('Error closing server on nodemon restart', e);
      } finally {
        process.kill(process.pid, 'SIGUSR2');
      }
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
