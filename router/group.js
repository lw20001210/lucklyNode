const express = require("express");
const { groupSchemaModel, groupUserSchemaModel, groupMsgSchemaModel } = require("../models/groups");
const { Op } = require('sequelize');
const fs = require("fs");
const { mainUrl } = require("../config");
const path = require("path");
var multipart = require("connect-multiparty");
const { friendShipModel } = require("../models/friendShip");
const UsersModel = require("../models/usersModel.js");
// 2.创建路由对象
const router = express.Router();
// 创建群聊
router.post("/createGroup", async (req, res) => {
    console.log(req.body);
    let { nickname, adminId, intro, groupUserIds } = req.body;
    let data = await groupSchemaModel.create({ nickname, adminId, intro });

    groupUserIds.push(adminId)
    console.log(data.id,999);
    groupUserIds.forEach(async (item) => {
        let obj = {
            uid: item,
            groupId: data.id,
        }
        await groupUserSchemaModel.create(obj)
    });
    // console.log(data.id, 8888);
    let msg = {
        fromUid: adminId,
        groupId: data.id,
        message: intro,
        type: 0
    }
    await groupMsgSchemaModel.create(msg)
    return res.send({
        code: 200,
    })
})
// 获取群聊列表展示在home聊天列表界面
router.get("/getGroupList", async (req, res) => {
    // console.log(req.query);
    let allGroup = await groupSchemaModel.findAll()
    let data = await groupUserSchemaModel.findAll({
        where: {
            uid: req.query.uid
        }
    });
    let msgs=await groupMsgSchemaModel.findAll();
    let uniqueObjects = Array.from(msgs.reduce((map, obj) => map.set(obj.groupId, obj), new Map()).values());
    let result = allGroup.filter(item => {
        return data.some(val => {
            if (item.dataValues.id == val.dataValues.groupId) {
                return true;
            }
        })
    });
    if (result) {
        return res.send({
            code: 200,
            data: result,
            endMsgs:uniqueObjects
        })
    } else {
        throw new Error("数据为空");
    }
})
// 获取群友数据
router.get("/getGroupUsers", async (req, res) => {
    // console.log(req.query.groupId);
    let data = await groupUserSchemaModel.findAll({
        where: {
            groupId: req.query.groupId
        }
    });
    // let friendNames = await friendShipModel.findAll({
    //     where: {
    //         [Op.or]: [
    //             { myId: req.query.myId },
    //             { friendId: req.query.myId }
    //         ]
    //     }
    // })
    // let groupUserIds = [];
    // groupUserIds = friendNames.map(item => {
    //     if(item.id != req.query.myId){
    //         return item.id
    //     }
        
    // })
    // console.log(groupUserIds,98);
    // let names = []
    // groupUserIds.forEach(item => {
    //     friendNames.forEach(val => {
    //         if (item == val.dataValues.friendId) {
    //             return names.push(val.friendName)
    //         } else if (item == val.dataValues.myId) {
    //             return names.push(val.dataValues.nameD)
    //         } else {
    //             return
    //         }
    //     })
    // })
    if (data != null) {
        return res.send({
            code: 200,
            data
        })
    } else {
        throw new Error("获取群友数据失败");
    }
})
// 获取群友详细数据
router.get("/groupUserList", async (req, res) => {
    let data = await groupUserSchemaModel.findAll({
        where: {
            groupId: req.query?.groupId
        }
    });
    if (data != null) {
        let userListInfo = [];
        let allUsers = await UsersModel.findAll();
        userListInfo = allUsers.filter(item => {
            return data.some(val => {
                if (item.dataValues.id == val.dataValues.uid) {
                    return true
                }
            })
        })
        let friendList = await friendShipModel.findAll({
            where: {
                [Op.or]: [
                    { myId: req.query.myId },
                    { friendId: req.query.myId }
                ]
            }
        })
        //  console.log(friendList,35);
        userListInfo.forEach(item => {
            item.dataValues.remarked = ''
            friendList.forEach(val => {
                if (val.dataValues.myId == req.query.myId && item.dataValues.id == val.dataValues.friendId) {
                    return item.dataValues.remarked = val.dataValues.friendName
                } else if (val.dataValues.friendId == req.query.myId && item.dataValues.id == val.dataValues.nameD) {
                    return item.dataValues.remarked = val.dataValues.nameD
                } else {
                    return;
                }
            })
        })

        return res.send({
            code: 200,
            data: userListInfo
        })
    } else {
        throw new Error("获取群友数据失败");
    }
})
// 邀请好友进群
router.post("/inviteFriend", async (req, res) => {
    let { groupId, data } = req.body;
    //  console.log(req.body);
    data.forEach(async (item) => {
        let obj = {
            uid: item,
            groupId: groupId
        }
        await groupUserSchemaModel.create(obj)
    });
    return res.send({
        code: 200,
        data: req.body
    })
})
// 把好友踢出群
router.delete('/removeGroupUser', (req, res) => {
    console.log(req.body);
    let { groupId, result } = req.body;
    result.forEach(async (item) => {
        let obj = {
            uid: item,
            groupId: groupId
        }
        await groupUserSchemaModel.destroy({
            where: obj
        })
    });
    return res.send({
        code: 200,
        data: req.body
    })
})
// 获取该群信息
router.get("/getGroupInfo", async (req, res) => {
    let { groupId } = req.query;
    // console.log(groupId);
    let result = await groupSchemaModel.findOne({
        where: {
            id: groupId
        }
    })
    if (result != null) {
        // console.log(result, 222);
        return res.send({
            code: 200,
            data: result
        })
    }

})
// 更改群信息
router.put("/updateGroup", async (req, res) => {
    let { groupId, typed, message } = req.body;
    // type为1修改群名，2则修改头像，为3则修改群公告
    if (typed == 1) {
        groupSchemaModel.update({ nickname: message }, {
            where: {
                id: groupId
            }
        })
    } else {
        groupSchemaModel.update({ intro: message }, {
            where: {
                id: groupId
            }
        })
    }
    return res.send({
        code: 200,
    })
})
// 更新头像
router.post("/updateAvatar", multipart(), async (req, res) => {
    // 2判断是否能拿到头像
    let img = "";
    let times = Date.now();
    console.log(req.body);
    if (req.files?.avatar?.path) {
        console.log(req.files.avatar.path);
        const fileContent = fs.readFileSync(req.files.avatar.path);
        const extension = path.extname(req.files.avatar.originalFilename); // 获取上传文件的后缀名
        const newFileName = `${times}${extension}`; // 根据账号和后缀名生成新的文件名
        const uploadPath = path.join(__dirname, "../static/groupAvatar", newFileName);
        fs.writeFileSync(uploadPath, fileContent); //把文件放入到我们想要的文件夹下
        img = `${mainUrl}/static/groupAvatar/${times}${extension}`; //main.js里面把这个文件夹资源开放了，方便以往前端以网络图片形式访问
        groupSchemaModel.update({ avatar: img }, {
            where: {
                id: req.body.groupId
            }
        })
        return res.send({
            code: 200,
            msg: "更新成功"
        })
    } else {
        return res.send({
            code: 404
        })
    }

})
// 退出群聊
router.delete("/exitGroup", async (req, res) => {
    let { uid, groupId } = req.body;
    // console.log(uid,groupId);
    let data = await groupUserSchemaModel.destroy({
        where: {
            groupId,
            uid
        }
    })
    if (data != null) {
        return res.send({
            code: 200,
        })
    }
})
// 解散群聊
router.delete("/removeGroup", async (req, res) => {
    let { groupId } = req.body;
    console.log(groupId);
    await groupSchemaModel.destroy({
        where: {
            id: groupId
        }
    })
    await groupUserSchemaModel.destroy({
        where: {
            groupId: groupId
        }
    })
    return res.send({
        code: 200,
    })
})
// 获取群聊信息
router.get("/getGroupChats", async (req, res) => {
    let data = await groupMsgSchemaModel.findAll({
        where: {
            groupId: req.query.groupId
        }
    })
    if (data != null) {
        let num = req.query.page * (-req.query.pageNum)
        let newDate = data.slice(num)
        return res.send({
            code:200,
            data: newDate,
            total: data.length
        })
        // return res.send({
        //     code: 200,
        //     data
        // })
    }
})
module.exports = router;