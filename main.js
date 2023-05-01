const express = require("express");
const userRoute = require("./router/users");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
app.use(bodyParser.json());
// 解析 url编码
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/user", userRoute);
app.listen(3000, () => {
  console.log("http://192.168.242.20:3000/user");
});
