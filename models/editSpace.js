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
    // status: {
    //   type: Sequelize.TINYINT,
    //   defaultValue: 0, //默认0为未点赞，1为已点赞
    // },
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
    // uid: {
    //   type: Sequelize.INTEGER, //用户id
    // },
    commentId: {
      type: Sequelize.INTEGER, //评论者id
    },
    spaceId: {
      type: Sequelize.INTEGER, //动态id
    },
    comment: {
      type: Sequelize.STRING(100),
    },
    createTime: {
      type: Sequelize.STRING(100),
      defaultValue: Date.now(),
    },
  },
  { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);
const replyFormModel = sequelize.define(
  "replyForm",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true, //主键
      autoIncrement: true, //自动递增
    },
    replyId: {
      type: Sequelize.INTEGER, //回复者id
    },
    commentUid: {
      type: Sequelize.INTEGER, //评论者id
    },
    commentId: {
      type: Sequelize.INTEGER, //评论id
    },
    spaceId: {
      type: Sequelize.INTEGER, //动态id
    },
    replyComment: {
      type: Sequelize.STRING(100),
    },
    createTime: {
      type: Sequelize.STRING(100),
      defaultValue: Date.now(),
    },
  },
  { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);
module.exports = { likeFormModel, commentFormModel,replyFormModel };
