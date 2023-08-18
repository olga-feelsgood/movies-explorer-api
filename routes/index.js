const usersRouter = require('./users');

const router = require('express').Router();

router.use('/users', usersRouter);
//router.use('/movies', moviesRouter);

module.exports = router;