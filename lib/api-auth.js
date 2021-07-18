const querySql = require('../db');

module.exports = async function apiAuth(req, res, next) {
  const { role } = req.user;
  console.log(role);
  const authQuery = await querySql(
    `SELECT 1 FROM sys_role_api WHERE api = ? AND role_code = ?`, 
    [req.originalUrl, role]
  )
  console.log(authQuery);
  if(authQuery.length > 0) return next();
  res.send({
    code: -1,
    msg: '无权限操作'
  })
}
