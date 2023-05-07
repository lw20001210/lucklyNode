const express = require("express");
const userRoute = require("./router/users");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const config = require("./config");
const joi = require("@hapi/joi");
const expressJWT = require("express-jwt");

// 导入 Sequelize连接数据库 和模型定义
const sequelize = require("./mysql/sequlize");
const UserModel = require("./models/usersModel.js");
// const PostModel = require("./models/Post");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// 静态资源
app.use("/static", express.static("static"));

// 定义 token 的解析中间件，并排除 user 相关路由
app.use(expressJWT({ secret: config.Keys }).unless({ path: [/^\/user/] }));

// 定义错误中间件
app.use((err, req, res, next) => {
  if (err instanceof joi.ValidationError) return res.send(err.message);
  if (err.name === "UnauthorizedError") return res.send("身份验证失败。");
  res.send("服务器发生错误。");
});

// 挂载路由
app.use("/user", userRoute);

// 连接数据库并同步数据表
sequelize
  .authenticate()
  .then(() => {
    console.log("数据库连接成功。");
    return sequelize.sync();
  })
  .then(() => {
    console.log("数据表同步成功。");
    app.listen(3000, () => {
      console.log("应用程序已启动，访问地址: http://192.168.242.20:3000/user");
    });
  })
  .catch((error) => {
    console.error("数据库连接失败：", error);
  });
