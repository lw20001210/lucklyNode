const express = require("express");
const app = express();//创建express服务器实例
const bodyParser = require("body-parser");// 引入 cookie-parser 中间件
const cors = require("cors"); //跨域
const config = require("./config");
const expressJWT = require("express-jwt"); //一定要在路由之前配置

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(cors());//将cors注册为全局中间件，解决跨域问题
// 解析post请求（表单、json数据）
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态资源,方便我们前端以往网络图片形式访问
app.use("/static/avatar", express.static("static/avatar"));
app.use("/static/mySpace", express.static("static/mySpace"));
app.use("/static/avatar", express.static("static/avatar"));
app.use("/static/chat", express.static("static/chat"));
app.use("/static/audio", express.static("static/audio"));
// 定义 token 的解析中间件，并排除 user/register和user/login 相关路由
app.use(
  expressJWT({ secret: config.Keys }).unless({
    path: [/^\/user\/register/, /^\/user\/login/],
  })
);
app.use((req, res, next) => {
  res.set("SameSite", "Lax");
  next();
});

// 测试git上传仓库 这个就是别名 githubLucklyNode
// 定义错误中间件
app.use((err, req, res, next) => {
  if (err) {
    if (err.name === "UnauthorizedError")
      return res.send({
        code: 401,
        msg: "token已失效",
      });
    res.send("服务器发生错误。");
  }

});

// 导入 Sequelize连接数据库 和模型定义
const sequelize = require("./mysql/sequlize");
const UserModel = require("./models/usersModel.js");
const mySpace = require("./models/mySpace");
const { likeFormModel, commentFormModel, replyFormModel } = require("./models/editSpace");
const { applyListModel, friendShipModel } = require("./models/friendShip.js")
const privateChatModel = require("./models/privateChat.js")

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

// 引入封装好的socket方法
const { createTextMsg, createImgMsg,createAudio, getMsgList } = require("./utils/socket.js");

// socket.io连接
let userList = [];//存储登录人员
io.on('connection', (socket) => {
  // 1.处理离线在线
  const uid = socket.handshake.query.id;
  if (!uid) return;
  const userInfo = userList.find(user => user.uid === uid);
  if (userInfo) {
    userInfo.socketId = socket.id;//每次登录的id都不一样
  } else {
    userList.push({
      socketId: socket.id,
      uid
    })
  }
  socket.emit("init", userList)//发送在线的用户给客户端
  socket.on('disconnect', (reason) => {//在这里可以执行用户离线后的操作 
    // console.log('User disconnected', reason, socket.handshake.query.id); //断开连接的用户id
    userList = userList.filter(item => {
      return item.uid != socket.handshake.query.id
    })
    socket.emit("init", userList);//更新在线人员数量
  });

  /**
   * 处理发送消息
   */
  //发送文字消息
  socket.on('chat', (data) => {
    createTextMsg(data);
    const userInfo = userList.find(user => user.uid === data.toUid);
    socket.to(userInfo.socketId).emit('msgNotice', data);//推送给好友那边
  });
  // 处理发送图片
  socket.on('getChatImg', async (data) => {
    let newData = await createImgMsg(data)
    data = newData;
    //await socket.emit('chatImg', data)
    const userInfo = userList.find(user => user.uid === data.toUid);
    socket.to(userInfo.socketId).emit('msgNotice', data);//推送给好友那边
  })
  // 处理语音消息
  socket.on('getChatVoice',async data=>{
    let newData = await createAudio(data)
    data = newData;
    const userInfo = userList.find(user => user.uid === data.toUid);
    socket.to(userInfo.socketId).emit('msgNotice', data);//推送给好友那边
  }) 
  // 获取聊天列表数据
  socket.on('getMsgList', (obj) => {
    getMsgList(obj).then(data => {
      socket.emit('msgList', data)
    });
  })
})


//  server.listen(8080); // 聊天室端口 
//  http.listen(3000, () => {
//   console.log(`应用程序已启动，访问地址: ${config.mainUrl}`);
// });

// 连接数据库并同步数据表
sequelize
  .authenticate()
  .then(() => {
    console.log("数据库连接成功。");
    return sequelize.sync();
  })
  .then(() => {
    console.log("数据表同步成功。");
    http.listen(3000, () => {
      console.log(`应用程序已启动，访问地址: ${config.mainUrl}`);
    });
    // app.listen(3000, () => {
    //   console.log(`应用程序已启动，访问地址: ${mainUrl}`);
    // });
  })
  .catch((error) => {
    console.error("数据库连接失败：", error);
  });

