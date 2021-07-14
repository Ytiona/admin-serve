const express = require('express');
const router = express.Router();
const querySql = require('../db');
const { escape } = require('mysql');

const { getMenuSql } = require('../sql/menu');
const { generateTree, handlePageSql } = require('../lib/utils');

/**
 * @api {get} /sys/getMenuList 获取所有节点(菜单)
 * @apiName 获取所有节点
 * @apiGroup system
 * @apiSuccess {Array} result 菜单列表
 * @apiUse Common
 */
router.get('/getMenuList', async (req, res, next) => {
  try {
    const menuList = await querySql(getMenuSql);
    res.send({
      code: 0,
      msg: '获取成功',
      result: {
        menuList,
        menuTree: generateTree({ source: menuList })
      }
    })
  } catch (err) {
    next(err);
  }
})


/**
* @api {post} /sys/addNode 添加节点，栏目或顶层下可以添加任一类型，菜单下不能有栏目，权限项下不能有菜单和栏目
* @apiName 添加节点
* @apiGroup system
* @apiParam {String="0","1","2"} type 节点类型
* @apiParam {Number} [parent_id] 父节点id
* @apiParam {String} [parent_name] 父节点名称
* @apiParam {String} name 节点名称
* @apiParam {String} [code] 编码
* @apiParam {String} [icon] 图标
* @apiParam {String="0","1","2"} [icon_type] 图标类型
* @apiParam {String} path 节点路径
* @apiParam {String} [component_path] 前端组件路径
* @apiParam {Number} order_val 排序值
* @apiParam {String} [remarks] 说明
* @apiParam {Boolean} enabled 是否启用
* @apiUse Common
*/
router.post('/addNode', async (req, res, next) => {
  try {
    const {
      type, parent_id, parent_name, name, code,
      icon, icon_type, path, component_path,
      order_val, remarks, enabled
    } = req.body;
    const samePathQuery = await querySql('SELECT path FROM sys_menu WHERE path = ?', [path]);
    if (samePathQuery.length > 0) {
      return res.send({
        code: -1,
        msg: '路径已存在！'
      })
    }
    console.log([
      type, parent_id, parent_name,
      name, code, icon, icon_type,
      path, component_path,
      order_val, remarks, Number(enabled)
    ])
    await querySql(
      `
        INSERT INTO sys_menu 
        (
          type, parent_id, parent_name, 
          name, code, icon, icon_type,
          path, component_path, 
          order_val, remarks, enabled
        ) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        type, parent_id, parent_name,
        name, code, icon, icon_type,
        path, component_path,
        order_val, remarks, Number(enabled)
      ]
    )
    res.send({
      code: 0,
      msg: '添加节点成功'
    })
  } catch (err) {
    next(err);
  }
})

/**
* @api {post} /sys/updateNode 更新节点，不能更新类型、父级
* @apiName 更新节点
* @apiGroup system
* @apiParam {Number} id 节点id
* @apiParam {String="0","1","2"} type 节点类型
* @apiParam {String} name 节点名称
* @apiParam {String} [code] 编码
* @apiParam {String} [icon] 图标
* @apiParam {String="0","1","2"} [icon_type] 图标类型
* @apiParam {String} path 节点路径
* @apiParam {String} [component_path] 前端组件路径
* @apiParam {Number} order_val 排序值
* @apiParam {String} [remarks] 说明
* @apiParam {Boolean} enabled 是否启用
* @apiUse Common
*/
router.post('/updateNode', async (req, res, next) => {
  try {
    const {
      id, type, name, code, icon, icon_type,
      path, component_path,
      order_val, remarks,
      enabled
    } = req.body;
    const updateRes = await querySql(`
      UPDATE sys_menu 
      SET 
      type = ?, name = ?, code = ?, icon = ?, icon_type = ?,
      path = ?, component_path = ?, 
      order_val = ?, remarks = ?, 
      enabled = ?
      WHERE id = ?
    `, [
      type, name, code, icon, icon_type,
      path, component_path,
      order_val, remarks,
      enabled, id
    ])
    if (updateRes.affectedRows > 0) {
      res.send({ code: 0, msg: '更新节点成功' });
    } else {
      res.send({ code: -1, msg: '更新节点失败' });
    }
  } catch (err) {
    next(err);
  }
})

/**
* @api {post} /sys/batchDeleteNode 删除节点，可批量
* @apiName 删除节点
* @apiGroup system
* @apiParam {Array} nodeIds 节点id数组
* @apiUse Common
*/
router.post('/batchDeleteNode', async (req, res, next) => {
  try {
    const { nodeIds } = req.body;
    const delRes = await querySql(`UPDATE sys_menu SET is_del = 1 WHERE is_del <> 1 AND id IN (${nodeIds.toString()})`);
    console.log(delRes);
    const { changedRows } = delRes;
    if (changedRows > 0) {
      res.send({
        code: 0,
        msg: `成功删除${delRes.changedRows}个节点`,
        result: delRes.changedRows
      })
    } else {
      res.send({
        code: -1,
        msg: `删除节点失败，节点不存在`,
        result: delRes.changedRows
      })
    }
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
    const { userName } = req.user;
    await querySql(`
      INSERT INTO sys_role
      (name, code, level, remarks, operater)
      VALUES(?, ?, ?, ?, ?)
    `, [name, code, level, remarks, userName])
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
router.post('/batchDeleteRole', async (req, res, next) => {
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
    const { userName } = req.user;
    await querySql(`
      UPDATE sys_role SET
      name = ?, code = ?, level = ?,
      remarks = ?, operater = ?
      WHERE id = ?
    `, [name, code, level, remarks, userName, id])
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
      msg: '菜单授权成功',
      result: menuList.map(item => item.menu_id)
    })
  } catch (err) {
    next(err);
  }
})

/**
* @api {get} /sys/getApiList 获取api列表
* @apiName 获取api列表
* @apiGroup system
* @apiSuccess {Array} result api列表
* @apiUse Common
*/
router.get('/getApiList', async (req, res, next) => {
  try {
    const apiList = await querySql(`
      SELECT 
      id, name, addr, method, 
      \`desc\`, \`group\`, params, 
      response, auth 
      FROM sys_api
    `);
    res.send({
      code: 0,
      msg: '菜单授权成功',
      result: apiList
    })
  } catch (err) {
    next(err);
  }
})

module.exports = router;