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
    const { name, account, phone, enabled } = req.query;
    const filters = [
      { key: 'name', value: name, type: 'LIKE' },
      { key: 'account', value: account, type: 'LIKE' },
      { key: 'phone', value: phone, type: 'LIKE' },
      { key: 'enabled', value: enabled, type: '=' }
    ]
    const sql = `
      SELECT 
      u.account, u.name, u.avatar, 
      u.phone, r.name as role, 
      u.enabled, u.id,
      DATE_FORMAT(u.create_time, "%Y-%m-%d %H:%i:%s") as create_time
      FROM sys_user u, sys_role r
      WHERE r.code = u.role
    `;
    let filterSql = '';
    filters.forEach(item => {
      const { key, value, type } = item;
      if(!isEmpty(value)) {
        switch(type) {
          case 'LIKE':
            filterSql += ` AND u.${key} LIKE '%${value}%'`;
            break;
          case '=':
            filterSql += ` AND u.${key} = ${value}`;
            break;
        }
      }
    })
    const byPageSql = handlePageSql(req, sql + filterSql);
    const queryRes = await Promise.allSettled([
      querySql(byPageSql),
      querySql(`SELECT COUNT(*) as total FROM sys_user u WHERE 1 = 1` + filterSql)
    ])
    const userList = queryRes[0]?.value;
    let total = 0;
    if(queryRes[1]?.value) {
      total = queryRes[1]?.value[0]?.total;
    }
    res.send({
      total,
      code: 0,
      msg: '获取成功',
      result: userList || []
    })
  } catch(err) {
    next(err);
  }
})

/**
* @api {post} /sys/createUser 创建用户
* @apiName 创建用户
* @apiParam {String} avatar 头像
* @apiParam {String} account 账号
* @apiParam {String} password 密码
* @apiParam {String} name 姓名
* @apiParam {String} phone 电话
* @apiParam {String} role 角色
* @apiParam {Boolean} enabled 是否启用
* @apiGroup system
* @apiUse Common
* @apiUse Page
*/
router.post('/createUser', async(req, res, next) => {
  try {
    const { avatar, account, password, name, phone, role, enabled } = req.body;
    await querySql(`
      INSERT INTO 
      sys_user(avatar, account, password, name, phone, role, enabled) 
      VALUE(?, ?, ?, ?, ?, ?, ?)
    `, [avatar, account, password, name, phone, role, enabled || true]);
    res.send({
      code: 0,
      msg: '创建用户成功'
    })
  } catch(err) {
    next(err);
  }
})


/**
* @api {post} /sys/updateUser 创建用户
* @apiName 创建用户
* @apiParam {String} id 用户id
* @apiParam {String} avatar 头像
* @apiParam {String} account 账号
* @apiParam {String} password 密码
* @apiParam {String} name 姓名
* @apiParam {String} phone 电话
* @apiParam {String} role 角色
* @apiParam {Boolean} enabled 是否启用
* @apiGroup system
* @apiUse Common
* @apiUse Page
*/
router.post('/updateUser', async(req, res, next) => {
  try {

    res.send({
      code: 0,
      msg: '创建用户成功'
    })
  } catch(err) {
    next(err);
  }
})

/**
* @api {post} /sys/deleteUser 删除用户
* @apiName 删除用户
* @apiParam {String} userIds 用户ids
* @apiGroup system
* @apiUse Common
* @apiUse Page
*/
router.post('/deleteUser', async(req, res, next) => {
  try {
    const { userIds } = req.body;
    await querySql(`DELETE FROM sys_user WHERE id IN (${userIds.toString()})`);
    res.send({
      code: 0,
      msg: '删除用户成功'
    })
  } catch(err) {
    next(err);
  }
})

/**
* @api {post} /sys/disableUser 禁用用户
* @apiName 禁用用户
* @apiParam {String} userIds 用户ids
* @apiGroup system
* @apiUse Common
* @apiUse Page
*/
router.post('/disableUser', async(req, res, next) => {
  try {
    const { userIds } = req.body;
    await querySql(`UPDATE sys_user SET enabled = 0 WHERE id IN (${userIds.toString()})`);
    res.send({
      code: 0,
      msg: '禁用用户成功'
    })
  } catch(err) {
    next(err);
  }
})