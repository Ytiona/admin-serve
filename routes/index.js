const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.send({
    code: 0,
    msg: 'Hello World',
    data: req.user
  })
});

module.exports = router;
