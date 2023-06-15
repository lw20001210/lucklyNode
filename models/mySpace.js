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
    },
    uid: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.JSON, //DataTypes是Sequelize的简化形式，比较好用
      allowNull: false,
    },
    position: {
      type: Sequelize.STRING(100),
    },
    statu: {
      type: Sequelize.TINYINT,
    },
    createTime: {
      type: Sequelize.STRING(100),
    },
  },
  { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);

module.exports = mySpacesModel;
