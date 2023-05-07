const Sequelize = require("sequelize");
// 配置sequlize连接数据库
const sequelize = new Sequelize("mychatapp", '"root"', "admin123", {
  host: "127.0.0.1",
  dialect: "mysql",
  logging: false,
});

module.exports = sequelize;
