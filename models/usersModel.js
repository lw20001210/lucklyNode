const Sequelize = require("sequelize");
const sequelize = require("../mysql/sequlize");

const UsersModel = sequelize.define(
  "users",
  {
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
      type: Sequelize.TINYINT,
      defaultValue: 0,
    },
    email: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    phone: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },
    birthday: {
      type: Sequelize.STRING(100),
      defaultValue: "2021-12-31 23:59:59",
    },
    statu: {
      type: Sequelize.TINYINT,
      defaultValue: 0,
    },
    createTime: {
      type: Sequelize.STRING(100),
      defaultValue: Date.now(),
    },
    signature: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
  },
  { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);

module.exports = UsersModel;
