const express = require("express");
// 2.创建路由对象
const router = express.Router();
const { Op } = require("sequelize");
const mySpaceModel = require("../models/mySpace");
const { friendShipModel } = require("../models/friendShip");
const { likeFormModel, commentFormModel, replyFormModel } = require("../models/editSpace");
const UsersModel = require("../models/usersModel.js");
// 更新个人点赞
router.post("/updateLike", async (req, res) => {
  let userInfo = req.body;
  let userRes = await likeFormModel.findOne({
    where: {
      likeId: userInfo.id, //文章的id
      uid: userInfo.uid, //用户id
    },
  });
  //如果没有数据记录(初次点赞)
  if (!userRes) {
    const result = await likeFormModel.create({
      likeId: userInfo.id, //文章的id
      uid: userInfo.uid, //用户id
    });
    if (result) {
      res.send({
        msg: "点赞成功",
        code: 200,
      });
    } else {
      res.send({
        msg: "点赞失败",
        code: 500,
      });
    }
  } else {
    let data = await likeFormModel.destroy({
      where: {
        likeId: userInfo.id, //文章的id
        uid: userInfo.uid, //用户id
      }
    });
    console.log(data, 112424);
    res.send({
      msg: "取消点赞",
      code: 200,
    });
  }
});
// 获取好友动态列表
router.get("/getFriendDynamicList", async (req, res) => {
  let friendList = [];//所有好友
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
  // 所有好友的对应动态
  let spaceList = [];
  let spaces = await mySpaceModel.findAll({
    where: {
      uid: {
        [Op.ne]: req.query.id
      }
    }
  });
  spaces.forEach(item => {
    friendList.forEach(ele => {
      if (item.dataValues.uid == ele.dataValues.id) {
        spaceList.push(item)
      }
    })
  })
  spaceList.forEach(item => {
    friendList.forEach(ele => {
      if (item.dataValues.uid == ele.dataValues.id) {
        item.dataValues.remarked = ele.dataValues.remarked;
        item.dataValues.avatar = ele.dataValues.avatar;
      }
    })
  })
  let likes = await likeFormModel.findAll();
  let comments = await commentFormModel.findAll();
  let replys = await replyFormModel.findAll();
  async function processLikes() {
    for (const ele of spaceList) {
      ele.dataValues.likes = [];
      for (const item of likes) {
        if (ele.dataValues.id == item.dataValues.likeId) {
          let data = await friendShipModel.findOne({
            where: {
              myId: item.dataValues.uid,
              friendId: req.query.id
            }
          });

          if (data != null) {
            // console.log(data, 777);
            item.dataValues.remarked = data.dataValues.nameD;
            ele.dataValues.likes.push(item);
          }
          let result = await friendShipModel.findOne({
            where: {
              myId: req.query.id,
              friendId: item.dataValues.uid
            }
          });

          if (result != null) {
            // console.log(result, 8888);
            item.dataValues.remarked = result?.dataValues?.friendName;
            ele.dataValues.likes.push(item);
          }
          if (item.dataValues.uid == req.query.id) {
            userList.forEach(userItem => {
              if (userItem.dataValues.id == req.query.id) {
                item.dataValues.remarked = userItem.dataValues.nickname;
              }
            })
            ele.dataValues.likes.push(item);
          }
        }
      }
    }
  }
  async function processComments() {
    for (const ele of spaceList) {
      ele.dataValues.comments = [];
      for (const item of comments) {
        item.dataValues.replyList = [];
         // 给动态正常评论备注名
        if (ele.dataValues.id == item.dataValues.spaceId) {
          let data = await friendShipModel.findOne({
            where: {
              myId: item.dataValues.commentId,
              friendId: req.query.id
            }
          });

          if (data != null) {
            item.dataValues.remarked = data.dataValues.nameD;
            // 给予回复评论备注名
            for (const val of replys) {
              val.dataValues.replyName = '';
              if (item.dataValues.spaceId == val.dataValues.spaceId) {
                if (item.dataValues.id == val.dataValues.commentId) {
                  let twoData = await friendShipModel.findOne({
                    where: {
                      myId: val.dataValues.replyId,
                      friendId: req.query.id
                    }
                  });
                  if (twoData != null) {
                    val.dataValues.replyName = twoData.dataValues.nameD;
                  }
                  let twoResult = await friendShipModel.findOne({
                    where: {
                      myId: req.query.id,
                      friendId: val.dataValues.replyId,
                    }
                  });
                  if (twoResult != null) {
                    val.dataValues.replyName = twoResult.dataValues.friendName;
                  }
                  if (val.dataValues.replyId == req.query.id) {
                    userList.forEach(userItem => {
                      if (userItem.dataValues.id == val.dataValues.replyId) {
                        val.dataValues.replyName = userItem.dataValues.nickname;
                      }
                    })
                  }
                  item.dataValues.replyList.push({ ...val.dataValues });
                }

              }
            }
            ele.dataValues.comments.push(item);
          }
          let result = await friendShipModel.findOne({
            where: {
              myId: req.query.id,
              friendId: item.dataValues.commentId
            }
          });

          if (result != null) {
            item.dataValues.remarked = result?.dataValues?.friendName;
            // 给予回复评论备注名
            for (const val of replys) {
              val.dataValues.replyName = '';
              if (item.dataValues.spaceId == val.dataValues.spaceId) {
                if (item.dataValues.id == val.dataValues.commentId) {
                  let threeData = await friendShipModel.findOne({
                    where: {
                      myId: val.dataValues.replyId,
                      friendId: req.query.id
                    }
                  });
                  if (threeData != null) {
                    val.dataValues.replyName = threeData.dataValues.nameD;
                  }
                  let threeResult = await friendShipModel.findOne({
                    where: {
                      myId: req.query.id,
                      friendId: val.dataValues.replyId,
                    }
                  });
                  if (threeResult != null) {

                    val.dataValues.replyName = threeResult.dataValues.friendName;
                  }
                  if (val.dataValues.replyId == req.query.id) {
                    userList.forEach(userItem => {
                      if (userItem.dataValues.id == val.dataValues.replyId) {
                        val.dataValues.replyName = userItem.dataValues.nickname;
                      }
                    })
                  }
                  item.dataValues.replyList.push({ ...val.dataValues });
                }

              }
            }
            ele.dataValues.comments.push(item);
          }
          // console.log(ele.dataValues.comments.length,99);
          if (item.dataValues.commentId == req.query.id) {
            userList.forEach(userItem => {
              if (userItem.dataValues.id == req.query.id) {
                item.dataValues.remarked = userItem.dataValues.nickname;
              }
            })
            ele.dataValues.comments.push(item);
          }
        }
      }
    }
  }
  Promise.all([processLikes(), processComments()])
    .then(() => {
      //console.log(spaceList,11); // 检查已经更新的spaceList，likes已经填充
      res.send({
        msg: "获取数据成功",
        code: 200,
        data: spaceList
      });
    })
    .catch((error) => {
      // 处理错误
      console.error(error);
      res.status(500).send("获取数据失败");
    });
});
// 创建评论
router.post("/comment", async (req, res) => {
  // console.log(req.body,11);
  let data = await commentFormModel.create(req.body);
  if (data) {
    // console.log(data,33);
    return res.send({
      code: 200
    })
  }
})
// 回复评论
router.post("/replyComment", async (req, res) => {
  let data = await replyFormModel.create(req.body);
  return res.send({
    code: 200,
    data: req.body
  })
})
// 删除动态
router.delete("/deleteSpace", async (req, res) => {
  likeFormModel.destroy({
    where: {
      likeId: req.body.id,
    }
  })
  mySpaceModel
    .destroy({
      where: { id: req.body.id },
    })
    .then(() => {
      console.log("删除动态成功");

      res.send({
        code: 200,
        msg: "删除动态成功",
      });
    })
    .catch((error) => {
      console.log(error, "删除动态失败");
    });
});
module.exports = router;
