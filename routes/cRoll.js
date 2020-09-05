var express = require('express');
let wxReq = require('request');
let util = require('util');
let Promise = util.promisify(wxReq);
let { encrypt, decrypt, makeIv } = require("../bin/common");
let router = express.Router();
let urlencode = require('urlencode');
router.use(async(req, res, next) => {
    let sessionCR = req.session.cRoll;
    let code = req.query.id;
    if (code) {
        if (!sessionCR || !sessionCR.ticketCode || !sessionCR.id || sessionCR.ticketCode != code) {
            let reqUrl = target + "/user/ticket/ordinary/getTicketRuleAndCodeOne?ticketCode=" + code;
            let headers =  {
                from: from
            };
            if(req.qmCore.ipArr){
                headers.ip = req.qmCore.ipArr[0];
            }
            let reqOpt = {
                method: "GET",
                uri: reqUrl,
                headers: headers
            };
            let javaBack = await Promise(reqOpt);
            // //console.log("请求后: ",javaBack.body);
            let crollback = javaBack.body;
            if (typeof javaBack.body == "string") {
                crollback = JSON.parse(javaBack.body)
            }
            if (req.qmCore == undefined) {
                req.qmCore = { "ather": "mocheng" };
            }
            req.qmCore.cRoll = false;
            if (crollback.data && typeof crollback.data == "object") {
                // 卡卷合法,写session
                req.qmCore.cRoll = crollback.data;
                req.session.cRoll = crollback.data;
                next();
            } else {
                next(createError(503, 'ticketCode is error2'));
            }
        } else {
            //有session
            next();
        }
    } else {
        next(createError(503, 'ticketCode is error2'));
    }
});
router.get('/', (req, res, next) => {
    let sessionCR = req.session.cRoll;
    let sessionUserInfo = req.session.userInfo;
    if (req.qmCore.HTTP_SYSTYPE.watch && (!sessionUserInfo || !sessionUserInfo.memberId)) {
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
            businessSource:"ticketCardScan"
            }
        let userIp = '';
        if (req.qmCore.ipArr) {
            userIp = req.qmCore.ipArr[0]
        }
        loginDb.ip = userIp;
        if(req.query.invitedCode){
            loginDb.invitedCode=req.query.invitedCode;
        }
        if(sessionCR.invitedCode){
            loginDb.invitedCode = sessionCR.invitedCode;
        }
            // //console.log("授权加密", loginDb);
            //Buffer.from(JSON.stringify(myStr)).toString('base64');
        if (req.query.addFriend == '1') {
            loginDb.addFriend  = 1;
        }
        if(APP_RUN_MOD == '0'){
            loginDb.isDev = 1;
        }
        req.session.loginWx = loginDb;
        let iv = makeIv();
        let enStr = encrypt(Buffer.from(JSON.stringify(loginDb)).toString('base64'), iv, WATCH_LOGIN_KEY);
        if (enStr) {
            let redirectUrl = WATCH_LOGIN_HOST + "/wx" + '?baseStr=' + urlencode(enStr) + '&iv=' + urlencode(iv);
            res.redirect(redirectUrl); //redirect重定向
            return false;
        }
    }
    // console.log("user:   ",sessionUserInfo);
    if (sessionCR && sessionCR.ticketCode && sessionCR.id) {
        let rollObj = JSON.parse(JSON.stringify(sessionCR));
        req.session.cRoll = null;
        let webObj = {}
        if (!sessionUserInfo) {
            sessionUserInfo = {};
        }
        res.header('Content-Type', 'text/html; charset=utf-8');
        let backBody = {
            ticketCode: rollObj.ticketCode,
            uniqueId: rollObj.uniqueId
        };
        let sysStr = JSON.stringify(req.qmCore.HTTP_SYSTYPE);
        let userInfoStr = JSON.stringify(sessionUserInfo);
        // //console.log("打印：", sysStr);
        switch (sessionCR.ticketStatus) {
            case 1:
                if (req.qmCore.HTTP_SYSTYPE.app) {
                    res.render('cRoll/alreadyGetApp', { roll: rollObj, sysType: sysStr, userInfo: sessionUserInfo,userInfoStr:userInfoStr })
                        //res.end("已经被领取1");
                } else {
                    res.render('cRoll/alreadyGetWx', { roll: rollObj, sysType: sysStr, userInfo: sessionUserInfo,userInfoStr:userInfoStr })
                }
                break;
            case 2:
                var version = JSON.parse(sysStr)
                var obj = {"methodType":"jump","nativeFlag":"organizePage","itemId": rollObj.itemId}
                if(version.app == "IOS") {
                    res.render("cRoll/white", {roll: rollObj,userInfoStr:userInfoStr})
                }
                if(version.app == "ANDROID")  {
                    res.render("cRoll/white", {roll: rollObj,userInfoStr:userInfoStr})
                }
                if (rollObj.memberId && rollObj.itemId) {
                    let enObj = {
             
                        itemId: rollObj.itemId,
                    };
                    let orIv = makeIv();
                    let orStr = encrypt(Buffer.from(JSON.stringify(enObj)).toString('base64'), orIv);
                    let organPageUrl = "/share/organPage?organId=" + enObj.itemId
                    res.redirect(organPageUrl);
                }
                break;
            case 3:
                res.redirect('login/pastDue')
                break;
            default:
                //未激活处理
                if (req.qmCore.HTTP_SYSTYPE.watch) {
                    // console.log("微信中打开")
                    // console.log("roll",rollObj)
                    // console.log("systype",sysStr)
                    // console.log("userInfo",sessionUserInfo)
                    // console.log("##3",userInfoStr)
                    if (sessionUserInfo) {
                        if (sessionUserInfo.memberId) {
                            res.render('cRoll/getCoupon', { roll: rollObj, sysType: sysStr, userInfo: sessionUserInfo,userInfoStr:userInfoStr })
                        } else {
                            res.redirect('/login/login?id=' + rollObj.ticketCode)
                        }
                    } else {
                        return false;
                    }
                } else if (req.qmCore.HTTP_SYSTYPE.app) {
                    // console.log("app打开")
                    // console.log("roll",rollObj)
                    // console.log("systype",sysStr)
                    // console.log("userInfo",sessionUserInfo)
                    // console.log("##3",userInfoStr)
                    res.render('cRoll/getCoupon', { roll: rollObj, sysType: sysStr, userInfo: sessionUserInfo,userInfoStr:userInfoStr })
                } else {
                    if (sessionUserInfo) {
                        if (sessionUserInfo.memberId) {
                            res.render('cRoll/getCoupon', { roll: rollObj, sysType: sysStr, userInfo: sessionUserInfo,userInfoStr:userInfoStr })
                        } else {
                            res.redirect('/login/login?id=' + rollObj.ticketCode)
                        }
                    } else {
                        return false;
                    }
                }
        }
    } else {
        next(createError(404, 'ticketCode is error'));
    }
});
module.exports = router;