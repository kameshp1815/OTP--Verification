const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config');
const authRoutes = require('./routes/auth');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);

async function start() {
  if (!config.mongodbUri) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }
  await mongoose.connect(config.mongodbUri);
  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
}

start();
