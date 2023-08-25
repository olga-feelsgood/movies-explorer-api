const moviesRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const { createMovie, getAllSavedMovies, deleteMovie } = require('../controllers/movies');

moviesRouter.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.string().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required()
      .custom((value, helpers) => {
        if (validator.isURL(value)) {
          return value;
        }
        return helpers.message('Некорректно заполнено поле image');
      }),
    trailerLink: Joi.string().required()
      .custom((value, helpers) => {
        if (validator.isURL(value)) {
          return value;
        }
        return helpers.message('Некорректно заполнено поле trailerLink');
      }),
    nameRU: Joi.string().required().regex(/^[:?!,.а-яА-ЯёЁ0-9\s]+$/),
    nameEN: Joi.string().required().regex(/^[:?!,.a-zA-Z0-9\s]+$/),
    thumbnail: Joi.string().required()
      .custom((value, helpers) => {
        if (validator.isURL(value)) {
          return value;
        }
        return helpers.message('Некорректно заполнено поле thumbnail');
      }),
    movieId: Joi.required(),
  }),
}), createMovie);

moviesRouter.get('/', getAllSavedMovies);

moviesRouter.delete('/:_id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().alphanum(),
  }),
}), deleteMovie);

module.exports = moviesRouter;
