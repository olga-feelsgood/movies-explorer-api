const Movie = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictingRequestError = require('../errors/ConflictingRequestError');

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((newMovie) => {
      res.status(201).send(newMovie);
    })
    .catch((error) => {
      if (error.code === 11000) {
        next(new ConflictingRequestError('Фильм с указанным id уже сохранен пользователем'));
      } else if (error.name === 'ValidationError') {
        next(BadRequestError('Переданы некорректные данные при создании фильма'));
      } else { next(error); }
    });
};

module.exports.getAllSavedMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .orFail(() => {
      next(new NotFoundError('Фильм с указанным id не найден'));
    })
    .then((movie) => {
      const movieOwner = movie.owner.toString().replace('new ObjectId("', '');
      if (req.user._id === movieOwner) {
        Movie.findByIdAndRemove(req.params._id)
          .then((movieToBeDeleted) => {
            res.status(200).send(movieToBeDeleted);
          })
          .catch((error) => {
            next(error);
          });
      } else {
        next(new ForbiddenError('Нет прав на удаление выбранного фильма'));
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestError('Неверный формат id фильма'));
      } else { next(error); }
    });
};
