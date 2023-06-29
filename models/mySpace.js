const Sequelize = require("sequelize");
const sequelize = require("../mysql/sequlize");
const { DataTypes } = require("sequelize");

const mySpacesModel = sequelize.define(
  "mySpaces",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true, //主键
      autoIncrement: true,
      unique: true, //唯一性
    },
    uid: {
      type: Sequelize.INTEGER,
    },
    content: {
      type: Sequelize.JSON,
    },
    position: {
      type: Sequelize.STRING(100),
    },
    status: {
      type: Sequelize.TINYINT,
      allowNull: true,
    },
    createTime: {
      type: Sequelize.STRING(100),
      defaultValue: Date.now(),
    },
  },
  { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);

module.exports = mySpacesModel;
