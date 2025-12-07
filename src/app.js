const express = require('express');
const extractionRoutes = require('./routes/extractionRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json({ limit: '2mb' }));

app.use('/api', extractionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
