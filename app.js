const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const expressJWT = require('express-jwt');
const apiAuth = require('./lib/api-auth');

const { JWT: JWT_CONFIG } = require('./config/constants'); 
const jwtUnlessApi = require('./config/jwt-unless-api');
const apiAuthUnlessApi = require('./config/api-auth-unless-api');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const systemRouter = require('./routes/system');

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
  path: jwtUnlessApi
}))

app.use(apiAuth({
  unless: [apiAuthUnlessApi]
}))

app.use('', indexRouter);
app.use('/user', userRouter);
app.use('/sys', systemRouter);

app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {
  console.log(err);
  if (err.name == 'UnauthorizedError') {
    const errMsgTranslate = {
      'jwt expired': '登录状态已过期，请重新登录'
    }
    res.status(401).send({ code: -1, msg: errMsgTranslate[err.message] || '无效的密令，请登录！'});
  } else {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500).send({ code: 500, msg: '未知错误！' });
  }
});

module.exports = app;
