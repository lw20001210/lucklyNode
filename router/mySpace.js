const express = require("express");
// 2.创建路由对象
const router = express.Router();
const fs = require("fs");
const UsersModel = require("../models/usersModel.js");
var multipart = require("connect-multiparty");
const mySpaceModel = require("../models/mySpace");
const { friendShipModel } = require("../models/friendShip");
const path = require("path");
const { mainUrl } = require("../config");
const { likeFormModel, commentFormModel, replyFormModel } = require("../models/editSpace");
router.post("/sedSpace", multipart(), async (req, res) => {
  let arrImg = [];
  // console.log(req.files.file,333);
  // console.log(req.files.file?.type, 9999);
  // console.log(req.files.file?.type == 'text/html', 9999);
  if (req.files) {
    for (let i in req.files) {
      console.log(req.files[i].path, 333);
      arrImg.push(req.files[i].path);
    }
  }
  let newImg = [];
  let times = Date.now();
//   console.log(typeof(req.files.file));
// console.log(typeof(req.files.file)=='undefined',100);
  if (req.files.file?.type != 'text/html' || typeof(req.files.file)!='undefined') {
    arrImg.forEach((item, i) => {
      const fileContent = fs.readFileSync(item);
      const extension = path.extname(item); // 获取上传文件的后缀名
      const newFileName = `${times}${i}${extension}`; // 根据时间和后缀名生成新的文件名
      const uploadPath = path.join(__dirname, "../static/mySpace", newFileName);
      fs.writeFileSync(uploadPath, fileContent); //把文件放入到我们想要的文件夹下
      let img = `${mainUrl}/static/mySpace/${times}${i}${extension}`; //main.js里面把这个文件夹资源开放了，方便以往前端以网络图片形式访问
      newImg.push(img);
    });
  }


  let newObj = {
    ...req.body,
    content: {
      title: req.body.content,
      imgArr: newImg,
    },
    createTime: times,
  };
  let result = await mySpaceModel.create({
    ...newObj,
  });
  if (result) {
    res.send({
      msg: "发布成功",
      code: 200,
      data: newObj,
    });
  }
});
// 获取个人空间信息
router.get("/getMySpaceInfo", async (req, res) => {
  // console.log(req.query.id);
  let userList = await UsersModel.findAll();
  //我的所有动态
  let spaceList = await mySpaceModel.findAll({
    where: {
      uid: req.query.id,
    },
  });
  if (!spaceList)
    return res.send({
      msg: "查不到数据",
      code: 404,
    });
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
      //console.log(spaceList, 11); // 检查已经更新的spaceList，likes已经填充
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
// 获取最新动态信息
router.get("/getNewSpace", async (req, res) => {
  let userInfos = await UsersModel.findOne({
    where: {
      id: req.query.id
    }
  });
  let data = await mySpaceModel.findAll({
    where: {
      uid: req.query.id
    }
  });
  if (userInfos) {
    userInfos.dataValues.result = []
  }
  if (data.length != 0) {
    userInfos.dataValues.result.push(data[data.length - 1]); // 否则将最后一个元素赋值给result
  }
  let friend = await friendShipModel.findOne({
    where: {
      myId: req.query.id
    }
  })
  if (friend != null) {
    userInfos.dataValues.remarked = friend.dataValues.nameD
  } else {
    let reFriend = await friendShipModel.findOne({
      where: {
        friendId: req.query.id,
      }
    })
    // console.log(reFriend,99);
    userInfos.dataValues.remarked = reFriend.dataValues.friendName
  }
  return res.send({
    code: 200,
    data: userInfos
  });
});

module.exports = router;
