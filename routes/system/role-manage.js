const router = require('./router');
const querySql = require('../../db');
const { escape } = require('mysql');
const apiAuth = require('../../lib/api-auth');
const { handlePageSql } = require('../../lib/utils');

/**
* @api {get} /sys/getRoleList 获取角色列表，仅限获取低于自身角色等级角色
* @apiName 获取角色列表
* @apiGroup system
* @apiSuccess {Array} result 角色列表
* @apiUse Common
* @apiUse Page
*/
router.get('/getRoleListByPage', async (req, res, next) => {
  try {
    const sql = `
        SELECT 
        name, code, level,
        is_default, remarks,
        operater,
        DATE_FORMAT(update_time, "%Y-%m-%d %H:%i:%s") as update_time, id
        FROM sys_role
      `;
    const byPageSql = handlePageSql(req, sql);
    const queryRes = await Promise.allSettled([
      querySql(byPageSql),
      querySql(`SELECT COUNT(*) as total FROM sys_role`)
    ])
    const roleList = queryRes[0]?.value;
    const total = queryRes[1]?.value[0]?.total;
    res.send({
      code: 0,
      msg: '获取成功',
      result: (roleList || []),
      total: total || 0
    })
  } catch (err) {
    next(err);
  }
})

/**
* @api {get} /sys/getRoleList 获取角色列表，仅限获取低于自身角色等级角色
* @apiName 获取角色列表
* @apiGroup system
* @apiSuccess {Array} result 角色列表
* @apiUse Common
*/
router.get('/getRoleList', async (req, res, next) => {
  try {
    const roleList = await querySql(`
      SELECT 
      name, code, level,
      is_default, remarks,
      operater,
      DATE_FORMAT(update_time, "%Y-%m-%d %H:%i:%s") as update_time, id
      FROM sys_role
    `);
    res.send({
      code: 0,
      msg: '获取成功',
      result: (roleList || []),
    })
  } catch (err) {
    next(err);
  }
})

/**
* @api {get} /sys/getRoleList 获取角色列表，仅限获取低于自身角色等级角色
* @apiName 获取角色列表
* @apiGroup system
* @apiSuccess {Array} result 角色列表
* @apiUse Common
* @apiUse Page
*/
router.get('/getRoleList', async (req, res, next) => {
  try {
    const sql = `
        SELECT 
        name, code, level,
        is_default, remarks,
        operater,
        DATE_FORMAT(update_time, "%Y-%m-%d %H:%i:%s") as update_time, id
        FROM sys_role
      `;
    const byPageSql = handlePageSql(req, sql);
    const queryRes = await Promise.allSettled([
      querySql(byPageSql),
      querySql(`SELECT COUNT(*) as total FROM sys_role`)
    ])
    const roleList = queryRes[0]?.value;
    const total = queryRes[1]?.value[0]?.total;
    res.send({
      code: 0,
      msg: '获取成功',
      result: (roleList || []),
      total: total || 0
    })
  } catch (err) {
    next(err);
  }
})

/**
* @api {post} /sys/addRole 添加角色，角色等级仅限设置为低于自身角色等级
* @apiName 添加角色
* @apiParam {String} name 角色名称
* @apiParam {String} code 角色编码（用于，鉴权需唯一）
* @apiParam {Number} level 角色级别
* @apiParam {String} remarks 备注
* @apiGroup system
* @apiUse Common
*/
router.post('/addRole', async (req, res, next) => {
  try {
    const { name, code, level, remarks } = req.body;
    const { account, name: userName } = req.user;
    await querySql(`
      INSERT INTO sys_role
      (name, code, level, remarks, operater)
      VALUES(?, ?, ?, ?, ?)
    `, [name, code, level, remarks, userName || account])
    res.send({
      code: 0,
      msg: '添加角色成功'
    })
  } catch (err) {
    res.send({
      code: -1,
      msg: '添加角色失败'
    })
  }
})

/**
* @api {post} /sys/batchDeleteRole 删除角色，可批量
* @apiName 删除角色
* @apiParam {Array} roleIds 角色id数组
* @apiGroup system
* @apiUse Common
*/
router.post('/batchDeleteRole', apiAuth, async (req, res, next) => {
  try {
    const { roleIds } = req.body;
    await querySql(`DELETE FROM sys_role WHERE id IN (${roleIds.toString()})`);
    res.send({
      code: 0,
      msg: '删除角色成功'
    })
  } catch (err) {
    next(err);
  }
})

/**
* @api {post} /sys/updateRole 更新角色，角色等级仅限设置为低于自身角色等级
* @apiName 更新角色
* @apiParam {String} name 角色名称
* @apiParam {String} code 角色编码（用于，鉴权需唯一）
* @apiParam {Number} level 角色级别
* @apiParam {String} remarks 备注
* @apiGroup system
* @apiUse Common
*/
router.post('/updateRole', async (req, res, next) => {
  try {
    const { name, code, level, remarks, id } = req.body;
    const { name: userName, account } = req.user;
    await querySql(`
      UPDATE sys_role SET
      name = ?, code = ?, level = ?,
      remarks = ?, operater = ?
      WHERE id = ?
    `, [name, code, level, remarks, userName || account, id])
    res.send({
      code: 0,
      msg: '更新角色成功'
    })
  } catch (err) {
    res.send({
      code: -1,
      msg: '更新角色失败'
    })
  }
})

/**
* @api {post} /sys/roleMenuAuth 角色菜单授权，仅限操作低于自身角色等级的角色
* @apiName 角色菜单授权
* @apiParam {String} roleCode 角色编码
* @apiParam {Array} menuIds 菜单ids
* @apiGroup system
* @apiUse Common
*/
router.post('/roleMenuAuth', async (req, res, next) => {
  try {
    const { roleCode, menuIds } = req.body;
    await querySql(`DELETE FROM sys_role_menu WHERE role_code = ?`, [roleCode]);
    await querySql(`
      INSERT INTO sys_role_menu(role_code, menu_id) VALUE
      ${menuIds.map(item => `(${escape(roleCode)}, ${item})`).toString()}
    `)
    res.send({
      code: 0,
      msg: '菜单授权成功'
    })
  } catch (err) {
    next(err);
  }
})

/**
* @api {get} /sys/getRoleMenu 获取指定角色的授权菜单
* @apiName 获取角色菜单
* @apiParam {String} roleCode 角色编码
* @apiGroup system
* @apiSuccess {Array} result 角色菜单
* @apiUse Common
*/
router.get('/getRoleMenu', async (req, res, next) => {
  try {
    const { roleCode } = req.query;
    const menuList = await querySql(`SELECT menu_id FROM sys_role_menu WHERE role_code = ?`, [roleCode]);
    res.send({
      code: 0,
      msg: '获取成功',
      result: menuList.map(item => item.menu_id)
    })
  } catch (err) {
    next(err);
  }
})

/**
* @api {post} /sys/updateDefaultRole 设置默认角色，一般用不到，仅能设置比自身角色级别低的角色
* @apiName 设置默认角色
* @apiParam {String} roleCode 角色编码
* @apiGroup system
* @apiUse Common
*/
router.post('/updateDefaultRole', apiAuth, async (req, res, next) => {
  try {
    const { roleCode } = req.body;
    await querySql(`UPDATE sys_role SET is_default = 0 WHERE is_default = 1`)
    await querySql(`UPDATE sys_role SET is_default = 1 WHERE code = ?`, [roleCode]);
    res.send({
      code: 0,
      msg: '设置默认角色成功'
    })
  } catch (err) {
    next(err);
  }
})