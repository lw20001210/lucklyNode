const Sequelize = require("sequelize");
const sequelize = require("../database");

const UsersModele = sequelize.define("users", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: Sequelize.STRING(50),
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  nickname: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
  avatar: {
    type: Sequelize.STRING(100),
    allowNull: false,
    defaultValue: "D:新的开始Vue3项目\travelssrcassetsimghome", // 这里自行替换为默认图片的路径
  },
  sex: {
    type: Sequelize.ENUM("male", "female"),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(50),
    allowNull: false,
    unique: true,
  },
  birthday: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM("normal", "locked", "deleted"),
    allowNull: false,
    defaultValue: "normal",
  },
  createTime: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Data,
  },
  signature: {
    type: Sequelize.STRING(100),
    allowNull: false,
    defaultValue: Date.now,
  },
});

module.exports = UsersModele;
