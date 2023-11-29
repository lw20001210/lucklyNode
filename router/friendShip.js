const express = require("express");
const {applyListModel,remarkFormModel} = require("../models/friendShip");
const UsersModel = require("../models/usersModel.js");
// 2.创建路由对象
const router = express.Router();
router.post('/sendApply', async (req, res) => {
    await applyListModel.create(req.body);
    return res.send({
        code: 200,
        msg: "发送成功"
    })
})
// 更新申请列表数据库头像和获取申请列表数据
router.get('/getApplyList', async (req, res) => {
    const project = await UsersModel.findOne({ where: { id: req.query.userId } });
    let applyVal = await applyListModel.findAll();
    applyVal.forEach(() => {
                applyListModel.update({ avatar: project.avatar }, {
                    where: {
                        acceptId: req.query.userId
                    }
                })
    });
    let data = await applyListModel.findAll({
        where: {
            acceptId: req.query.userId
        }
    });
    console.log(data);
    return res.send({
        code: 200,
        data: data
    })
})
// 添加备注
router.post("/addRemark",async (req,res)=>{
    console.log(req.body);
    return res.send({
        code: 200,
        data: req.body
    })
})

module.exports = router