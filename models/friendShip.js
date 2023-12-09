const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");
const sequelize = require("../mysql/sequlize");
// 申请表
const applyListModel = sequelize.define("applyList", {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true, //主键
        autoIncrement: true, //自动递增
    },
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
//   好友关系表
const friendShipModel = sequelize.define("friendShip", {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true, //主键
        autoIncrement: true, //自动递增
    },
    myId: {
        type: Sequelize.INTEGER,
    },
    friendId: {
        type: Sequelize.INTEGER,
    },
    nameD: {
        type: Sequelize.STRING(100),//别人给我的备注
    },
    friendName: {
        type: Sequelize.STRING(100),//我给别人的备注
    },
    createTime: {
        type: Sequelize.STRING(100),
        defaultValue: Date.now(),
    },
},
    { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);
//两种定义方式都可以
module.exports = { applyListModel, friendShipModel };