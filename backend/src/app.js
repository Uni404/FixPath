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
const diagnoseRoute = require('./routes/diagnose');
const consultationRoute = require('./routes/consultation');
const replacementRoute = require('./routes/replacement');
const deviceRoute = require('./routes/device');
const symptomRoute = require('./routes/symptom');
const authRoute = require('./routes/auth');
const expertRoute = require('./routes/expert');
const userRoute = require('./routes/user');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/health', healthRoute);
app.use('/report', reportRoute);
app.use('/diagnose', diagnoseRoute);
app.use('/consultation', consultationRoute);
app.use('/replacement', replacementRoute);
app.use('/devices', deviceRoute);
app.use('/symptoms', symptomRoute);
app.use('/auth', authRoute);
app.use('/expert', expertRoute);
app.use('/user', userRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
