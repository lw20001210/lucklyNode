const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");
const sequelize = require("../mysql/sequlize");
// 群表
const groupSchemaModel = sequelize.define("groupSchema", {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true, //主键
        autoIncrement: true, //自动递增
    },
    nickname: {//群昵称
        type: Sequelize.STRING(100),
    },
    adminId: {//创建者id
        type: DataTypes.INTEGER
    },
    intro: {//简介
        type: Sequelize.STRING(100),
    },
    avatar: {//群头像
        type: Sequelize.STRING(100),
    },
    type: {//群类型
        type: Sequelize.STRING(100),
        defaultValue:0
    },
    createTime: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: Date.now(),
    },
},
    { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);
// 群成员表
const groupUserSchemaModel = sequelize.define("groupUserSchema", {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true, //主键
        autoIncrement: true, //自动递增
    },
    uid: {//用户id
        type: DataTypes.INTEGER
    },
    groupId: {//群id
        type: DataTypes.INTEGER
    },
    state:{       //消息免打扰
        type: DataTypes.INTEGER,
        default:1
    },
    roleType:{      //0群主 1普通用户
        type: DataTypes.INTEGER,
        default:1
    },
    chartBackground:{   //聊天背景
        type: Sequelize.STRING(100),
        default:''
    },
    createTime: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: Date.now(),
    },
},
    { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);

const groupMsgSchemaModel = sequelize.define(
    "groupMsgSchema",
    {
        groupId: {//群id
            type: DataTypes.INTEGER
        },
        fromUid: {//发送者id
            type: Sequelize.INTEGER,
        },
        message: {
            type: Sequelize.JSON,
        },
        audioTime: {//语音时长
            type: Sequelize.INTEGER,
            allowNull:true,
            defaultValue: 0
        },
        type: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0//0为文本，1为图片，2为语音，3为位置
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0//未读,已读,-1已删除
        },
        latitude: {//纬度
            type: Sequelize.STRING(100),
            allowNull:true,
        },
        longitude: {//经度
            type: Sequelize.STRING(100),
            allowNull:true,
        },
        address: {//地址
            type: Sequelize.JSON,
            allowNull:true,
        },
        createTime: {
            type: Sequelize.STRING(100),
            allowNull: false,
            defaultValue: Date.now(),
        },
    },
    { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);




module.exports ={
    groupSchemaModel,
    groupUserSchemaModel,
    groupMsgSchemaModel
}