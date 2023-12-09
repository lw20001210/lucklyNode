const express = require("express");
// 2.创建路由对象
const router = express.Router();
const { Op } = require("sequelize");
const mySpaceModel = require("../models/mySpace");
const { friendShipModel } = require("../models/friendShip");
const { likeFormModel, commentFormModel } = require("../models/editSpace");
const UsersModel = require("../models/usersModel.js");
// 更新个人点赞
router.post("/updateLike", async (req, res) => {
  let userInfo = req.body;
  // console.log(userInfo,9999);
  let userRes = await likeFormModel.findOne({
    where: {
      likeId: userInfo.id, //文章的id
      uid: userInfo.uid, //用户id
    },
  });
  // console.log(userRes.dataValues, 11111);
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
// router.get("/getDetailInfo", async (req, res) => {
//   likeFormModel.findAll().then((users) => {
//     let newSpaceInfo = users.map((item) => {
//       return item.dataValues;
//     });
//     console.log(newSpaceInfo,666);
//     res.send({
//       msg: "信息获取成功",
//       code: 200,
//       data: newSpaceInfo,
//     });
//   });
// });
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
  // console.log(friendList, friendList.length, 1000);

  // 所有好友的对应动态
  let spaceList = [];
  let spaces = await mySpaceModel.findAll({
    where: {
      uid: {
        [Op.ne]: req.query.id
      }
    }
  });
  // console.log(spaces,1111);
  // console.log(spaces.length, 111);
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
  let likes = await likeFormModel.findAll()
  // for循环不支持异步
  // spaceList.forEach(ele => {
  //   ele.dataValues.likes = [];
  //   likes.forEach(async item => {
  //     if (ele.dataValues.id == item.dataValues.likeId) {
  //       // console.log(item.dataValues.uid);
  //       let data = await friendShipModel.findOne({
  //         where: {
  //           myId: item.dataValues.uid
  //         }
  //       })
  //       console.log(data, 1);
  //       if (data != null) {
  //         item.dataValues.remarked = data.dataValues.nameD;
  //       }
  //       let result = await friendShipModel.findOne({
  //         where: {
  //           friendId: item.dataValues.uid
  //         }
  //       })
  //       console.log(result, 2);
  //       if (result != null) {
  //         console.log(22222);
  //         item.dataValues.remarked = result?.dataValues?.friendName;
  //         console.log(item, 333);
  //       }
  //       ele.dataValues.likes.push(item)
  //     }
  //   })
  // })

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
          // ele.dataValues.likes.push(item);
        }
      }
    }
  }

  // 调用函数来处理likes数组
  processLikes().then(() => {
    //console.log(spaceList); // 检查已经更新的spaceList，likes已经填充
    return res.send({
      code: 200,
      data: spaceList
    })
  });
})
router.post("/comment",async (req,res)=>{
  console.log(req.body,11);
})
module.exports = router;
