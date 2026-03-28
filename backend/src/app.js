const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

console.log('ENV CHECK:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  PORT: process.env.PORT
});

const healthRoute = require('./routes/health');
const reportRoute = require('./routes/report');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/health', healthRoute);
app.use('/report', reportRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
