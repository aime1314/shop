var express = require('express');
var request = require('request');
let util = require('util');
let Promise = util.promisify(request);
let sign = require("../bin/core/tikect/sign");
var router = express.Router();
var { decrypt, encrypt, makeIv } = require("../bin/common");

function in_obj(arg, arr) {
    for (let item in arr) {
        if (arg == arr[item]) {
            return true;
        }
    }
    return false;
}
// 验证码   type:1 登录验证码 其它是注册用 (有session验证)
router.get("/getyzCode", function(req, res, next) {
    let phoneRex = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
    if (req.query && req.query.phoneNum) {
        if (!phoneRex.test(req.query.phoneNum)) {
            res.json({
                errorCode: "05",
                message: "请输入正确的手机号"
            })
        }
        let typeId = 0;
        if (req.query.type == 1) {
            typeId = 1;
        } else if (req.query.type == 2) {
            typeId = 2
        }
        let userIp = '';
        if (req.qmCore.ipArr) {
            userIp = req.qmCore.ipArr[0]
        }
        let opt = {
            method: "get",
            url: target + "/common/sms/ordinary/sendMsg?typeId=" + typeId + "&mobile=" + req.query.phoneNum,
            headers: {
                from: from,
                ip: userIp
            }
        };
        // console.log("opt：",opt)
        request(opt, (error, response, body) => {
            //console.log("dBODY:",body)
            if (response.statusCode == 200) {
                if (req.query.type && req.query.type == 1) {
                    req.session.login_phoneNum = req.query.phoneNum;
                } else {
                    req.session.reg_phoneNum = req.query.phoneNum;
                }
                if (typeof body == "string") {
                    body = JSON.parse(body);
                }
                res.json(body)
            } else {
                res.json({
                    errorCode: "04",
                    message: "验证码发送失败"
                })
            }
        })
    } else {
        next(createError(500, 'phoneNumError'));
        return false;
    }
});
router.post("/register", function(req, res, next) {
    let regPhoneNum = req.session.reg_phoneNum;
    let businessSource = '';
    let fromArr = [
        // 'officialActivity',  //官方活动页
        'activityPage', //分享活动页
        'directSharePage', //邀请网页
        'personalPage', //个人主页
        'organPage', //社群主页
        'ticketCardScan', //实体卡注册
        // 'conductPage'        //宣传页加id   conductPage_id
    ];
    businessSource = req.body.from;
    if (!req.body || !businessSource || !in_obj(businessSource, fromArr)) {
        res.json({
            errorCode: "05",
            message: "请求来源错误"
        });
        res.end();
        return false;
    }
    if (!req.body.phoneNum || req.body.phoneNum != regPhoneNum) {
        res.json({
            errorCode: "05",
            message: "请输入正确的\"验证码\"手机号"
        });
        res.end();
        return false;
    }
    if (!req.body.yzCode) {
        res.json({
            errorCode: "05",
            message: "请输入正确的\"验证码\""
        });
        res.end();
        return false;
    }
    if (!req.body.name) {
        res.json({
            errorCode: "05",
            message: "请输入正确的\"用户名\""
        });
        res.end();
        return false;
    }
    let url = target + "/user/memberInfo/ordinary/register";
    let data = {
        "flag": 0,
        "identifyCode": req.body.yzCode,
        "member": {
            "businessSource": businessSource,
            "realName": req.body.name,
            "telephone": req.body.phoneNum,
            "iv": makeIv()
        }
    };
    let userIp = '';
    if (req.qmCore.ipArr) {
        userIp = req.qmCore.ipArr[0]
    }
    let headers = {
        "content-type": "application/json",
        "from": from,
        "ip": userIp
    };
    if (req.body.invitedCode) {
        data.invitedCode = req.body.invitedCode;
    }
    if (req.body.addFriend == '1') {
        data.addFriend = 1;
    }
    let opt = {
            method: "POST",
            url: url,
            json: true,
            body: data,
            headers: headers
        }
        // console.log("## 注册:  ",opt)
    if (req.body && req.body.phoneNum && req.body.yzCode && req.body.name) {
        request(opt, (error, response, body) => {
            if (typeof body == "string") {
                body = JSON.parse(body)
            }
            if (!!body) {
                if (body.data) {
                    let user = {};
                    for (let i in body.data) {
                        user[i] = body.data[i]
                    }
                    req.session.userRegist = null;
                    req.session.reg_phoneNum = null;
                    if (!user.memberId) {
                        user.memberId = user.id
                    }
                    req.session.userinfo = user;
                }
                res.json(body)
            } else {
                res.json({
                    errorCode: "04",
                    message: "注册失败"
                })
            }
        })
    } else {
        res.json({
            errorCode: "04",
            message: "req is err"
        })
    }
});
router.get("/bindPhone", function(req, res, next) {
    let regSession = req.session.userInfo;
    if (!regSession) {
        res.json({
            errorCode: "04",
            message: "用户不正确"
        })
        return false;
    }
    let phoneRex = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
    if (req.query && req.query.phoneNum && phoneRex.test(req.query.phoneNum) && req.query.phoneNum == req.session.reg_phoneNum) {
        if (!req.query.getyzCode) {
            res.json({
                errorCode: "04",
                message: "手机号码不正确"
            })
            return false;
        }

        let headers = {
            "content-type": "application/json",
            "from": from,
            "memberId": regSession.memberId,
        };
        if (req.qmCore.ipArr) {
            headers.ip = req.qmCore.ipArr[0];
        }

        let sendData = {
            identifyCode: req.query.getyzCode,
            modifyType: 0,
            telephone: req.query.phoneNum,
            memberId: regSession.memberId,
        }
        if (req.query.realName) {
            sendData.realName = req.query.realName;
        }
        let opt = {
                method: "POST",
                url: target + "/user/memberInfo/admin/modifyAndResetTel",
                headers: headers,
                json: true,
                body: sendData
            }
            // console.log("###sendData:",sendData)
            // console.log("####opt:",opt)
        request(opt, (error, response, body) => {
            // console.log("绑定手机号返回信息：",body)
            if (response.statusCode == 200) {
                if (typeof body == "string") {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {
                        next(createError(500, 'request err..'));
                        return false;
                    }
                }
                if (body.errorCode == '0' && body.data && body.data.id) {
                    let userRegBack = body;
                    let sessionDb = {
                        memberId: body.data.id
                    }
                    if(userRegBack.data.imToken){
                        sessionDb.imToken = userRegBack.data.imToken;
                    }
                    if(userRegBack.data.deviceUuid){
                        sessionDb.deviceUuid = userRegBack.data.deviceUuid;
                    }
                    if (userRegBack.data.telephone) {
                        sessionDb.telephone = userRegBack.data.telephone;
                    }
                    if (userRegBack.data.realName) {
                        sessionDb.realName = userRegBack.data.realName;
                    }
                    if (userRegBack.data.nickName) {
                        sessionDb.nickName = userRegBack.data.nickName;
                    }
                    if (userRegBack.data.imageUrl) {
                        sessionDb.imageUrl = userRegBack.data.imageUrl;
                    }
                    if (userRegBack.data.sex != undefined) {
                        sessionDb.sex = userRegBack.data.sex;
                    }
                    if (userRegBack.data.status != undefined) {
                        sessionDb.status = userRegBack.data.status;
                    }
                    if (userRegBack.data.isRegisterFinish != undefined) {
                        sessionDb.isRegisterFinish = userRegBack.data.isRegisterFinish;
                    }
                    req.session.userInfo = sessionDb;
                }

                res.json(body)
            } else {
                res.json({
                    errorCode: "04",
                    message: "绑定失败"
                })
            }
        })
    } else {
        res.json({
            errorCode: "04",
            message: "手机号码不正确"
        })
    }
});
// 用户登录  type:1 验证码  其它是密码
router.post('/login', (req, res, next) => {
    let logSessing = req.session.userLogin;
    if (!logSessing) {
        next(createError(404, 'sessionError'));
        return false;
    }
    let sendData = {};
    let logPhoneNmu = req.session.login_phoneNum;
    if (logPhoneNmu && req.body.phoneNum && req.body.phoneNum == logPhoneNmu && req.body.password) {
        sendData.loginType = 1;
        sendData.telephone = req.body.phoneNum;
        sendData.password = req.body.password;
        sendData.iv = makeIv();
    } else {
        res.json({
            errorCode: "05",
            message: "请输入正确的\"验证码\"手机号"
        });
        res.end();
    }
    if (req.query.type && req.query.type != 1) {
        //密码登录
        sendData.loginType = 0;
        sendData.password = encrypt(Buffer.from(req.body.password).toString('base64'), sendData.iv);
    }
    let url = target + "/user/memberInfo/ordinary/login";
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
        body: sendData,
        headers: headers
    };
    request(opt, (error, response, body) => {
        // //console.log("打印body：",body);
        if (body) {
            if (typeof body == "string") {
                body = JSON.parse(body);
            }
            if (body.errorCode == '0' && body.data && body.data.id) {
                let userRegBack = body;
                let sessionDb = {
                    memberId: body.data.id
                }
                if(userRegBack.data.imToken){
                    sessionDb.imToken = userRegBack.data.imToken;
                }
                if(userRegBack.data.deviceUuid){
                    sessionDb.deviceUuid = userRegBack.data.deviceUuid;
                }
                if (userRegBack.data.telephone) {
                    sessionDb.telephone = userRegBack.data.telephone;
                }
                if (userRegBack.data.realName) {
                    sessionDb.realName = userRegBack.data.realName;
                }
                if (userRegBack.data.nickName) {
                    sessionDb.nickName = userRegBack.data.nickName;
                }
                if (userRegBack.data.imageUrl) {
                    sessionDb.imageUrl = userRegBack.data.imageUrl;
                }
                if (userRegBack.data.sex != undefined) {
                    sessionDb.sex = userRegBack.data.sex;
                }
                if (userRegBack.data.status != undefined) {
                    sessionDb.status = userRegBack.data.status;
                }
                if (userRegBack.data.isRegisterFinish != undefined) {
                    sessionDb.isRegisterFinish = userRegBack.data.isRegisterFinish;
                }
                req.session.userInfo = sessionDb;
            }
            res.json(body)
        } else {
            res.json({ errorCode: 1001, message: 'login is error' })
        }
    });
});
router.post('/shart', async(req, res, next) => {
    let userSess = req.session.userInfo;
    if (!userSess) {
        userSess = {
            memberId: -1,
            openId: -1
        }
    }
    if (!userSess.memberId) {
        userSess.memberId = '-1';
    }
    if (!userSess.openId) {
        userSess.openId = "-1";
    }
    if (userSess.memberId && userSess.openId) {
        let url = req.query.uri;
        if (!url) {
            url = "https://" + req.hostname + "/"
        }
        // //console.log("url:  ",url);
        let ticketUrl = target + "/common/wechat/ordinary/getShareTicket";
        let userIp = '';
        if (req.qmCore.ipArr) {
            userIp = req.qmCore.ipArr[0]
        }
        let reqData = {
            method: 'GET',
            uri: ticketUrl,
            headers: {
                "memberId": userSess.memberId,
                "ip": userIp,
                "from": from,
                "openId": userSess.openId
            }
        };
        console.log(ticketUrl);
        console.log(reqData);
        let backData = await Promise(reqData);
        // //console.log("java_back_ticket: ",backData.statusCode);
        if (backData.statusCode == 200 && backData.body) {
            if (typeof backData.body == "string") {
                backData.body = JSON.parse(backData.body);
            }
            // //console.log("java_back_ticket: ",backData.body.data);
            if (backData.body.errorCode == 0 && backData.body.data) {
                let ret = sign(backData.body.data, url);
                let sharConf = {
                        appId: WATCH_APPID,
                        timestamp: ret.timestamp,
                        nonceStr: ret.nonceStr,
                        signature: ret.signature,
                    }
                    // //console.log("ret:  ",sharConf);
                res.json({
                    errorCode: "0",
                    message: "ok",
                    data: sharConf
                })
                res.end();
            } else {
                res.json(backData.body);
            }
        } else {
            res.json({
                errorCode: "65505",
                message: "request is error"
            })
        }
    } else {
        res.json({
            errorCode: "65504",
            message: "must be watch login"
        })
    }
});
router.post('/activate/ticketCode', (req, res, next) => {
        let userInfo = req.session.userInfo || req.session.appSessionUserInfo;
        // //console.log("打印userInfo:",userInfo)
        if (!userInfo || !userInfo.memberId) {
            res.json({
                errorCode: "03",
                message: "must be login"
            })
            return false;
        }
        let ticketCode = req.query.ticketCode || req.body.ticketCode;
        if (!ticketCode) {
            res.json({
                errorCode: "03",
                message: "must be ticketCode"
            })
            return false;
        }
        let url = target + "/user/ticket/admin/activateTicketCode?ticketCode=" + ticketCode;
        let data = {
            "ticketCode": ticketCode,
        };
        let userIp = '';
        if (req.qmCore.ipArr) {
            userIp = req.qmCore.ipArr[0]
        }
        let headers = {
            "content-type": "application/json",
            "from": from,
            "memberId": userInfo.memberId,
            "ip": userIp
        };
        let opt = {
            method: "POST",
            url: url,
            json: true,
            body: data,
            headers: headers
        };
        request(opt, (error, response, body) => {
            if (error || !body) {
                res.json({
                    errorCode: "04",
                    message: "request err"
                });
                return false;
            }
            if (typeof body == 'string') {
                try {
                    body = JSON.parse(body)
                } catch (e) {
                    res.json({
                        errorCode: "04",
                        message: "res json err"
                    });
                    return false;
                }

            }
            res.json(body)
        });
    })
    //全部社群列表
router.post('/organList', (req, res, next) => {
    let data = {
        "pageIndex": req.body.pageIndex,
        "pageSize": req.body.pageSize,
        "lookUpMemberId": req.body.lookUpMemberId
    };
    if (!data.lookUpMemberId) {
        res.json({
            errorCode: "03",
            message: "must be lookUpMemberId"
        })
        return false;
    }
    if (!data.pageIndex) {
        data.pageIndex = 1;
     }
    if (!data.pageSize) {
        data.pageSize = 15;
    }
    
    let url = target + "/organize/organize/ordinary/getOrgansByMemberIdWithPageIndex";

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
        body: data,
        headers: headers
    };
    request(opt, (error, response, body) => {
        if (error || !body) {
            res.json({
                errorCode: "04",
                message: "request err"
            });
            return false;
        }
        if (typeof body == 'string') {
            try {
                body = JSON.parse(body)
            } catch (e) {
                res.json({
                    errorCode: "04",
                    message: "res json err"
                });
                return false;
            }

        }
        res.json(body)
    });
});
//社群成员列表
router.get('/userList', function(req, res, next) {
    let pageIndex = 1;
    let pageSize = 15;
    if (req.query.pageIndex && parseInt(req.query.pageIndex) > 1) {
        pageIndex = parseInt(req.query.pageIndex);
    }
    if (req.query.pageSize && parseInt(req.query.pageSize) >= 1) {
        pageSize = parseInt(req.query.pageSize);
    }
    let opt = {
        method: "GET",
        url: target + "/user/organizationMember/ordinary/getMemberOrganForAllGroup?organizationId=" + parseInt(req.query.organId) + "&pageIndex=" + pageIndex + "&pageSize=" + pageSize,
        headers: {
            from: from
        }
    }
    if (req.query.organId && parseInt(req.query.organId) > 0) {
        // console.log("##send:  ",opt);
        request(opt,
            (error, response, body) => {
                if (error || !body) {
                    res.json({
                        errorcode: -1,
                        message: "response db Err"
                    });
                    res.end();
                } else {
                    // console.log("##back :  ",body);
                    if (typeof body == 'string') {
                        try {
                            body = JSON.parse(body)
                            res.json(body);
                            res.end();
                        } catch (e) {
                            res.json({
                                errorcode: -1,
                                message: "response JSON Err"
                            });
                            res.end();
                        }
                    } else {
                        res.json(body);
                        res.end();
                    }
                }

            })
    } else {
        res.json({
            errorcode: -1,
            message: "organId Err"
        });
        res.end();
    }
});

//活动表单
router.get("/getActivityTableList", function(req, res, next) {
    let userInfo = req.session.userInfo || req.session.appSessionUserInfo;
    let activDb = req.session.appSessionActivity;
    if (userInfo && userInfo.memberId && activDb && activDb.id) {
        let userIp = '';
        if (req.qmCore.ipArr) {
            userIp = req.qmCore.ipArr[0]
        }
        let headers = {
            "content-type": "application/json",
            "from": from,
            "memberId": userInfo.memberId,
            "ip": userIp
        };
        let url = target + "/trans/activity/ordinary/getActivityTableList?activityId=" + activDb.id;
        let opt = {
                method: "GET",
                url: url,
                headers: headers,
            }
            // console.log("### 活动表单_提交:  ",opt);
        request(opt, (err, response, body) => {
            // console.log("活动完成返回:",JSON.parse(body))
            if (err || !body) {
                next(createError(500, 'requestToJavaError'));
                return false;
            }
            if (typeof body == "string") {
                try {
                    body = JSON.parse(body)
                } catch (e) {
                    next(createError(404, 'res is error'));
                    return false;
                }
            }
            res.json(body);
        });
    } else {
        res.json({
            errorCode: '-1',
            message: 'no login'
        });
    }
});
//活动参加
router.post("/attendActivity", function(req, res, next) {
    let userInfo = req.session.userInfo || req.session.appSessionUserInfo;
    let activDb = req.session.appSessionActivity;
    if (userInfo && userInfo.memberId && activDb && activDb.id) {
        let userIp = '';
        if (req.qmCore.ipArr) {
            userIp = req.qmCore.ipArr[0]
        }
        let headers = {
            "content-type": "application/json",
            "from": from,
            "memberId": userInfo.memberId,
            "ip": userIp
        };
        let sendData = { activityId: activDb.id };
        if (req.body.money && parseFloat(req.body.money) >= 0.01) {
            sendData.attendAmount = parseFloat(req.body.money);
        }
        if (req.body.list) {
            sendData.memberActivityAttendTableList = req.body.list;
        }
        let url = target + "/trans/activity/admin/attendActivity";
        let opt = {
                method: "POST",
                url: url,
                headers: headers,
                json: true,
                body: sendData,
            }
            // console.log("#### post.list:  ",typeof req.body.list);
            // console.log("#### post.list:  ",req.body.list);
            // console.log("### 活动参加_提交:  ",opt);
        request(opt, (err, response, body) => {
            // console.log("活动完成返回:",JSON.parse(body))
            if (err || !body) {
                next(createError(500, 'requestToJavaError'));
                return false;
            }
            if (typeof body == "string") {
                try {
                    body = JSON.parse(body)
                } catch (e) {
                    next(createError(404, 'res is error'));
                    return false;
                }
            }
            res.json(body);
        });
    } else {
        res.json({
            errorCode: '-1',
            message: 'no login'
        });
    }
});
//微信支付
router.get("/wxPay", function(req, res, next) {
    let userInfo = req.session.userInfo || req.session.appSessionUserInfo;
    if (!req.qmCore.HTTP_SYSTYPE.watch) {
        res.json({
            errorCode: '-1',
            message: 'need in watch'
        });
        return false;
    }
    if (userInfo && userInfo.memberId && userInfo.openId) {
        let amount = false;
        if (req.query.money && parseFloat(req.query.money) >= 0.01) {
            amount = parseFloat(req.query.money);
        } else {
            res.json({
                errorCode: '-1',
                message: 'need money'
            });
            return false;
        }

        // 	10 群脉脉粒充值 11:创建社群 12 加入社群 其他待续 41,"活动报名支付"
        let paidFor = 41;
        if (req.query.pId && (parseInt(req.query.pId) == 10 || parseInt(req.query.pId) == 11 ||
                parseInt(req.query.pId) == 12 || parseInt(req.query.pId) == 41)) {
            paidFor = parseInt(req.query.pId);
        }
        let itemId = false;
        if (paidFor == 41 || paidFor == 12) {
            if (!req.query.itemId) {
                res.json({
                    errorCode: '-1',
                    message: 'need itemId'
                });
                return false;
            } else {
                itemId = req.query.itemId
            }
        }

        let userIp = '';
        if (req.qmCore.ipArr) {
            userIp = req.qmCore.ipArr[0]
        }
        let headers = {
            "content-type": "application/json",
            "from": from,
            "memberId": userInfo.memberId,
            "ip": userIp,
            "openId": userInfo.openId,
        };
        let sendData = {
            openId: userInfo.openId,
            paidFor: paidFor,
            amount: amount,
            payType: 2
        };
        if (itemId) {
            sendData.itemId = itemId;
        }
        let url = target + "/pay/payment/admin/getPaymentParams";
        let opt = {
                method: "POST",
                url: url,
                headers: headers,
                json: true,
                body: sendData,
            }
            // console.log("### 获取预支付参数_提交:  ",opt);
        request(opt, (err, response, body) => {
            // console.log("活动完成返回:",body)
            if (err || !body) {
                res.json({
                    errorCode: '-1',
                    message: 'req is err'
                });
                return false;
            }
            if (typeof body == "string") {
                try {
                    body = JSON.parse(body)
                } catch (e) {
                    res.json({
                        errorCode: '-1',
                        message: 'req JSON err'
                    });
                    return false;
                }
            }
            res.json(body);
        });
    } else {
        res.json({
            errorCode: '-1',
            message: 'no login'
        });
    }
});

//完成活动
router.get('/finishActivity', function(req, res, next) {
    let userInfo = req.session.userInfo || req.session.appSessionUserInfo;
    let activDb = req.session.appSessionActivity;
    if (userInfo && userInfo.memberId && activDb && activDb.id) {
        let userIp = '';
        if (req.qmCore.ipArr) {
            userIp = req.qmCore.ipArr[0]
        }
        let headers = {
            "content-type": "application/json",
            "from": from,
            "memberId": userInfo.memberId,
            "ip": userIp,
        };
        let sendData = "activityId=" + activDb.id;
        let url = target + "/trans/activity/admin/finishAttendActivity?activityId=" + activDb.id;
        let opt = {
            method: "POST",
            url: url,
            headers: headers,
            json: false,
            body: sendData,
        }
        request(opt, (err, response, body) => {
            // console.log("活动完成返回:",JSON.parse(body))
            if (err || !body) {
                next(createError(500, 'requestToJavaError'));
                return false;
            }
            if (typeof body == "string") {
                try {
                    body = JSON.parse(body)
                } catch (e) {
                    next(createError(404, 'res is error'));
                    return false;
                }
            }
            res.json(body);
        });
    } else {
        res.json({
            errorCode: '-1',
            message: 'no login'
        });
    }



});
router.get("/getActivityList", function(req, res, next) {
    let sessionUserInfo = req.session.userInfo || req.session.appSessionUserInfo;
    if (!sessionUserInfo || !sessionUserInfo.memberId) {
        res.json({
            errorCode: '-1',
            message: 'no login'
        });
        return false;
    }
    let shareInfo = {};
    if (sessionUserInfo.memberId) {
        shareInfo.memberId = sessionUserInfo.memberId;
    } else {
        shareInfo.memberId = '-1'
    }
    if (sessionUserInfo.openId) {
        shareInfo.openId = sessionUserInfo.openId;
    } else {
        shareInfo.openId = "-1";
    }

    let headers = {
        memberId: shareInfo.memberId,
        from: from,
        openId: shareInfo.openId
    };
    if (req.qmCore.ipArr) {
        headers.ip = req.qmCore.ipArr[0];
    }
    let sendData = {
        pageIndex: 1,
        pageSize: 15,
        searchType: 3
    };
    if (req.query.pageIndex && parseInt(req.query.pageIndex) > 1) {
        sendData.pageIndex = parseInt(req.query.pageIndex);
    }
    if (req.query.pageSize && parseInt(req.query.pageSize) >= 1) {
        sendData.pageSize = parseInt(req.query.pageSize);
    }
    if (req.query.searchType == '0' || req.query.searchType == '2') {
        sendData.searchType = parseInt(req.query.searchType)
    }
    if (req.query.organizationId) {
        sendData.organizationId = req.query.organizationId;
        sendData.searchType = 1;
    }
    if (req.query.activityType == "0" || req.query.activityType == "1") {
        sendData.activityType = parseInt(req.query.activityType);
    }
    if (req.query.status == "0" || req.query.status == "1" || req.query.status == "-1") {
        sendData.status = parseInt(req.query.status);
    }
    let opt = {
            method: "POST",
            url: target + "/trans/activity/ordinary/getActivityMainVOList",
            headers: headers,
            json: true,
            body: sendData,
        }
        // //console.log("#### opt: ",opt);
    request(opt,
        (error, response, body) => {
            // console.log("活动详情：",JSON.parse(response.body).data)
            if (error || !body) {
                res.json({
                    errorCode: '-1',
                    message: 'req is err'
                });
                return false;
            }
            if (typeof body == "string") {
                try {
                    body = JSON.parse(body)
                } catch (e) {
                    res.json({
                        errorCode: '-1',
                        message: 'req JSON err'
                    });
                    return false;
                }
            }
            res.json(body);
        });
});

// 获取图片上传授权参数
router.post("/getPicBatchUploadSign", (req, res, next) => {
    let userInfo = req.session.userInfo;
    var item, picSion = [];
    for(let i =0; i<req.body.length; i++) {
        if(req.body[i].goodsCode) {
            item = {
                length: req.body[i].length,
                uri: req.body[i].type + "/" + userInfo.memberId + "/" + req.body[i].goodsCode + "/" + req.body[i].uri
            }
        } else if(req.body[i].orderCode){
            item = {
                length: req.body[i].length,
                uri: req.body[i].type + "/" + req.body[i].orderCode + "/" + req.body[i].uri
            }
        } else if(req.body[i].shopId) {
            item = {
                length: req.body[i].length,
                uri: req.body[i].type + "/" + req.body[i].shopId + "/" + req.body[i].uri
            }
        }else {
            item = {
                length: req.body[i].length,
                uri: req.body[i].type + "/" + userInfo.memberId + "/" + req.body[i].uri
            }
        }
        picSion.push(item);
    }
    let opt = {
        method: "POST",
        url: target + "/common/imageData/admin/getPicBatchUploadSign",
        headers: {
            from: from,
            memberId: userInfo.memberId,
            "Content-Type": "application/json"
        },
        json:true,
        body: picSion
    }
    request(opt, (error, response, body) => {
        res.json(body);
    });
});
// //红包上报
// router.post('/recordClickReward', (req, res, next) => {
//     let userInfo = req.session.userInfo || req.session.appSessionUserInfo;
//     console.log("打印userInfo:", userInfo);
//     console.log("聊天室id:", req.body.sendData);
//     if (!userInfo || !userInfo.memberId) {
//         res.json({
//             errorCode: "03",
//             message: "must be login"
//         })
//         return false;
//     }
//     let data = {
//         "chatRoomId": req.body.sendData.chatRoomId
//     };
//     if (!data.lookUpMemberId) {
//         res.json({
//             errorCode: "03",
//             message: "must be lookUpMemberId"
//         })
//         return false;
//     }
//     if (!data.pageIndex) {
//         data.pageIndex = 1;
//     }
//     if (!data.pageSize) {
//         data.pageSize = 15;
//     }
//     let url = target + "/user/userCR/admin/recordClickReward";

//     let userIp = '';
//     if (req.qmCore.ipArr) {
//         userIp = req.qmCore.ipArr[0]
//     }
//     let headers = {
//         "content-type": "application/json",
//         "from": from,
//         "memberId": userInfo.memberId,
//         "ip": userIp
//     };
//     let opt = {
//         method: "POST",
//         url: url,
//         json: true,
//         body: data,
//         headers: headers
//     };
//     request(opt, (error, response, body) => {
//         if (error || !body) {
//             res.json({
//                 errorCode: "04",
//                 message: "request err"
//             });
//             return false;
//         }
//         if (typeof body == 'string') {
//             try {
//                 body = JSON.parse(body)
//             } catch (e) {
//                 res.json({
//                     errorCode: "04",
//                     message: "res json err"
//                 });
//                 return false;
//             }

//         }
//         res.json(body)
//     });
// })
module.exports = router;