const privateChatModel = require("../models/privateChat");
const { Op } = require('sequelize');
const config = require("../config");
const fs = require("fs");

/**
 * 
 * 私聊功能
 */
// 创建一条聊天文字记录
const createTextMsg = async (obj) => {
    await privateChatModel.create(obj);
}
// 我这里开始是因为想把异步转换后的图片传回去通知好友，我自己则用本地图片就好，
const createImgMsg = (obj) => {
    return new Promise((resolve, reject) => {
        let data = {};
        let time = Date.now();
        let path = `static/chat/${time}.png`;
        let fullPath;
        const base64 = obj.message.replace(/^data:image\/\w+;base64,/, "");
        const dataBuffer = Buffer.from(base64, 'base64');
        
        fs.writeFile(path, dataBuffer, function (err, doc) {
            if (err) {
                reject(err);
            } else {
                fullPath = `${config.mainUrl}/${path}`;
                console.log("保存成功");
                obj.message= fullPath;
                data = obj;
                createTextMsg(obj).then(() => {
                    resolve(data);
                }).catch((error) => {
                    reject(error);
                });
            }
        });
    });
}
// 处理语音文件
const createAudio = (obj) => {
    return new Promise((resolve, reject) => {
        let data = {};
        let time = Date.now();
        let path = `static/audio/${time}.mp3`;
        let fullPath;
        const base64 = obj.message.replace(/^data:image\/\w+;base64,/, "");
        const dataBuffer = Buffer.from(base64, 'base64');//把base64码转成buffer对象，
        
        fs.writeFile(path, dataBuffer, function (err, doc) {
            if (err) {
                reject(err);
            } else {
                fullPath = `${config.mainUrl}/${path}`;
                console.log("保存成功");
                obj.message= fullPath;
                data = obj;
                createTextMsg(obj).then(() => {
                    resolve(data);
                }).catch((error) => {
                    reject(error);
                });
            }
        });
    });
}
// 获取聊天列表
const getMsgList = async (obj) => {
    await privateChatModel.update({ status: 1 }, {
        where: {
            [Op.or]: [
                { fromUid: obj.fromUid, toUid: obj.toUid },
                { fromUid: obj.toUid, toUid: obj.fromUid }
            ]
        }
    });
    let data = await privateChatModel.findAll({
        where: {
            [Op.or]: [
                { fromUid: obj.fromUid, toUid: obj.toUid, status: 1 },
                { fromUid: obj.toUid, toUid: obj.fromUid, status: 1 },
            ]
        }
    })
    let num = obj.page * (-obj.pageNum)
    let newDate = data.slice(num)
    return {
        data: newDate,
        total: data.length
    }
}

module.exports = { createTextMsg, createImgMsg,createAudio, getMsgList }