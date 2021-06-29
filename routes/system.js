const express = require('express');
const router = express.Router();
const querySql = require('../db');

const { getMenuSql } = require('../sql/menu');
const { generateTree } = require('../lib/utils');

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

router.post('/addNode', async (req, res, next) => {
  try {
    const { 
      type, parent_id, name, code, icon, icon_type, 
      node_path, component_path, request_addr, 
      order_val, remarks, enabled 
    } = req.body;
    await querySql(
      `
        INSERT INTO menu_admin 
        (type, parent_id, name, code, icon, icon_type, 
        node_path, component_path, request_addr, 
        order_val, remarks, enabled) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, 
      [
        type, parent_id, name, code, icon, icon_type, 
        node_path, component_path, request_addr, 
        order_val, remarks, enabled 
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

module.exports = router;