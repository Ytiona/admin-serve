const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const expressJWT = require('express-jwt');

const { JWT: JWT_CONFIG } = require('./config/constants'); 
const mloginApi = require('./config/mlogin-api');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');

const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressJWT({
  secret: JWT_CONFIG.PRIVATE_KEY,
  algorithms: ['HS256']
}).unless({
  path: mloginApi
}))


app.use('', indexRouter);
app.use('/user', userRouter);

app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {
  console.log(err);
  if (err.name == 'UnauthorizedError') {
    res.status(401).send({ code: -1, msg: 'token校验失败！' });
  } else {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500).send({ code: 500, msg: '未知错误！' });
  }
});

module.exports = app;
