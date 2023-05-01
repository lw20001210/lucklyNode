const mysql = require("mysql");
//2.建立于Mysql数据库的连接关系
const db = mysql.createPool({
  host: "127.0.0.1", //数据库的Ip地址
  user: "root", //登录数据库的账号
  password: "admin123", //'登录数据库的密码'
  database: "mychatapp", //指定要操作哪个数据库
});
// 测试mysql模块是否能正常工作
db.query("select 1", (err, result) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log(result);
  }
});
// 向外共享 db 数据库连接对象
module.exports = db;
