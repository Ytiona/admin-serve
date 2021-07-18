const router = require('./router');
const querySql = require('../../db');
const { escape } = require('mysql');
const apiAuth = require('../../lib/api-auth');
const { handlePageSql } = require('../../lib/utils');

/**
* @api {post} /sys/getUserList 获取用户列表
* @apiName 获取用户列表
* @apiSuccess {Array} result 用户列表
* @apiGroup system
* @apiUse Common
* @apiUse Page
*/
router.get('/getUserList', async(req, res, next) => {
  try {
    const sql = `
      SELECT 
      u.account, u.name, u.avatar, 
      u.phone, r.name as role, 
      u.enabled, u.id,
      DATE_FORMAT(u.create_time, "%Y-%m-%d %H:%i:%s") as create_time
      FROM sys_user u, sys_role r
      WHERE r.code = u.role
    `;
    const byPageSql = handlePageSql(req, sql);
    const queryRes = await Promise.allSettled([
      querySql(byPageSql),
      querySql(`SELECT COUNT(*) as total FROM sys_user`)
    ])
    const userList = queryRes[0]?.value;
    const total = queryRes[1]?.value[0]?.total;
    res.send({
      total,
      code: 0,
      msg: '获取成功',
      result: userList
    })
  } catch(err) {
    next(err);
  }
})