const express = require("express");
const userRoute = require("./router/users");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors"); //跨域
const config = require("./config");
const expressJWT = require("express-jwt"); //一定要在路由之前配置
const { mainUrl } = require("./config");
// 导入 Sequelize连接数据库 和模型定义
const sequelize = require("./mysql/sequlize");
const UserModel = require("./models/usersModel.js");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// 静态资源,方便我们前端以往网络图片形式访问
app.use("/static", express.static("static"));

// 定义 token 的解析中间件，并排除 user/register和user/login 相关路由
app.use(
  expressJWT({ secret: config.Keys }).unless({
    path: [/^\/user\/register/, /^\/user\/login/],
  })
);

// 定义错误中间件
app.use((err, req, res, next) => {
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
      console.log(`应用程序已启动，访问地址: ${mainUrl}/user`);
    });
  })
  .catch((error) => {
    console.error("数据库连接失败：", error);
  });
