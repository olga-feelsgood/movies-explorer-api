const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { updateUser, getCurrentUser } = require('../controllers/users');

usersRouter.get('/me', getCurrentUser);

usersRouter.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
  }),
}), updateUser);

module.exports = usersRouter;
