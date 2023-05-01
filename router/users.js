const express = require("express");
const db = require("../mysql/userSql");
var multipart = require("connect-multiparty");
// 2.创建路由对象
const router = express.Router();
router.post("/register", multipart(), (req, res) => {
  console.log(req.body);
  const sqlStr = "insert into users set ?";
  db.query(sqlStr, req.body, (err, data) => {
    if (err) {
      console.log(err.message);
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
      });
    }
  });
});
module.exports = router;
