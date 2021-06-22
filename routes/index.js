const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.send({
    IsSuccess: true,
    Data: `[{\"a\":1},{\"a\":2}]`
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
