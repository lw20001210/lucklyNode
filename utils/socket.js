const privateChatModel = require("../models/privateChat");
const { Op } = require('sequelize');
const config = require("../config");
const fs = require("fs");
const { groupSchemaModel, groupUserSchemaModel, groupMsgSchemaModel } = require("../models/groups");

/**
 * 
 * 私聊功能
 */
// 创建一条聊天文字记录
const createTextMsg = async (obj,flag) => {
    if(flag){
        console.log("群聊");
        await groupMsgSchemaModel.create(obj)
    }else{
        console.log("私聊");
        await privateChatModel.create(obj);
    }
   
}
// 我这里开始是因为想把异步转换后的图片传回去通知好友，我自己则用本地图片就好，
const createImgMsg = (obj,flag) => {
    return new Promise((resolve, reject) => {
        let data = {};
        let time = Date.now();
        let path;
        if(flag){
            console.log("群聊");
            path=`static/groupImg/${time}.png`;
        }else{
            console.log("私聊");
            path= `static/chat/${time}.png`;
        }
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
                createTextMsg(obj,flag).then(() => {
                    resolve(data);
                }).catch((error) => {
                    reject(error);
                });
            }
        });
    });
}
// 处理语音文件
const createAudio = (obj,flag) => {
    return new Promise((resolve, reject) => {
        let data = {};
        let time = Date.now();
        let path = `static/audio/${time}.mp3`;
        let fullPath;
        if(flag){
            path = `static/groupAudio/${time}.mp3`
        }else{
            path = `static/audio/${time}.mp3`
        }
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
                createTextMsg(obj,flag).then(() => {
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
            fromUid: obj.toUid, toUid: obj.fromUid
        }
    });
    let data = await privateChatModel.findAll({
        where: {
            [Op.or]: [
                { fromUid: obj.fromUid, toUid: obj.toUid},
                { fromUid: obj.toUid, toUid: obj.fromUid },
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

/**
 * 群聊功能
 */
// 群聊文字信息

module.exports = { createTextMsg, createImgMsg,createAudio, getMsgList }