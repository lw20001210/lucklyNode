const express = require("express");
const { applyListModel, friendShipModel } = require("../models/friendShip");
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
// 获取申请表暂未处理人数
router.get("/getFriendNum", async (req, res) => {
    let data = await applyListModel.findAll({
        where: {
            acceptId: req.query.id,
            status: 0
        }
    });
    return res.send({
        code: 200,
        data: data
    })
})
// 创建好友关系并更新申请列表单个申请状态
router.post("/createShip", async (req, res) => {
    let data = await applyListModel.findOne({
        where: {
            sendId: req.body.friendId,
            acceptId: req.body.myId
        }
    })
    req.body.nameD = data?.dataValues?.nickname;
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
// 拒绝好友申请
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
// 删除好友申请记录
router.delete("/deleteApplyRecord", async (req, res) => {
    let result = await applyListModel.destroy({
        where: {
            sendId: req.body.sendId,
            acceptId: req.body.acceptId
        }
    })
    return res.send({
        code: 200,
        data: result
    })
})
// 获取好友列表
router.get("/getFriendList", async (req, res) => {
    let friendList = [];
    let data = await friendShipModel.findAll({
        where: {
            myId: req.query.id
        }
    })
    let userList = await UsersModel.findAll();
    data.forEach(item => {
        userList.forEach(ele => {
            if (item.dataValues.friendId == ele.dataValues.id) {
                ele.dataValues.remarked = item.dataValues.friendName
                friendList.push(ele)
            }
        })
    })
    let result = await friendShipModel.findAll({
        where: {
            friendId: req.query.id
        }
    })
    result.forEach(item => {
        userList.forEach(ele => {
            if (item.dataValues.myId == ele.dataValues.id) {
                ele.dataValues.remarked = item.dataValues.nameD
                friendList.push(ele)
            }
        })
    })
    let userInfo = await UsersModel.findOne({
        where: {
            id: req.query.id
        }
    })
    friendList.unshift(userInfo)
    return res.send({
        code: 200,
        data: friendList
    })
})
router.get("/getFriendInfo", async (req, res) => {
    //console.log(req.query);
    let userInfo = await UsersModel.findOne({
        where: {
            id: req.query.friendId
        }
    })
    //  console.log(userInfo,222);
    let friend = await friendShipModel.findOne({
        where: {
            myId: req.query.myId,
            friendId: req.query.friendId
        }
    })
    if (friend != null) {
        userInfo.dataValues.remarked = friend.dataValues.friendName;
    } else {
        let reFriend = await friendShipModel.findOne({
            where: {
                myId: req.query.friendId,
                friendId: req.query.myId
            }
        })
        // console.log(reFriend,99);
        userInfo.dataValues.remarked = reFriend.dataValues.nameD
    }
    //  console.log(friend,66);
    return res.send({
        code: 200,
        data: userInfo
    })
})
router.put("/updateFriendName", async (req, res) => {
    // console.log(req.body);

    //  console.log(userInfo,222);
    let friend = await friendShipModel.findOne({
        where: {
            myId: req.body.myId,
            friendId: req.body.friendId
        }
    })
    if (friend != null) {
        await friendShipModel.update({ friendName: req.body.remark }, {
            where: {
                id: friend.dataValues.id
            }
        });
    } else {
        let reFriend = await friendShipModel.findOne({
            where: {
                myId: req.body.friendId,
                friendId: req.body.myId
            }
        })
        console.log(reFriend, 99);
        await friendShipModel.update({ nameD: req.body.remark }, {
            where: {
                id: reFriend.dataValues.id
            }
        });
    }
    return res.send({
        code: 200,
        msg: "更新成功"
    })
})
router.delete("/removeFriend", async (req, res) => {
   let data= await friendShipModel.destroy({
        where: {
            myId: req.body.myId,
            friendId: req.body.friendId
        }
      });
      console.log(data,11);
      if(data==0){
        let result= await friendShipModel.destroy({
            where: {
                myId: req.body.friendId,
                friendId: req.body.myId
            }
          });
          console.log(result,22);
      }
    return res.send({
        code: 200,
        msg: "删除好友成功"
    })
})
module.exports = router