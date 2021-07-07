const express = require('express');
const router = express.Router();
const querySql = require('../db');

const { getMenuSql } = require('../sql/menu');
const { generateTree } = require('../lib/utils');

/**
 * @api {get} /sys/getMenuList 获取所有菜单列表
 * @apiName getMenuList
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
  } catch(err) {
    next(err);
  }
})

  /**
  * @api {post} /sys/addNode 添加节点
  * @apiName addNode
  * @apiGroup system
  * @apiParam {String="0","1","2"} type 节点类型
  * @apiParam {Number} [parent_id] 父节点id
  * @apiParam {String} [parent_name] 父节点名称
  * @apiParam {String} name 节点名称
  * @apiParam {String} [code] 编码
  * @apiParam {String} [icon] 图标
  * @apiParam {String="0","1","2"} [icon_type] 图标类型
  * @apiParam {String} node_path 节点路径
  * @apiParam {String} [component_path] 前端组件路径
  * @apiParam {String} [request_addr] 请求地址
  * @apiParam {Number} order_val 排序值
  * @apiParam {String} [remarks] 说明
  * @apiParam {Boolean} enabled 是否启用
  * @apiUse Common
  */
router.post('/addNode', async (req, res, next) => {
  try {
    const { 
      type, parent_id, parent_name, name, code, 
      icon, icon_type, node_path, component_path, 
      request_addr, order_val, remarks, enabled 
    } = req.body;
    const samePathQuery = await querySql('SELECT node_path FROM menu_admin WHERE node_path = ?', [node_path]);
    if(samePathQuery.length > 0) {
      return res.send({
        code: -1,
        msg: '路径已存在！'
      })
    }
    console.log([
      type, parent_id, parent_name, 
      name, code, icon, icon_type,
      node_path, component_path, request_addr, 
      order_val, remarks, Number(enabled) 
    ])
    await querySql(
      `
        INSERT INTO menu_admin 
        (
          type, parent_id, parent_name, 
          name, code, icon, icon_type,
          node_path, component_path, request_addr, 
          order_val, remarks, enabled
        ) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, 
      [
        type, parent_id, parent_name, 
        name, code, icon, icon_type,
        node_path, component_path, request_addr, 
        order_val, remarks, Number(enabled) 
      ]
    )
    res.send({
      code: 0,
      msg: '添加节点成功'
    })
  } catch(err) {
    next(err);
  }
})
  /**
  * @api {post} /sys/updateNode 添加节点
  * @apiName updateNode
  * @apiGroup system
  * @apiParam {Number} id 节点id
  * @apiParam {String="0","1","2"} type 节点类型
  * @apiParam {String} name 节点名称
  * @apiParam {String} [code] 编码
  * @apiParam {String} [icon] 图标
  * @apiParam {String="0","1","2"} [icon_type] 图标类型
  * @apiParam {String} node_path 节点路径
  * @apiParam {String} [component_path] 前端组件路径
  * @apiParam {String} [request_addr] 请求地址
  * @apiParam {Number} order_val 排序值
  * @apiParam {String} [remarks] 说明
  * @apiParam {Boolean} enabled 是否启用
  * @apiUse Common
  */
router.post('/updateNode', async (req, res, next) => {
  try {
    const { 
      id, type, name, code, icon, icon_type,
      node_path, component_path, 
      request_addr, order_val, remarks, 
      enabled 
    } = req.body;
    const updateRes = await querySql(`
      UPDATE menu_admin 
      SET 
      type = ?, name = ?, code = ?, icon = ?, icon_type = ?,
      node_path = ?, component_path = ?, 
      request_addr = ?, order_val = ?, remarks = ?, 
      enabled = ?
      WHERE id = ?
    `, [
      type, name, code, icon, icon_type,
      node_path, component_path, 
      request_addr, order_val, remarks, 
      enabled, id
    ])
    if(updateRes.affectedRows > 0) {
      res.send({ code: 0, msg: '更新节点成功' });
    } else {
      res.send({ code: -1, msg: '更新节点失败' });
    }
  } catch(err) {
    next(err);
  }
})

router.post('/batchDeleteNode', async (req, res,next) => {
  try {
    const { nodeIds } = req.body;
    const delRes = await querySql(`UPDATE menu_admin SET is_del = 1 WHERE is_del <> 1 AND id IN (${nodeIds.toString()})`);
    console.log(delRes);
    const { changedRows } = delRes;
    if(changedRows > 0) {
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
  } catch(err) {
    next(err);
  }
})

module.exports = router;