const express = require("express");
const userRoute = require("./router/users");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
app.use(bodyParser.json());
// 解析 url编码
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
//开放资源
//http://192.168.242.20:3000/static/333333.png
app.use("/static", express.static("static")); //公开头像 http://localhost:8086/static/avatar/avatar-1648961256880.jpg
const config = require("./config");
const joi = require("@hapi/joi");
const expressJWT = require("express-jwt"); //解析token的中间件
// 除了以user开头的接口都需要token
app.use(expressJWT({ secret: config.Keys }).unless({ path: [/^\/user/] }));
// 定义错误级别的中间件
app.use((err, req, res, next) => {
  // 验证失败导致的错误
  if (err instanceof joi.ValidationError) return res.send(err + "222");
  // 身份认证失败后的错误
  if (err.name === "UnauthorizedError") return res.send("身份认证失败！");
  // 未知的错误
  res.send(err + "111");
});
app.use("/user", userRoute);
app.listen(3000, () => {
  console.log("http://192.168.242.20:3000/user");
});
