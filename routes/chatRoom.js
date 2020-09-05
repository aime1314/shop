var express = require('express');
var request = require('request');
var router = express.Router();

router.use(function(req,res,next){
    let roomId = req.query.roomId;
    if(!roomId){
        res.json({
            errorCode:'-1',
            message:'roomId is error'
        });
    }else{
        next();
    }

});
//获取一个临时游客ID
router.get('/getUserId', function(req, res, next){
    let userInfo =  req.session.userInfo;
    if(userInfo && userInfo.memberId && userInfo.imToken){
       let userDb = userInfo;
       userDb.token = userInfo.imToken;
       if(userDb.isNoTemp == undefined){
       userDb.isNoTemp = 1;
       }
       userDb.imKey = IM_KEY
        res.json({
            errorCode:"0",
            message:"ok",
            data:userDb
        })
        // console.log("##########   有session ##########");
        // console.log(userInfo);
        // console.log("##########   有session ##########");
    }else{
    let roomId = req.query.roomId;
    let userIp = '';
    if (req.qmCore.ipArr) {
        userIp = req.qmCore.ipArr[0]
    }
    let opt = {
        method:"GET",
        url:target+"/user/memberInfo/ordinary/applyChatRoomTempUserId?chatRoomId="+roomId,
        headers:{
            from:from,
            ip:userIp
        }}
    request(opt, (error, response, body) => {
        if (response.statusCode == 200) {
            if (typeof body == "string") {
                body = JSON.parse(body);
            }

            if(body.errorCode == "0" && body.data && body.data.memberId && body.data.token){
                let sessionDb = {
                    memberId : body.data.memberId,
                    imToken : body.data.token,
                    isNoTemp :0
                }
                req.session.userInfo = sessionDb;
            }
            body.data.imKey = IM_KEY;
            res.json(body)
        } else {
            res.json({
                errorCode: "04",
                message: "请求失败"
            })
        }
    })
    }
})
//获取聊天室用户信息
router.post('/getUserList',function (req,res,next) {
    // console.log(req.body);
    let url = target+'/user/organizationMember/ordinary/getChatRoomMemberInfoBatch';
    let userIp = '';
    if (req.qmCore.ipArr) {
        userIp = req.qmCore.ipArr[0]
    }
    let headers = {
        "content-type": "application/json",
        "from": from,
        "ip": userIp
    };
    let opt = {
        method: "POST",
        url: url,
        json: true,
        body: req.body,
        headers: headers
    }
    request(opt, (error, response, body) => {
        if (response.statusCode == 200) {
            if (typeof body == "string") {
                body = JSON.parse(body);
            }
            res.json(body)
        } else {
            res.json({
                errorCode: "04",
                message: "请求失败"
            })
        }
    })
})
//点击红包上报事件
router.post('/clickReward',function (req,res,next) {
    let memberId = '';
    let userInfo =  req.session.userInfo;
    if(!userInfo || !userInfo.memberId){
        res.json({
            errorCode: "05",
            message: "请求失败"
        })
        return
    }else{
        memberId = userInfo.memberId;
    }
    let data = {
        chatRoomId: req.query.roomId
    };
    let url = target+'/user/userCR/admin/recordClickReward';
    let userIp = '';
    if (req.qmCore.ipArr) {
        userIp = req.qmCore.ipArr[0]
    }
    let headers = {
        "content-type": "application/json",
        "from": from,
        "ip": userIp,
        "memberId":memberId
    };
    let opt = {
        method: "POST",
        url: url,
        json: true,
        body: data,
        headers: headers
    }
    request(opt, (error, response, body) => {
        if (response.statusCode == 200) {
            if (typeof body == "string") {
                body = JSON.parse(body);
            }
            res.json(body)
        } else {
            res.json({
                errorCode: "04",
                message: "请求失败"
            })
        }
    });
});
//用户进入社群广场
router.post('/joinChatRoom',function (req,res,next) {
    let sharedMemberId = req.body.sharedMemberId;
    if(!req.body.sharedMemberId){
        res.json({
            errorCode: "06",
            message: "sharedMemberId error"
        })
        return
    }
    let memberId = '';
    let userInfo =  req.session.userInfo;
    if(!userInfo || !userInfo.memberId){
        res.json({
            errorCode: "05",
            message: "请求失败"
        })
        return
    }else{
        memberId = userInfo.memberId;
    }
    let data = {
        chatRoomId: req.query.roomId,
        sharedMemberId :req.body.sharedMemberId
    };
    let url =  target+'/user/userCR/ordinary/recordUserJoinChatRoom';
    let userIp = '';
    if (req.qmCore.ipArr) {
        userIp = req.qmCore.ipArr[0]
    }
    let headers = {
        "content-type": "application/json",
        "from": from,
        "ip": userIp,
        "memberId":memberId
    };
    let opt = {
        method: "POST",
        url: url,
        json: true,
        body: data,
        headers: headers
    }
    // console.log("$$$$$$ joinChatRoom_err: ",opt);
    request(opt, (error, response, body) => {
        if(error){
            // console.log("joinChatRoom_err: ",error);
        }
        // console.log("%%%%%joinChatRoom_err: ",response);
        // console.log("%%%%%joinChatRoom_err: ",body);
        if (response.statusCode == 200) {
            if (typeof body == "string") {
                body = JSON.parse(body);
            }
            res.json(body)
        } else {
            res.json({
                errorCode: "04",
                message: "请求失败"
            })
        }
    });
})
//触发领取聊天室红包
router.post('/clickReward',function (req,res,next) {
    let memberId = '';
    let userInfo =  req.session.userInfo;
    if(!userInfo || !userInfo.memberId){
        res.json({
            errorCode: "05",
            message: "请求失败"
        })
        return
    }else{
        memberId = userInfo.memberId;
    }
    let data = {
        chatRoomId: req.query.roomId
    };
    let url = target+'/user/userCR/admin/activateChatRoomReward';
    let userIp = '';
    if (req.qmCore.ipArr) {
        userIp = req.qmCore.ipArr[0]
    }
    let headers = {
        "content-type": "application/json",
        "from": from,
        "ip": userIp,
        "memberId":memberId
    };
    let opt = {
        method: "POST",
        url: url,
        json: true,
        body: data,
        headers: headers
    }
    request(opt, (error, response, body) => {
        if (response.statusCode == 200) {
            if (typeof body == "string") {
                body = JSON.parse(body);
            }
            res.json(body)
        } else {
            res.json({
                errorCode: "04",
                message: "请求失败"
            })
        }
    });
});
module.exports = router