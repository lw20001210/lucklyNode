const Sequelize = require("sequelize");
const sequelize = require("../mysql/sequlize");
const likeFormModel = sequelize.define(
  "likeForm",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true, //主键
      autoIncrement: true, //自动递增
  },
    likeId: {
      type: Sequelize.INTEGER, //点赞文章id
      defaultValue: 0, //0为未点赞
    },
    uid: {
      type: Sequelize.INTEGER, //点赞者id
      allowNull: false,
    },
    status: {
      type: Sequelize.TINYINT,
      defaultValue: 0, //默认0为未点赞，1为已点赞
    },
    createTime: {
      type: Sequelize.STRING(100),
      defaultValue: Date.now(),
    },
  },
  { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);
const commentFormModel = sequelize.define(
  "commentForm",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true, //主键
      autoIncrement: true, //自动递增
  },
    commentId: {
      type: Sequelize.INTEGER, //评论文章id
    },
    uid: {
      type: Sequelize.INTEGER, //评论者id
    },
    createTime: {
      type: Sequelize.STRING(100),
      defaultValue: Date.now(),
    },
  },
  { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);
module.exports = { likeFormModel, commentFormModel };
