const express = require("express");
const moment = require("moment");
// const db = require("../mysql/userSql");
const UsersModel = require("../models/usersModel.js");
const fs = require("fs");
const path = require("path");
const { mainUrl } = require("../config");
const QRCode = require("qrcode"); //生成二维码
// 导入 bcryptjs加密 这个包
// const bcrypt = require("bcryptjs");
// 换md5加密算了，因为bcryptjs是单向加密的，无法解密
const md5 = require("md5");
const crypto = require("crypto");

// 导入生成 Token 的包
const jwt = require("jsonwebtoken");
// 解决form-data参数问题
var multipart = require("connect-multiparty");
let config = require("../config");
// 2.创建路由对象
const router = express.Router();
// 注册接口
router.post("/register", multipart(), async (req, res) => {
  let {
    username,
    password,
    createTime,
    nickname,
    sex,
    phone,
    email,
    birthday,
    signature,
    status,
  } = req.body;
  console.log(req.files);
  let imgObj = req.files.avatar.path;
  console.log(imgObj);
  if (!imgObj)
    return res.send({
      code: 500,
      msg: "未上传成功头像",
    });
  // 拿到头像的情况下
  let times = Date.now();
  const extension = path.extname(req.files.avatar.originalFilename); // 获取上传文件的后缀名
  const fileContent = fs.readFileSync(req.files.avatar.path);
  const newFileName = `${times}${extension}`; // 根据账号和后缀名生成新的文件名
  const uploadPath = path.join(__dirname, "../static/avatar", newFileName);
  fs.writeFileSync(uploadPath, fileContent); //把文件放入到我们想要的文件夹下
  let img = `${mainUrl}/static/avatar/${times}${extension}`; //main.js里面把这个文件夹资源开放了，方便以往前端以网络图片形式访问
  let newObj = {
    ...req.body,
    password: password,
    avatar: img,
    createTime: moment(Date.now()).format("YYYY/MM/DD HH:mm"),
  };
  let userRes = await UsersModel.findOne({
    where: {
      username: username,
    },
  });
  let nickRes = await UsersModel.findOne({
    where: {
      nickname: nickname,
    },
  });
  if (userRes)
    return res.send({
      msg: "用户已存在",
      code: 304,
    });
  if (nickRes)
    return res.send({
      msg: "昵称已占用",
      code: 304,
    });
  let result = await UsersModel.create({
    nickname,
    username,
    sex,
    phone,
    email,
    status,
    createTime,
    birthday,
    signature,
    ...newObj,
  });
  if (result) {
    res.send({
      msg: "注册成功",
      code: 200,
      data: userRes,
    });
  } else {
    res.send({
      msg: "注册失败",
      code: 500,
    });
  }
});
// 登录
router.post("/login", async (req, res) => {
  const userinfo = req.body;
  // 通过用户名查询用户
  let userRes = await UsersModel.findOne({
    where: {
      username: userinfo.username,
    },
  });
  // 如果没有查到该用户
  if (!userRes)
    return res.send({
      code: 500,
      msg: "该账号未被注册",
    });
  // 拿着用户输入的密码,和数据库中存储的密码进行对比
  // 如果对比的结果等于 false, 则证明用户输入的密码错误
  if (userinfo.password != userRes.password)
    return res.send({
      code: 500,
      msg: "密码错误",
    });
  // TODO：登录成功，生成 Token 字符串
  // // TODO_03：在登录成功之后，调用 jwt.sign() 方法生成 JWT 字符串。并通过 token 属性发送给客户端
  // //参数1：用户信息对象，参数2：加密的密匙，参数3：配置对象，可以配置当前token的有效期
  const tokenStr = jwt.sign({ username: userinfo.username }, config.Keys, {
    expiresIn: config.times,
  });
  res.send({
    code: 200,
    data: userinfo.username,
    msg: "登录成功！",
    token: "Bearer " + tokenStr, // 要发送给客户端的 token 字符串
  });
});
// 获取用户信息
router.get("/userInfo", async (req, res) => {
  const userinfo = req.query;
  // 通过用户名查询用户
  let userRes = await UsersModel.findOne({
    where: {
      username: userinfo.username,
    },
  });
  // 如果没有查到该用户
  if (!userRes)
    return res.send({
      code: 500,
      msg: "该账号未被注册",
    });
  // console.log(userRes.dataValues);
  res.send({
    msg: "获取用户信息成功",
    code: 200,
    data: userRes.dataValues,
  });
});
// 注销账号
router.delete("/delete", (req, res) => {
  console.log("删除接口", req.body);
  UsersModel.destroy({
    where: { id: req.body.id },
  })
    .then(() => {
      console.log("删除用户成功");
      res.send({
        code: 200,
        msg: "账号注销成功",
      });
    })
    .catch((error) => {
      console.log(error, "注销账号失败");
    });
});
// 更新用户信息
router.post("/update", multipart(), async (req, res) => {
  // 1判断是是否有该用户
  let userRes = await UsersModel.findOne({
    where: {
      username: req.body.username,
    },
  });
  if (!userRes) return res.send("数据库无该用户");
  let newObj = {};
  // 2判断是否能拿到头像
  let img = "";
  let times = Date.now();
  // let imgObj = req.files.avatar.path;
  if (req.files?.avatar?.path) {
    console.log(req.files.avatar.path);
    const fileContent = fs.readFileSync(req.files.avatar.path);
    const extension = path.extname(req.files.avatar.originalFilename); // 获取上传文件的后缀名
    const newFileName = `${times}${extension}`; // 根据账号和后缀名生成新的文件名
    const uploadPath = path.join(__dirname, "../static/avatar", newFileName);
    fs.writeFileSync(uploadPath, fileContent); //把文件放入到我们想要的文件夹下
    img = `${mainUrl}/static/avatar/${times}${extension}`; //main.js里面把这个文件夹资源开放了，方便以往前端以网络图片形式访问
    console.log(userRes.dataValues);
    newObj = { ...userRes.dataValues, ...req.body, avatar: img };
  } else {
    newObj = { ...userRes.dataValues, ...req.body };
  }

  UsersModel.update(newObj, {
    where: { username: req.body.username },
  })
    .then(async () => {
      console.log("更新用户成功");
      let userRes = await UsersModel.findOne({
        where: {
          username: req.body.username,
        },
      });
      console.log(userRes.dataValues);
      res.send({
        code: 200,
        msg: "更新成功",
        data: userRes.dataValues,
      });
    })
    .catch((error) => {
      console.error("更新用户失败", error);
      res.send({
        code: 500,
        msg: "更新失败",
      });
    });
});
// 生成2维码
router.post("/createQrcode", async (req, res) => {
  let { username } = req.body;
  if (username) {
    // 这里一定要传字符串，不然会报错
    let url = await QRCode.toDataURL(username.toString());
    if (url) {
      res.send({
        msg: "获取成功",
        data: url,
        code: 200,
      });
    } else {
      res.send({
        msg: "获取失败",
        code: 304,
      });
    }
  } else {
    res.send({
      msg: "获取失败",
      code: 304,
    });
  }
});
router.get('/searchAllUser', async (req, res) => {
  let allUser = await UsersModel.findAll()
  return res.send({
    code: 200,
    data: allUser
  })
})
module.exports = router;
