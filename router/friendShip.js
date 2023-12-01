const express = require("express");
const { applyListModel, remarkFormModel, friendShipModel } = require("../models/friendShip");
const UsersModel = require("../models/usersModel.js");
// 2.创建路由对象
const router = express.Router();
// 发送申请
router.post('/sendApply', async (req, res) => {
    let data = await applyListModel.findOne({
        where: {
            acceptId: req.body.acceptId,
            sendId: req.body.sendId
        }
    })
    if (data != null) {
        await applyListModel.update({
            createTime: Date.now(),
            content: req.body.content,
            nickname: req.body.nickname,
            status: 0
        }, {
            where: {
                acceptId: req.body.acceptId,
                sendId: req.body.sendId
            }
        })
    } else {
        console.log("创建新的");
        await applyListModel.create(req.body);
    }
    return res.send({
        code: 200,
        msg: "发送成功"
    })
})
// 更新申请列表数据库头像和获取申请列表数据
router.get('/getApplyList', async (req, res) => {
    let applyList = await applyListModel.findAll({ where: { acceptId: req.query.userId } });
    if (!applyList) return res.send({
        code: 404
    })

    const userList = await UsersModel.findAll();
    applyList.forEach(item => {
        userList.forEach((ele) => {
            if (item.sendId == ele.id) {
                applyListModel.update({ avatar: ele.avatar }, {
                    where: {
                        acceptId: item.acceptId,
                        sendId: ele.id
                    }
                })
            }
        })

    });

    let data = await applyListModel.findAll({
        where: {
            acceptId: req.query.userId
        }
    });
    return res.send({
        code: 200,
        data: data
    })
})
// 添加备注
router.post("/addRemark", async (req, res) => {
    let data = await remarkFormModel.findOne({
        where: {
            myId: req.body.myId,
            friendId: req.body.friendId
        }
    })
    if (data != null) {
        await remarkFormModel.update({
            nickName: req.body.Nickname
        }, {
            where: {
                myId: req.body.myId,
                friendId: req.body.friendId
            }
        })
    } else {
        await remarkFormModel.create(req.body)
    }
    return res.send({
        code: 200,
        data: req.body
    })
})
// 创建好友关系并更新申请列表单个申请状态
router.post("/createShip", async (req, res) => {
    // console.log(req.body, 111);
    await friendShipModel.create(req.body);
    applyListModel.update({ status: 1 }, {
        where: {
            acceptId: req.body.myId,
            sendId: req.body.friendId
        }
    })
    return res.send({
        code: 200,
    })
})
router.put("/rejectApply", async (req, res) => {
    applyListModel.update({ status: -1 }, {
        where: {
            acceptId: req.body.myId,
            sendId: req.body.friendId
        }
    })
    return res.send({
        code: 200,
    })
})
router.delete("/deleteApplyRecord", async (req, res) => {
    console.log(req.body);
    let result = await applyListModel.destroy({
        where: {
            sendId: req.body.sendId,
            acceptId: req.body.acceptId
        }
    })
    console.log(result, 11111);
    return res.send({
        code: 200,
        data: result
    })
})
// 获取好友列表
router.get("/getFriendList", async (req, res) => {
    let friendList = [];
   let data= await friendShipModel.findAll({
        where: {
            myId: req.query.id
        }
    })
    let userList=await UsersModel.findAll();
    data.forEach(item => {
        userList.forEach(ele => {
            if (item.dataValues.friendId == ele.dataValues.id) {
                friendList.push(ele)
            }
        })
    })
    let remarkList= await remarkFormModel.findAll({
        where: {
            myId: req.query.id
        }
    })
    friendList.forEach(item=>{
        remarkList.forEach(ele=>{
            if(ele.dataValues.friendId==item.dataValues.id){
                item.dataValues["remarked"]=ele.dataValues.nickName
            }
        })
    })
    let userInfo=await UsersModel.findOne({
        where:{
            id:req.query.id
        }
    })
    friendList.unshift(userInfo)
    console.log(friendList,111);
    return res.send({
        code: 200,
        data: friendList
    })
})
module.exports = router