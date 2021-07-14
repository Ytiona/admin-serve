console.log('--------------开始构建api--------------');
const exec = require('child_process').exec;
const querySql = require('../db');

const cmd = 'apidoc -i ./routes -o apidoc/';

const charset = ['/', '—', '\\', '—'];
let count = 0;

const timer = setInterval(() => {
  count ++;
  process.stdout.write(`--------------正在构建api${charset[count % 4]}`+'--------------\r');
}, 100)

exec(cmd, (error, stdout, stderr) => {
  const apiData = require('../apidoc/api_data.json');
  build(apiData).then(() => {
    console.log(`--------------成功构建${apiData.length}个api--------------`);
    process.exit();
  }).finally(() => {
    clearInterval(timer);
  })
})

async function build(apiData) {
  // 获取需要鉴权的api
  const authApi = await querySql(`SELECT addr FROM sys_api WHERE auth = 1`);
  const authApiFlat = authApi.map(item => item.addr);
  // 清空表
  await querySql(`TRUNCATE TABLE sys_api`);
  const insertValues = apiData.map(item => {
    const { name, url, type, title, group } = item;
    const params = item?.parameter?.fields?.Parameter || [];
    const responseFields = item?.success?.fields || [];
    let response = [];
    if(responseFields) {
      response = responseFields['Success 200'] || [];
    }
    const fields = [
      name, url, type.toUpperCase(), 
      title, group,
      JSON.stringify(params.map(item => ({
        field: item.field,
        type: item.type,
        desc: item.description,
        optional: item.optional
      }))),
      JSON.stringify(response.map(item => ({
        field: item.field,
        type: item.type,
        desc: item.description
      }))),
      Number(authApiFlat.includes(url))
    ];
    return `(${fields.map(item => JSON.stringify(item)).toString()})`;
  })
  await querySql(`
    INSERT INTO sys_api(name, addr, method, \`desc\`, \`group\`, params, response, auth) VALUE
    ${insertValues.toString()}
  `)
}