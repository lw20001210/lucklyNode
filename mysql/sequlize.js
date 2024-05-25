const Sequelize = require("sequelize");
// 配置sequlize连接数据库
// 参数1：数据库名，参数2：用户名，参数3：密码。{参数1：数据库主机地址，参数2：数据库类型，参数3：是否打印日志}
const sequelize = new Sequelize("mychatapp", "root", "admin123", {
  host: "127.0.0.1",
  // port:"3307",
  port:"3306",
  dialect: "mysql",
  logging: false,
});

module.exports = sequelize;
