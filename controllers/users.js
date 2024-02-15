require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictingRequestError = require('../errors/ConflictingRequestError');

const { NODE_ENV, JWT_SECRET } = process.env;

const SALT_ROUNDS = 10;

module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
  // хешируем пароль
  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      name,
      email,
      password: hash, // записываем хеш в базу
    }))
    .then((data) => {
      res.status(201).send({
        _id: data._id,
        name: data.name,
        email: data.email,
      });
    })
    .catch((error) => {
      if (error.code === 11000) {
        next(new ConflictingRequestError('Пользователь с указанным email уже зарегистрирован'));
      } else if (error.name === 'ValidationError') {
        next(BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else { next(error); }
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail(() => {
      next(new NotFoundError('Пользователь с указанным id не найден'));
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((error) => {
      if (error.code === 11000) {
        next(new ConflictingRequestError('Пользователь с указанным email уже зарегистрирован'));
      } else if (error.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else { next(error); }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
        { expiresIn: '7d' },
      );
      // вернём токен
      res.send({ token });
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findOne({ _id: userId })
    .orFail(() => {
      next(new NotFoundError('Пользователь с указанным id не найден'));
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch(next);
};
