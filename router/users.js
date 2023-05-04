const express = require("express");
const db = require("../mysql/userSql");
const bcrypt = require("bcryptjs");
var multipart = require("connect-multiparty");
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
        obj: newObj,
      });
    }
  });
});
router.post("/login", (req, res) => {});
module.exports = router;
