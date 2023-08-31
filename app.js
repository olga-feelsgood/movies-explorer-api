require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');
const helmet = require('helmet');
const router = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');

// const { NODE_ENV, DATA_BASE } = process.env;

const app = express();

const { PORT = 3000 } = process.env;

// mongoose.connect('mongodb://127.0.0.1:27017/mestodb');
mongoose.connect('mongodb://localhost:27017/bitfilmsdb');

app.listen(PORT, () => { console.log(`App listening on port ${PORT}`); });

app.use(helmet);

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(requestLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});
