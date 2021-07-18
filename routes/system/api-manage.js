const router = require('./router');
const querySql = require('../../db');
const { escape } = require('mysql');

/**
* @api {get} /sys/getApiList 获取所有api
* @apiName 获取所有api
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
      msg: '获取成功',
      result: apiList
    })
  } catch (err) {
    next(err);
  }
})


/**
* @api {get} /sys/getAuthApiList 获取需要角色鉴权的api
* @apiName 获取鉴权api
* @apiGroup system
* @apiSuccess {Array} result api列表
* @apiUse Common
*/
router.get('/getAuthApiList', async (req, res, next) => {
  try {
    const apiList = await querySql(`
      SELECT 
      id, name, addr, method, 
      \`desc\`, \`group\`
      FROM sys_api
      WHERE auth = 1
    `);
    res.send({
      code: 0,
      msg: '获取成功',
      result: apiList
    })
  } catch (err) {
    next(err);
  }
})

/**
* @api {post} /sys/roleApiAuth 角色api授权，仅限操作低于自身角色等级的角色
* @apiName 角色api授权
* @apiParam {String} roleCode 角色编码
* @apiParam {Array} apiAddrs 接口地址数组
* @apiGroup system
* @apiUse Common
*/
router.post('/roleApiAuth', async (req, res, next) => {
  try {
    const { roleCode, apiAddrs } = req.body;
    await querySql(`DELETE FROM sys_role_api WHERE role_code = ?`, [roleCode]);
    await querySql(`
      INSERT INTO sys_role_api(api, role_code) VALUE
      ${apiAddrs.map(item => `(
          ${JSON.stringify(item)},
          ${JSON.stringify(roleCode)}
        )`).toString()}
    `)
    res.send({
      code: 0,
      msg: '接口授权成功'
    })
  } catch (err) {
    next(err);
  }
})

