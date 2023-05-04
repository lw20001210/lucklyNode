const express = require("express");
const db = require("../mysql/userSql");
// 导入 bcryptjs 这个包
const bcrypt = require("bcryptjs");
// 导入生成 Token 的包
const jwt = require("jsonwebtoken");
var multipart = require("connect-multiparty");
let config = require("../config");
// 2.创建路由对象
const router = express.Router();
router.post("/register", multipart(), (req, res) => {
  console.log(req.body);
  console.log(req.files);
  if (!req.files.avatar.path) {
    return res.send({
      msg: "注册失败",
      code: 500,
    });
  }
  let newObj = {
    ...req.body,
    password: bcrypt.hashSync(req.body.password, 10),
    avatar: req.files.avatar.path,
  };
  const sqlStr = "insert into users set ?";
  db.query(sqlStr, newObj, (err, data) => {
    if (err) {
      // console.log(err.message);
      if (err.message.includes("for key 'users.username'")) {
        res.send({
          msg: "该用户已被注册",
          code: 500,
        });
      } else {
        res.send({
          msg: "注册失败",
          code: 500,
        });
      }
    } else {
      res.send({
        msg: "注册成功",
        code: 200,
        data: data,
        obj: { ...newObj, password: req.body.password },
      });
    }
  });
});
// 登录
router.post("/login", (req, res) => {
  const userinfo = req.body;
  const sql = `select * from users where username=?`;
  console.log(req.body);
  db.query(sql, userinfo.username, function (err, results) {
    if (err)
      return res.send({
        code: 500,
        msg: "登录失败",
      });
    if (results.length != 1)
      return res.send({
        code: 500,
        msg: "该账号未被注册",
      });
    // 拿着用户输入的密码,和数据库中存储的密码进行对比
    // 如果对比的结果等于 false, 则证明用户输入的密码错误
    const compareResult = bcrypt.compareSync(
      userinfo.password,
      results[0].password
    );
    if (!compareResult)
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
      msg: "登录成功！",
      token: "Bearer " + tokenStr, // 要发送给客户端的 token 字符串
    });
  });
});
module.exports = router;
