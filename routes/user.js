const express = require('express');
const { escape } = require('mysql');
const router = express.Router();
const querySql = require('../db');
const jwt = require('jsonwebtoken');
const { JWT: JWT_CONFIG } = require('../config/constants');
const { generateTree } = require('../lib/utils');

const { menuFields } = require('../sql/menu');

/**
* @api {post} /use/login 登录
* @apiName 用户登录
* @apiGroup user
* @apiParam {String} userName 用户名
* @apiParam {String} password 用户名
* @apiSuccess {String} result token
* @apiUse Common
*/
router.post('/login', async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    const queryRes = await querySql('SELECT * FROM sys_user WHERE user_name = ? AND password = ?', [userName, password]);
    if (queryRes.length > 0) {
      const { user_name, avatar, role } = queryRes[0];
      const token = jwt.sign(
        {
          role,
          userName: user_name
        },
        JWT_CONFIG.PRIVATE_KEY,
        { expiresIn: JWT_CONFIG.EXPIRESD }
      )
      res.send({
        code: 0,
        msg: `欢迎回来，${userName}`,
        result: token,
        userInfo: {
          userName,
          avatar
        }
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

/**
* @api {post} /use/getUserMenuList 获取用户菜单，通过角色菜单授权控制
* @apiName 获取用户菜单
* @apiGroup user
* @apiSuccess {Object} result
* @apiSuccess {Array} result.menuTree 树形菜单
* @apiSuccess {Array} result.routes 菜单列表
* @apiUse Common
*/
router.get('/getUserMenuList', async (req, res, next) => {
  try {
    const { role } = req.user;
    const menuList = await querySql(`
      SELECT ${menuFields} 
      FROM sys_menu sm
      INNER JOIN sys_role_menu srm
      ON srm.role_code = ? AND sm.id = srm.menu_id
      WHERE is_del <> 1 AND enabled <> 0
      ORDER BY order_val ASC
    `, [role]);
    res.send({
      code: 0,
      msg: '获取成功',
      result: {
        menuTree: generateTree({ source: menuList }),
        routes: menuList.filter(item => item.type == '1')
      }
    });
  } catch (err) {
    next(err);
  }
})

module.exports = router;
