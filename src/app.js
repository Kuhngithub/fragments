// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const logger = require('./logger');
const pino = require('pino-http')({ logger });
const { createErrorResponse } = require('./response'); // Import the createErrorResponse function
const authenticate = require('./auth');

const app = express();

app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());

passport.use(authenticate.strategy());
app.use(passport.initialize());

app.use('/', require('./routes'));

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found')); // Use createErrorResponse function
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json(createErrorResponse(status, message)); // Use createErrorResponse function
});

module.exports = app;
