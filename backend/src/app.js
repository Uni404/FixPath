const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

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
const feedbackRoute = require('./routes/feedback');

const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

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
app.use('/feedback', feedbackRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
