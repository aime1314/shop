var express = require('express');
var router = express.Router();
var request = require('request');
let urlencode = require('urlencode');
let { encrypt, decrypt, makeIv } = require("../bin/common");
//微信内统一授权
let   dateMoent  =   function (shijianchuo)  {
    var  time0  =  new  Date();
    var  time  =  new  Date(shijianchuo  *  1000);
    var  week;
    var  y0  =  time0.getFullYear()
    var  y  =  time.getFullYear()  ==  y0  ?  ''  :  time.getFullYear()  +  '/';
    var  m  =  time.getMonth()  +  1;
    var  d  =  time.getDate();
    if  (time.getDay()  ==  0)  week  =  "周日";
    if  (time.getDay()  ==  1)  week  =  "周一";
    if  (time.getDay()  ==  2)  week  =  "周二";
    if  (time.getDay()  ==  3)  week  =  "周三";
    if  (time.getDay()  ==  4)  week  =  "周四";
    if  (time.getDay()  ==  5)  week  =  "周五";
    if  (time.getDay()  ==  6)  week  =  "周六";
    return  y  +   (m < 10 ? '0' + m : m)   +  '/'  +   (d < 10 ? '0' + d : d)   +  ' '  +  week;
}
router.use(function(req, res, next) {
    let businessSource = null;
    let title = null;
    if (req.qmCore.HTTP_SYSTYPE.app) {
        if (req.url.substr(0, 10) == '/organPage') {
            businessSource = "organPage";
            title = "社群主页";
        } else if (req.url.substr(0, 13) == '/personalPage') {
            businessSource = "personalPage";
            title = "个人主页";
        } else if (req.url.substr(0, 13) == '/activityList') {
            title = "活动列表";
            businessSource = "activityList";
        } else if (req.url.substr(0, 13) == '/activityPage') {
            businessSource = "activityPage";
            title = "活动详情";
        } else if (req.url.substr(0, 15) == '/activityDetail') {
            businessSource = "activityDetail";
            title = "活动状态";
        } else if (req.url.substr(0, 13) == '/allOrganList') {
            businessSource = "allOrganList";
        } else if(req.url.substr(0, 16) == '/communitySquare'){
            businessSource = "communitySquare";
        }
        let queryData = JSON.parse(JSON.stringify(req.query));
        let shareInfo = null;
        if (req.query.shareInfo && req.query.iv) {
            shareInfo = decrypt(req.query.shareInfo, req.query.iv);
        }
        queryData.shareInfoData = shareInfo;
        queryData.source = businessSource;
        res.render('shearInApp', {
            title: title,
            data: JSON.stringify(queryData),
            app: req.qmCore.HTTP_SYSTYPE.app
        });
        return false;
    }
    let sessionUserInfo = req.session.userInfo || req.session.appSessionUserInfo;
    let isWxReg = req.session.loginWx;
    // console.log("######### url:  ",req.url);
    // //console.log(req.url.substr(0,10));
    // //console.log("**** 中间件 **** ",sessionUserInfo,isWxReg);
    if (req.qmCore.HTTP_SYSTYPE.watch && (!sessionUserInfo || !sessionUserInfo.memberId) && !isWxReg) {
        // //console.log("## 中间件 微信 ##");

        let hostUrl = req.protocol + "://" + req.hostname;
        if (APP_RUN_MOD == '0') {
            hostUrl += ':65503';
        }
        let url = hostUrl + req.baseUrl + req.url;
        let indexUrl = hostUrl + "/login/wxBack";
        let loginDb = {
                type: "userinfo",
                formUrl: url,
                indexUrl: indexUrl,
            }
            // console.log("###  ",url);
        if (req.url.substr(0, 10) == '/organPage') {
            businessSource = "organPage";
        } else if (req.url.substr(0, 13) == '/personalPage') {
            businessSource = "personalPage";
            if (req.query.addFriend == '1') {
                businessSource = "directSharePage";
            }
        } else if (req.url.substr(0, 13) == '/activityPage') {
            businessSource = "activityPage";
        } else if (req.url.substr(0, 15) == '/activityDetail') {
            businessSource = "activityPage";
        }else if(req.url.substr(0, 16) == '/communitySquare'){
            businessSource = "communitySquare";
        }
        if (businessSource) {
            loginDb.businessSource = businessSource;
        }
        let userIp = '';
        if (req.qmCore.ipArr) {
            userIp = req.qmCore.ipArr[0]
        }
        loginDb.ip = userIp;
        if (req.query.invitedCode) {
            loginDb.invitedCode = req.query.invitedCode;
        }
        if (req.query.addFriend == '1') {
            loginDb.addFriend = 1;
        }
        if (APP_RUN_MOD == '0') {
            loginDb.isDev = 1;
        }
        //// console.log("授权加密", loginDb);
        //Buffer.from(JSON.stringify(myStr)).toString('base64');
        req.session.loginWx = loginDb;
        let iv = makeIv();
        let enStr = encrypt(Buffer.from(JSON.stringify(loginDb)).toString('base64'), iv, WATCH_LOGIN_KEY);
        if (enStr) {
            let redirectUrl = WATCH_LOGIN_HOST + "/wx" + '?baseStr=' + urlencode(enStr) + '&iv=' + urlencode(iv);
            console.log("**   redirect重定向  **");
            res.redirect(redirectUrl); //redirect重定向
            return false;
        }
    } else {
        // //console.log("## 中间件 next##");
        next();
    }
});
var checkSharInfo = function(req, res) {
    if (!req.query.shareInfo || !req.query.iv) {
        LOGFUN({
            status: 404,
            msg: '请求参数错误',
            month: req.method,
            url: req.url
        });
        return false;
    } else {
        let backData = decrypt(req.query.shareInfo, req.query.iv);
        if (backData) {
            return backData
        } else {
            LOGFUN({
                status: 404,
                msg: '解析错误',
                month: req.method,
                url: req.url
            });
            return false;
        }
    }
}
router.get('/personalPage', function(req, res, next) {

    let shareInfo = {};
    if (req.query.memberId) {
        shareInfo.memberId = req.query.memberId;
        //TODO 参数带有undefine , 等。。。
        if (shareInfo.memberId.indexOf(',') != -1) {
            let memberArr = shareInfo.memberId.split(',');
            shareInfo.memberId = memberArr[0];
        }
    } else {
        shareInfo = checkSharInfo(req);
    }
    if (!shareInfo || !shareInfo.memberId) {
        next(createError(503, 'memberId is error'));
        return false;
    }
    let sessionUserInfo = req.session.userInfo || req.session.appSessionUserInfo;
    if (!sessionUserInfo) {
        sessionUserInfo = {};
    }
    // if(sessionUserInfo.memberId ){
    //     shareInfo.memberId = sessionUserInfo.memberId;
    // }
    let userInfoStr = JSON.stringify(sessionUserInfo);
    // ,userInfoStr:userInfoStr
    let headers = {
        from: from
    };
    if (req.qmCore.ipArr) {
        headers.ip = req.qmCore.ipArr[0];
    }
    request({
            method: "GET",
            url: target + "/user/memberInfo/ordinary/getOtherMember?memberId=" + shareInfo.memberId,
            headers: headers
        },
        (error, response, body) => {
            // console.log("打印：",JSON.parse(body))
            if (error || !body) {
                next(createError(500, 'requestToJavaError'));
                return false;
            };
            let backData = '';
            if (typeof body == 'string') {
                try {
                    backData = JSON.parse(body)
                } catch (e) {
                    next(createError(500, 'JavaResJsonError:  ' + body));
                    return false;
                }
            } else {
                backData = body
            }
            if (backData && backData.errorCode == '0' && backData.data) {
                // console.log(backData.data.organizationList);
                res.render('share', {
                    title: '个人主页',
                    information: backData.data,
                    userInfoStr: userInfoStr,
                    userInfo: sessionUserInfo,
                });
            } else {
                next(createError(500, 'JavaResDataError: ' + response.body));
                return false;
            }
        })

});
router.get('/organPage', function(req, res, next) {
    let shareInfo = {}
    if (req.query.organId) {
        shareInfo.itemId = req.query.organId;
        if (req.query.memberId) {
            shareInfo.memberId = req.query.memberId;
        } else {
            shareInfo.memberId = '-1';
        }
    } else {
        shareInfo = checkSharInfo(req);
    }
    if (!shareInfo || !shareInfo.memberId || !shareInfo.itemId) {
        next(createError(503, 'memberId or itemId is error'));
        return false;
    }
    let sessionUserInfo = req.session.userInfo || req.session.appSessionUserInfo;
    if (!sessionUserInfo) {
        sessionUserInfo = {};
    }
    let headers = {
        from: from,
        memberId: shareInfo.memberId
    };
    if (req.session.userInfo && (req.session.userInfo.memberId || req.session.userInfo.id)) {
        let userMemeberId = req.session.userInfo.memberId || req.session.userInfo.id;
        headers.memberId = userMemeberId;
    } else {
        headers.memberId = '-1';
    }
    if (req.qmCore.ipArr) {
        headers.ip = req.qmCore.ipArr[0];
    }
    let opt = {
        method: "GET",
        url: target + "/user/memberGroup/ordinary/shareGroupIndex?memberId=" + shareInfo.memberId + "&organId=" + shareInfo.itemId,
        headers: headers
    };

    let userInfoStr = JSON.stringify(sessionUserInfo);
    //console.log("打印用户信息:",JSON.parse(userInfoStr))
    // ,userInfoStr:userInfoStr
    // //console.log("########   用户session:   ",sessionUserInfo)
    // //console.log("#### opt :   ",opt);
    request(opt,
        (error, response, body) => {
            // //console.log("请求返回:   ",JSON.parse(body))
            if (error || !body) {
                next(createError(500, 'requestToJavaError'));
                return false;
            }
            let backData = '';
            if (typeof body == 'string') {
                try {
                    backData = JSON.parse(body)
                } catch (e) {
                    next(createError(500, 'JavaResJsonError:  ' + body));
                    return false;
                }
            } else {
                backData = body
            }
            if (backData && backData.errorCode == '0' && backData.data) {
                let informationStr = JSON.stringify(backData.data);
                // console.log("#####:", informationStr);
                res.render('organ', {
                    title: '社群主页',
                    informationStr: informationStr,
                    information: backData.data,
                    userInfoStr: userInfoStr,
                    userInfo: sessionUserInfo,
                    shareInfo:shareInfo
                });
            } else {
                next(createError(500, 'JavaResDataError: ' + response.body));
                return false;
            }
        })
});
//活动列表
router.get('/activityList', function(req, res, next) {
    let shareInfo = {}
    let sessionUserInfo = req.session.userInfo || req.session.appSessionUserInfo;
    if (!sessionUserInfo) {
        sessionUserInfo = {};
    }
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
    let userInfoStr = JSON.stringify(sessionUserInfo);
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
                next(createError(500, 'requestToJavaError'));
                return false;
            }
            let backData = '';
            if (typeof body == 'string') {
                try {
                    backData = JSON.parse(body)
                } catch (e) {
                    next(createError(500, 'JavaResJsonError:  ' + body));
                    return false;
                }
            } else {
                backData = body
            }
            if (backData && backData.errorCode == '0' && backData.data) {
                if (backData.data.length > 0) {
                    for (let i = 0; i < backData.data.length; i++) {
                        if (backData.data[i].createTime) {
                            backData.data[i].createTime = dateMoent(backData.data[i].createTime)
                        }
                    }
                }
                res.render('activityList', {
                    title: '活动列表',
                    information: backData.data,
                    userInfo: sessionUserInfo,
                    userInfoStr: userInfoStr
                });
            } else {
                next(createError(500, 'JavaResDataError: ' + response.body));
                return false;
            }
        })
});
//活动详情
router.get('/activityPage', function(req, res, next) {
    let shareInfo = {}
    if (req.query.itemId) {
        shareInfo.itemId = req.query.itemId;
        if (req.query.memberId) {
            shareInfo.memberId = req.query.memberId;
        } else {
            shareInfo.memberId = '-1';
        }
    } else {
        shareInfo = checkSharInfo(req);
    }
    if (!shareInfo || !shareInfo.memberId || !shareInfo.itemId) {
        next(createError(503, 'memberId or activityId is error'));
        return false;
    }
    let sessionUserInfo = req.session.userInfo || req.session.appSessionUserInfo;
    if (!sessionUserInfo) {
        sessionUserInfo = {};
    }
    // console.log("### 微信支付_用户信息:   ",sessionUserInfo);
    if (sessionUserInfo.memberId) {
        shareInfo.memberId = sessionUserInfo.memberId;
    }
    let userInfoStr = JSON.stringify(sessionUserInfo);
    // console.log("打印userInfo:", sessionUserInfo)
    // ,userInfoStr:userInfoStr
    // console.log("打印memberId:", shareInfo.memberId)
    let headers = {
        memberId: shareInfo.memberId,
        from: from
    };
    //console.log("headers:",headers)
    if (req.qmCore.ipArr) {
        headers.ip = req.qmCore.ipArr[0];
    }
    let opt = {
            method: "GET",
            url: target + "/trans/activity/ordinary/getActivityMainDetail?memberId=" + shareInfo.memberId + "&activityId=" + shareInfo.itemId,
            headers: headers
        }
        // //console.log("#### opt: ",opt);
    request(opt,
        (error, response, body) => {
            // console.log("活动详情：",JSON.parse(response.body).data)
            if (error || !body) {
                next(createError(500, 'requestToJavaError'));
                return false;
            }
            let backData = '';
            if (typeof body == 'string') {
                try {
                    backData = JSON.parse(body)
                } catch (e) {
                    next(createError(500, 'JavaResJsonError:  ' + body));
                    return false;
                }
            } else {
                backData = body
            }
            if (backData && backData.errorCode == '0' && backData.data) {
                // req.session.userSession = {shareInfo: req.query.shareInfo, iv: req.query.iv};
                if (backData.data.id) {
                    req.session.appSessionActivity = { id: backData.data.id };
                }
                res.render('activity', {
                    title: '活动详情',
                    information: backData.data,
                    userInfo: sessionUserInfo,
                    userInfoStr: userInfoStr
                });
                // console.log("backData####:",backData.data)
            } else {
                next(createError(500, 'JavaResDataError: ' + response.body));
                return false;
            }
        })
});

//活动状态
router.get('/activityDetail', function(req, res, next) {
    if (req.query.itemId) {
        let userInfo = req.session.userInfo || req.session.appSessionUserInfo;
        let activeDb = {};
        let userInfoStr = JSON.stringify(userInfo);
        // console.log("userInfo：",userInfo)
        // console.log("userInfoStr:",userInfoStr)
        if (!userInfo || !userInfo.memberId) {
            // res.render("appCorrelation/activityDetail",{title:"活动详情",userInfo:userInfo,userInfoStr:userInfoStr,activityDetail: activeDb });
            res.redirect("/login/login?from=activityDetail&fId=" + req.query.itemId);
            return false;
        }
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
        let url = target + "/trans/activity/ordinary/getActivityMainConfirmDetail?activityId=" + req.query.itemId;
        let opt = {
            method: "GET",
            url: url,
            headers: headers
        }
        request(opt, (error, response, body) => {
            // console.log("返回信息:",JSON.parse(body))
            if (error || !body) {
                next(createError(500, 'requestToJavaError'));
                return false;
            };
            if (body && typeof body == "string") {
                try {
                    body = JSON.parse(body)
                } catch (e) {
                    next(createError(404, 'res JSON is error' + body));
                    return false;
                }
            }
            if (body && body.errorCode == '0' && body.data) {
                activeDb = body.data;
                req.session.appSessionActivity = body.data;
                res.render("appCorrelation/activityDetail", { title: "活动详情", userInfo: userInfo, userInfoStr: userInfoStr, activityDetail: activeDb });
            } else {
                // res.render("appCorrelation/activityDetail",{title:"活动详情",userInfo:userInfo,userInfoStr:userInfoStr,activityDetail: activeDb });
                next(createError(404, 'req is error' + body));
                return false;
            }
        })
    } else {
        next(createError(404, 'itmeId is error'));
        return false;
    }

});
router.get('/allOrganList', function(req, res, next) {
    res.render('allOrganList')
});
router.get('/testShare', function(req, res, next) {
    res.render('testShare')
});
// router.get('/communitySquare', function(req, res, next) {
//     res.render('communitySquare')
// });
// 聊天室
router.get('/communitySquare', function(req, res, next) {
        // console.log(req.query);
        let shareInfo = {}
        if (req.query.organId||req.query.roomId) {
            if(req.query.organId){
                shareInfo.itemId = req.query.organId;
            }
            if(req.query.roomId){
                shareInfo.itemId = req.query.roomId; 
            }
            if (req.query.memberId) {
                shareInfo.memberId = req.query.memberId;
            } else {
                shareInfo.memberId = '-1';
            }
        } else {
            shareInfo = checkSharInfo(req);
        }
        if (!shareInfo || !shareInfo.memberId || !shareInfo.itemId) {
            next(createError(503, 'memberId or itemId is error'));
            return false;
        }
        let sessionUserInfo = req.session.userInfo || req.session.appSessionUserInfo;
        if (!sessionUserInfo) {
            sessionUserInfo = {};
        }
        let headers = {
            from: from,
            memberId: shareInfo.memberId
        };
        if (req.session.userInfo && (req.session.userInfo.memberId || req.session.userInfo.id)) {
            let userMemeberId = req.session.userInfo.memberId || req.session.userInfo.id;
            headers.memberId = userMemeberId;
        } else {
            headers.memberId = '-1';
        }
        if (req.qmCore.ipArr) {
            headers.ip = req.qmCore.ipArr[0];
        }
    request({
            method: "GET",
            url: target + "/organize/organize/ordinary/getOrganInfoForChatRoom?organId=" + shareInfo.itemId,
            headers: headers
        },
        (error, response, body) => {
            if (error || !body) {
                next(createError(500, 'requestToJavaError'));
                return false;
            };
            let backData = '';
            if (typeof body == 'string') {
                try {
                    backData = JSON.parse(body)
                } catch (e) {
                    next(createError(500, 'JavaResJsonError:  ' + body));
                    return false;
                }
            } else {
                backData = body
            }
            if (backData && backData.errorCode == '0' && backData.data) {
                // backData.data.isOpenMsgSquare = 0;
                // console.log('########:',backData.data);
                // console.log('########:',shareInfo);
                res.render('communitySquare',{
                    title: backData.data.organizationName,
                    information: backData.data,
                    shareInfo:shareInfo
                });
            } else {
                next(createError(500, 'JavaResDataError: ' + response.body));
                return false;
            }
        })

});
module.exports = router;