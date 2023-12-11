const express = require("express");
// 引入 cookie-parser 中间件
const userRoute = require("./router/users");
const mySpaceRoute = require("./router/mySpace");
const editSpaceRoute = require("./router/editSpace");
const friendRoute=require("./router/friendShip")
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors"); //跨域
const config = require("./config");
const expressJWT = require("express-jwt"); //一定要在路由之前配置
const { mainUrl } = require("./config");
app.use(cors());
// 导入 Sequelize连接数据库 和模型定义
const sequelize = require("./mysql/sequlize");
const UserModel = require("./models/usersModel.js");
const mySpace = require("./models/mySpace");
const { likeFormModel, commentFormModel,replyFormModel } = require("./models/editSpace");
const {applyListModel,friendShipModel}=require("./models/friendShip.js")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态资源,方便我们前端以往网络图片形式访问
app.use("/static/avatar", express.static("static/avatar"));
app.use("/static/mySpace", express.static("static/mySpace"));
// 定义 token 的解析中间件，并排除 user/register和user/login 相关路由
app.use(
  expressJWT({ secret: config.Keys }).unless({
    path: [/^\/user\/register/, /^\/user\/login/],
  })
);
// 测试git上传仓库 这个就是别名 githubLucklyNode

// 定义错误中间件
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError")
    return res.send({
      code: 401,
      msg: "token已失效",
    });
  res.send("服务器发生错误。");
});
// 挂载路由
app.use("/user", userRoute);
app.use("/user", mySpaceRoute);
app.use("/user", editSpaceRoute);
app.use("/user",friendRoute);
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
      console.log(`应用程序已启动，访问地址: ${mainUrl}`);
    });
  })
  .catch((error) => {
    console.error("数据库连接失败：", error);
  });
