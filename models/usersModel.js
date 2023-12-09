const Sequelize = require("sequelize");
const sequelize = require("../mysql/sequlize");

const UsersModel = sequelize.define(
  "users",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true, //主键
      autoIncrement: true, //自动递增
    },
    username: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true, //唯一性
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
      defaultValue: "",
    },
    createTime: {
      type: Sequelize.STRING(100),
      defaultValue: Date.now(),
    },
    signature: {
      type: Sequelize.STRING(100),
      defaultValue: "别让自己在该奋斗的年纪选择安逸",
    },
  },
  { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);

module.exports = UsersModel;
