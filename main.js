const express = require("express");
const app = express();//创建express服务器实例
const bodyParser = require("body-parser");// 引入 cookie-parser 中间件
const cors = require("cors"); //跨域
const config = require("./config");
const expressJWT = require("express-jwt"); //一定要在路由之前配置
const pathGlobal = require("path")
// socket.io
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(cors());//将cors注册为全局中间件，解决跨域问题

// 解析post请求（表单、json数据）
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态资源,方便我们前端以往网络图片形式访问
app.use("/static/avatar", express.static(pathGlobal.join(__dirname,"./static/avatar")));
app.use("/static/mySpace", express.static(pathGlobal.join(__dirname,"./static/mySpace")));
app.use("/static/chat", express.static(pathGlobal.join(__dirname,"./static/chat")));
app.use("/static/audio", express.static(pathGlobal.join(__dirname,"./static/audio")));
app.use("/static/groupAvatar", express.static(pathGlobal.join(__dirname,"./static/groupAvatar")));
app.use("/static/groupImg", express.static(pathGlobal.join(__dirname,"./static/groupImg")));
app.use("/static/groupAudio", express.static(pathGlobal.join(__dirname,"./static/groupAudio")));


// 定义 token 的解析中间件，并排除 user/register和user/login 相关路由
app.use(
  expressJWT({ secret: config.Keys }).unless({
    path: [/^\/user\/register/, /^\/user\/login/],
  })
);
// 解决地图显示不出来问题
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
// 视频通话
// require('./utils/videoCall.js')

// 导入 Sequelize连接数据库 和模型定义
const sequelize = require("./mysql/sequlize");
const UserModel = require("./models/usersModel.js");
const mySpace = require("./models/mySpace");
const { likeFormModel, commentFormModel, replyFormModel } = require("./models/editSpace");
const { applyListModel, friendShipModel } = require("./models/friendShip.js")
const privateChatModel = require("./models/privateChat.js")
const { groupSchemaModel, groupUserSchemaModel, groupMsgSchemaModel } = require("./models/groups.js")

// 引入路由
const userRoute = require("./router/users");
const mySpaceRoute = require("./router/mySpace");
const editSpaceRoute = require("./router/editSpace");
const friendRoute = require("./router/friendShip");
const groupRoute = require("./router/group.js")
// 挂载路由
app.use("/user", userRoute);
app.use("/user", mySpaceRoute);
app.use("/user", editSpaceRoute);
app.use("/user", friendRoute);
app.use("/user", groupRoute)



// 引入封装好的socket方法
const { createTextMsg, createImgMsg, createAudio, getMsgList } = require("./utils/socket.js");
const { path } = require("@hapi/joi/lib/errors.js");
// socket.io连接
let userList = [];//存储登录人员
let group = {}//群聊房间
let chatRoom = {}//私聊房间
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
   * 私聊功能
   */
  // 用户进入私聊房间
  socket.on('joinChatRoom', ({ id, friendId }) => {
    if (!chatRoom[id]) {
      chatRoom[id] = []
      chatRoom[id].push(friendId)
      console.log(chatRoom, 1);
    } else {
      if (!chatRoom[id].includes(friendId)) {
        chatRoom[id].push(friendId)
      }
      console.log(chatRoom, 2);
    }

  })

  // 用户离开私聊房间
  socket.on('leaveChatRoom', ({ id }) => {
    if (chatRoom.hasOwnProperty(id)) {
      delete chatRoom[id]
    }
    console.log(chatRoom, 3);
  })
  // 获取私人聊天列表数据
  socket.on('getMsgList', (obj) => {
    getMsgList(obj).then(data => {
      socket.emit('msgList', data)
    });
  })
  //发送文字消息
  socket.on('chat', (data) => {
    let users = chatRoom[data.toUid];
    console.log(users, 666);
    if (users) {
      console.log('已读');
      data.status = 1;
      createTextMsg(data)
    } else {
      console.log("未读");
      createTextMsg(data);
    }

    const userInfo = userList.find(user => user.uid === data.toUid);
    if (typeof userInfo != 'undefined') {//判断好友是否在线
      // socket.emit('msgNotice', data);//一定要to,不然那边无法实时接收
      socket.to(userInfo.socketId).emit('msgNotice', data);//推送给好友那边

    }
  });
  // 处理发送图片
  socket.on('getChatImg', async (data) => {
    let users = chatRoom[data.toUid];
    console.log(users);
    if (users) {
      data.status = 1;
    }
    let newData = await createImgMsg(data)
    data = newData;
    /**
     * 
     await socket.emit('chatImg', data)
     const userInfo = userList.find(user => user.uid === data.toUid);
     socket.to(userInfo.socketId).emit('msgNotice', data);//推送给好友那边
     */

    const userInfo = userList.find(user => user.uid === data.toUid);
    if (typeof userInfo != 'undefined') {//判断好友是否在线
      socket.to(userInfo.socketId).emit('msgNotice', data);//推送给好友那边
    }
  })
  // 处理语音消息
  socket.on('getChatVoice', async data => {
    let users = chatRoom[data.toUid];
    if (users) {
      data.status = 1;
    }
    let newData = await createAudio(data)
    data = newData;
    socket.emit('audio', data)
    // const userInfo = userList.find(user => user.uid === data.toUid);
    // socket.to(userInfo.socketId).emit('msgNotice', data);//推送给好友那边
    const userInfo = userList.find(user => user.uid === data.toUid);
    // 如果不在线，那么就只存数据库，不直接推送
    if (typeof userInfo != 'undefined') {
      socket.to(userInfo.socketId).emit('msgNotice', data);//推送给好友那边
    }
  })
  // 处理位置消息
  socket.on('getLocal', data => {
    let users = chatRoom[data.toUid];
    if (users) {
      data.status = 1;
    }
    createTextMsg(data)
    const userInfo = userList.find(user => user.uid === data.toUid);
    if (typeof userInfo != 'undefined') {
      socket.to(userInfo.socketId).emit('msgNotice', data);//推送给好友那边
    }
  })




  /**
 * 群聊功能
 */
  /*
  * 用户进入群聊
  * */
  socket.on('join', data => {
    socket.join(data.groupId)
    //群内无成员
    if (!group[data.groupId]) {
      group[data.groupId] = []
      group[data.groupId].push(data.id)
    } else {
      if (!group[data.groupId].includes(data.id)) {
        group[data.groupId].push(data.id)
      }
    }
    console.log('进入群聊', group)
  })
  socket.on('groupMsg', async data => {
    if (data.type == 0) {
      createTextMsg(data, true)
    } else if (data.type == 1) {
      let newData = await createImgMsg(data, true)
      data = newData
    } else if (data.type == 2) {
      let newData = await createAudio(data, true)
      data = newData;
      socket.emit('audio', data)
    } else {
      createTextMsg(data, true);
    }

    io.in(data.groupId).emit('listToGroupMsg', data);
  })


  /*
* 离开群聊
* */
  socket.on('leave', function (data) {
    socket.leave(data.groupId);
    let groupUsers = group[data.groupId]
    if (groupUsers && groupUsers.length > 0) {
      if (groupUsers.includes(data.id)) {
        let index = groupUsers.indexOf(data.id)
        groupUsers.splice(index, 1)
      }
    }
    console.log('离开群聊', group)
  })
})



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
    // app.listen(3000, () => {//不能用app做端口了
    //   console.log(`应用程序已启动，访问地址: ${mainUrl}`);
    // });
  })
  .catch((error) => {
    console.error("数据库连接失败：", error);
  });

