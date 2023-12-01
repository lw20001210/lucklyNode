const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");
const sequelize = require("../mysql/sequlize");
// 申请表
const applyListModel = sequelize.define("applyList", {
    status: {
        type: DataTypes.INTEGER, defaultValue: 0
        // 0代表显示操作项,1代表同意,-1代表已拒绝
    },
    sendId: {
        type: Sequelize.INTEGER,
    },
    acceptId: {
        type: Sequelize.INTEGER,
    },
    username: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    nickname: {
        type: Sequelize.STRING(100),
    },
    avatar: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: "D:新的开始Vue3项目\travelssrcassetsimghome", // 这里自行替换为默认图片的路径
      },
    content: {
        type: Sequelize.STRING(100),
    },
    createTime: {
        type: Sequelize.STRING(100),
        defaultValue: Date.now(),
    },
},
    { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);
// 备注表
const remarkFormModel = sequelize.define(
    "remarkForm",
    {
        myId: {
            type: Sequelize.INTEGER,
        },
        friendId: {
            type: Sequelize.INTEGER,
        },
        nickName: {
            type: Sequelize.STRING(100),
        }
    },
    { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
  );
//   好友关系表
  const friendShipModel = sequelize.define("friendShip", {
    myId: {
        type: Sequelize.INTEGER,
    },
    friendId: {
        type: Sequelize.INTEGER,
    },
    createTime: {
        type: Sequelize.STRING(100),
        defaultValue: Date.now(),
    },
},
    { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);
//两种定义方式都可以
module.exports = {remarkFormModel,applyListModel,friendShipModel};