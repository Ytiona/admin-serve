module.exports.getMenuSql = `
  SELECT 
  id, create_time, update_time,
  type, parent_id, name, icon, enabled,
  node_path, order_val, component_path, code,
  remarks, request_addr, icon_type
  FROM menu_admin 
  WHERE is_del <> 1
  ORDER BY order_val ASC
`;

module.exports.menuFields = `
  id, create_time, update_time,
  type, parent_id, name, icon, enabled,
  node_path, order_val, component_path, code,
  remarks, request_addr, icon_type
`