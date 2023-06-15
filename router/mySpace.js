const express = require("express");
// 2.创建路由对象
const router = express.Router();
const fs = require("fs");
var multipart = require("connect-multiparty");
const mySpaceModel = require("../models/mySpace");
const path = require("path");
const { mainUrl } = require("../config");
router.post("/sedSpace", multipart(), async (req, res) => {
  // console.log(req.body);
  let arrImg = [];
  if (req.files) {
    for (let i in req.files) {
      arrImg.push(req.files[i].path);
    }
  }
  let newImg = [];
  let times = Date.now();
  arrImg.forEach((item, i) => {
    const fileContent = fs.readFileSync(item);
    const extension = path.extname(item); // 获取上传文件的后缀名
    const newFileName = `${times}${i}${extension}`; // 根据时间和后缀名生成新的文件名
    const uploadPath = path.join(__dirname, "../static/mySpace", newFileName);
    fs.writeFileSync(uploadPath, fileContent); //把文件放入到我们想要的文件夹下
    let img = `${mainUrl}/static/mySpace/${times}${i}${extension}`; //main.js里面把这个文件夹资源开放了，方便以往前端以网络图片形式访问
    newImg.push(img);
  });
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
  console.log(newObj.createTime);
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
  const mySpaceInfo = req.query;
  // console.log(mySpaceInfo);
  let userRes = await mySpaceModel.findAll({
    where: {
      uid: mySpaceInfo.keyId,
    },
  });
  if (!userRes)
    return res.send({
      msg: "查不到数据",
      code: 404,
    });
  let newSpaceInfo = userRes.map((item) => {
    return item.dataValues;
  });
  // console.log(newSpaceInfo);
  res.send({
    msg: "获取数据成功",
    code: 200,
    data: newSpaceInfo,
  });
});
router.delete("/deleteSpace", async (req, res) => {
  console.log(req.body);
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
