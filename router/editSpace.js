const express = require("express");
// 2.创建路由对象
const router = express.Router();
const { likeFormModel, commentFormModel } = require("../models/editSpace");
// 更新点赞
router.post("/updateLike", async (req, res) => {
  let userInfo = req.body;
  console.log(userInfo);
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
      status: userInfo.isLike,
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
    likeFormModel
      .update(
        { status: userInfo.isLike },
        {
          where: {
            likeId: userInfo.id, //文章的id
            uid: userInfo.uid,
          },
        }
      )
      .then(() => {
        res.send({
          msg: "点赞成功",
          code: 200,
        });
      })
      .catch((error) => {
        console.error("更新点赞状态失败", error);
        res.send({
          msg: "点赞成功",
          code: 200,
        });
      });
  }
});
router.get("/getDetailInfo", async (req, res) => {
  likeFormModel.findAll().then((users) => {
    let newSpaceInfo = users.map((item) => {
      return item.dataValues;
    });
    console.log(newSpaceInfo);
    res.send({
      msg: "信息获取成功",
      code: 200,
      data: newSpaceInfo,
    });
  });
  // .catch((error) => {
  //   console.error("查询用户表失败", error);
  // });
});
module.exports = router;
