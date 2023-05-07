const express = require("express");
// const db = require("../mysql/userSql");
const UsersModel = require("../models/usersModel.js");
const fs = require("fs");
const path = require("path");
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
  } = req.body;
  // 拿到头像的情况下
  const fileContent = fs.readFileSync(req.files.avatar.path);
  const extension = path.extname(req.files.avatar.originalFilename); // 获取上传文件的后缀名
  const newFileName = `${req.body.username}${extension}`; // 根据账号和后缀名生成新的文件名
  const uploadPath = path.join(__dirname, "../static", newFileName);
  fs.writeFileSync(uploadPath, fileContent);
  let img = `http://192.168.242.20:3000/static/${req.body.username}${extension}`;
  let newObj = {
    ...req.body,
    password: md5(password),
    avatar: img,
  };
  // const sqlStr = "insert into users set ?";
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
  // 如果没有查到
  if (!userRes)
    return res.send({
      code: 500,
      msg: "该账号未被注册",
    });
  // 拿着用户输入的密码,和数据库中存储的密码进行对比
  // 如果对比的结果等于 false, 则证明用户输入的密码错误
  function md5Hash(text) {
    const hash = crypto.createHash("md5");
    hash.update(text);
    return hash.digest("hex");
  }
  if (md5Hash(userinfo.password) != userRes.password)
    return res.send({
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
    data: userRes.dataValues,
    msg: "登录成功！",
    token: "Bearer " + tokenStr, // 要发送给客户端的 token 字符串
  });
});

module.exports = router;
