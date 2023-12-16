const express = require("express");
const app = express();//创建express服务器实例
const bodyParser = require("body-parser");// 引入 cookie-parser 中间件
const cors = require("cors"); //跨域
const config = require("./config");
const expressJWT = require("express-jwt"); //一定要在路由之前配置

// const socket = require('socket.io');
// const http = require('http')
// const server = http.createServer(app);
// const io = socket(server, {
//   // path: '/socket.io/2', // 设置请求路径
//   cors: {
//     origin: "*"
//   }
// })


const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(cors());//将cors注册为全局中间件，解决跨域问题
// 解析post请求（表单、json数据）
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

// 导入 Sequelize连接数据库 和模型定义
const sequelize = require("./mysql/sequlize");
const UserModel = require("./models/usersModel.js");
const mySpace = require("./models/mySpace");
const { likeFormModel, commentFormModel, replyFormModel } = require("./models/editSpace");
const { applyListModel, friendShipModel } = require("./models/friendShip.js")

// 引入路由
const userRoute = require("./router/users");
const mySpaceRoute = require("./router/mySpace");
const editSpaceRoute = require("./router/editSpace");
const friendRoute = require("./router/friendShip")

// 挂载路由
app.use("/user", userRoute);
app.use("/user", mySpaceRoute);
app.use("/user", editSpaceRoute);
app.use("/user", friendRoute);

// socket.io连接
io.on('connection', (socket) => {
  let socketId = socket.id //客户唯一标识
  console.log('socket.io服务器连接成功', socket.id);
  setInterval(() => {
    socket.emit("init", "我是服务端推送过来的" + socketId)
  }, 1000)
  socket.emit("init", "我是服务端推送过来的" + socketId)
  socket.on('chat', (msg) => {
    console.log('message: ' + msg);
  });
  socket.on('msgs', (msg) => {
    console.log('message: ' + msg);
  });
});


//server.listen(8080); // 聊天室端口 
http.listen(3000, () => {
  console.log(`应用程序已启动，访问地址: ${config.mainUrl}`);
});

// 连接数据库并同步数据表
// sequelize
//   .authenticate()
//   .then(() => {
//     console.log("数据库连接成功。");
//     return sequelize.sync();
//   })
//   .then(() => {
//     console.log("数据表同步成功。");
//     app.listen(3000, () => {
//       console.log(`应用程序已启动，访问地址: ${mainUrl}`);
//     });
//   })
//   .catch((error) => {
//     console.error("数据库连接失败：", error);
//   });

