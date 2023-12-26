const Sequelize = require("sequelize");
const sequelize = require("../mysql/sequlize");
const privateChatModel = sequelize.define(
    "privateChat",
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true, //主键
            autoIncrement: true,
            unique: true, //唯一性
        },
        fromUid: {
            type: Sequelize.INTEGER,
        },
        toUid: {
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
            defaultValue: Date.now(),
        },
    },
    { timestamps: false } //这个它会自动生成两个时间字段，我不需要·，所以弄掉了
);

module.exports = privateChatModel;
