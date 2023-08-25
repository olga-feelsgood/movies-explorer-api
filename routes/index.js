const router = require('express').Router();
const auth = require('../middlewares/auth');
const authRouter = require('./authorization');
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const NotFoundError = require('../errors/NotFoundError');

router.use('/api', authRouter);

router.use(auth);

router.use('/api/users', usersRouter);
router.use('/api/movies', moviesRouter);

router.use((req, res, next) => {
  next(new NotFoundError('Ошибка 404. Запрашиваемые вами данные не найдены.'));
});

module.exports = router;
