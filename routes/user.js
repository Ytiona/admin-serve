const express = require('express');
const router = express.Router();
const querySql = require('../db');
const jwt = require('jsonwebtoken');
const { JWT: JWT_CONFIG } = require('../config/constants');

router.post('/login', async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    const queryRes = await querySql('SELECT * FROM user WHERE user_name = ? AND password = ?', [userName, password]);
    if (queryRes.length > 0) {
      const { user_name, id } = queryRes[0];
      const token = jwt.sign(
        {
          id: id,
          userName: user_name
        },
        JWT_CONFIG.PRIVATE_KEY,
        { expiresIn: JWT_CONFIG.EXPIRESD }
      )
      
      res.send({
        code: 0,
        msg: `欢迎回来，${userName}`,
        result: token
      });
    } else {
      res.send({
        code: -1,
        msg: '登录失败，用户名或密码错误'
      })
    }
  } catch (err) {
    next(err);
  }
})

router.get('/get', async (req, res, next) => {
  try {
    res.send({
      code: 0,
      msg: '获取成功',
      result: [{ a: 1, b: 2 }, { a:3, b: 3 }]
    })
  } catch(err) {
    next(err);
  }
})

module.exports = router;
