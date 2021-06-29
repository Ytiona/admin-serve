module.exports = {
  /**
   * 数据转换为树形（递归），示例：toTreeByRecursion(source, 'id', 'parentId', null, 'children')
   * @param {Array} source 数据
   * @param {String} idField 标识字段名称
   * @param {String} parentIdField 父标识字段名称
   * @param {Any} parentIdNoneValue 父级标识空值
   * @param {String} childrenField 子节点字段名称
   * @param {Object} treeOption tree树形配置
   */
  generateTree: function toTreeByRecursion({
    source = [],
    idField = 'id',
    parentIdField = 'parent_id',
    parentIdNoneValue = null,
    childrenField = 'children',
    treeOption = undefined
  }) {
    const treeOptions = Object.keys(source);
    // 合并tree树形配置
    if (treeOption) {
      Object.assign(treeOptions, treeOption)
    }
    // 对源数据深度克隆
    const cloneData = JSON.parse(JSON.stringify(source))
    return cloneData.filter(parent => {
      // 返回每一项的子级数组
      const branchArr = cloneData.filter(child => parent[idField] === child[parentIdField])
      // 绑定tree树形配置
      if (treeOptions.enable) {
        branchArr.map(child => {
          child[treeOptions.keyField] = child[treeOptions.keyFieldBind]
          child[treeOptions.valueField] = child[treeOptions.valueFieldBind]
          child[treeOptions.titleField] = child[treeOptions.titleFieldBind]
          return child
        })
      }
      // 如果存在子级，则给父级添加一个children属性，并赋值，否则赋值为空数组
      if (branchArr.length > 0) {
        parent[childrenField] = branchArr
      } else {
        parent[childrenField] = []
      }
      // 绑定tree树形配置
      if (treeOptions.enable) {
        parent[treeOptions.keyField] = parent[treeOptions.keyFieldBind]
        parent[treeOptions.valueField] = parent[treeOptions.valueFieldBind]
        parent[treeOptions.titleField] = parent[treeOptions.titleFieldBind]
      }
      return parent[parentIdField] === parentIdNoneValue // 返回第一层
    })
  }
}


