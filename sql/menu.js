module.exports.getMenuSql = `
  SELECT 
  id, create_time, update_time,
  type, parent_id, name, icon, enabled,
  path, order_val, component_path, code,
  remarks, icon_type
  FROM sys_menu 
  WHERE is_del <> 1
  ORDER BY order_val ASC
`;

module.exports.menuFields = `
  id, create_time, update_time,
  type, parent_id, name, icon, enabled,
  path, order_val, component_path, code,
  remarks, icon_type
`