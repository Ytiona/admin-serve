const express = require('express');
const router = express.Router();
const { escape } = require('mysql');

const apiData = require('../apidoc/api_data.json');


router.get('/', function(req, res, next) {
  res.send({
    IsSuccess: true,
    Data: apiData
  })
});

router.post('/post', function(req, res, next) {
  setTimeout(() => {
    res.send({
      code: 0,
      msg: 'Hello World',
      data: req.user
    })
  }, 1000)
});


module.exports = router;


/**
 * @apiDefine Common
 * @apiSuccess {Number} code 请求结果code码
 * @apiSuccess {String} msg 请求结果msg
 */

/**
 * @apiDefine Page
 * @apiSuccess {Number} total 总条数
 */