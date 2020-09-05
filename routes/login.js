var express = require('express');
var request = require('request');
var router = express.Router();
let { encrypt, decrypt, makeIv } = require("../bin/common");
router.get('/register', function(req, res, next){
    req.session.userRegist = true;
    res.render('cRoll/register', {title: '注册'})
});
router.get('/login', function(req, res, next){
    req.session.userLogin = true;
    res.render('cRoll/login', {title: '登录'})
});
router.get('/userList', function(req, res, next) {
    //console.log("######### organId:   ****",req.query.organId);
    let opt = {
        method:"GET",
        url:target+"/user/organizationMember/ordinary/getMemberOrganForAllGroup?organizationId="+parseInt(req.query.organId),
        headers:{
            from:from
        }
    }
    //console.log("######### organId:   ****",opt);
    if(req.query.organId && parseInt(req.query.organId)>0){
        request(opt,
            (error, response, body)=>{
            //console.log("back: ",response.body);
                if(error){
                    next(createError(500,'requestToJavaError'));
                    return false;
                };
                res.render('users', { title: '社群成员',information:JSON.parse(response.body).data});
            })
    }else{
        next(createError(404,'organIdError'));
        return false;
    }
});
router.get('/regSuccess',(req, res, next)=>{
    res.render('regSuccess', {title:'注册成功'})
});
//App内解密
router.post('/getDeData',(req,res,next)=>{
//req.body.yzCode
    //console.log("###   ####",req.body.info, req.body.iv );
    if(req.body.info && req.body.iv ){
        let isLogin = req.body.isLogin || req.query.isLogin;
        let reqData = decrypt(req.body.info,req.body.iv);
        if(reqData ){
            //console.log("de OK:   ",reqData);
            if(isLogin && reqData.memberId){
                //console.log("打印login:",isLogin)
                //console.log("打印data:",reqData)
                req.session.appSessionUserInfo =  reqData;
            }
            res.json({
                errorCode:"0",
                message:"ok",
                data:reqData
            });
            res.end();
        }else{
            res.json({
                errorCode:"04",
                message:"de is err"
            });
            res.end();
        }
    }else{
        res.json({
            errorCode:"05",
            message:"aug is err"
        });
        res.end();
    }

});
router.get('/wxBack',(req, res, next)=>{
    //console.log('wxBack#############');
    let wxLoginDb = null;
    if(req.query.baseStr && req.query.iv && req.session.loginWx){
        wxLoginDb = JSON.parse(JSON.stringify(req.session.loginWx));
        let reqData = decrypt(req.query.baseStr,req.query.iv,WATCH_LOGIN_KEY);
        if(reqData && reqData.formUrl){
         req.session.userInfo = reqData;
         req.session.loginWx = null;
            //console.log('wxBack:  ',reqData.formUrl)
         res.redirect(reqData.formUrl)
        }else{
            //console.log('dec Err');
            next(createError(404,'NOT FOUND'));
            return false;
        }
    }else{
        //console.log('session Err');
        next(createError(404,'NOT FOUND'));
        return false;
    }
});
router.get('/successGet',(req, res, next)=>{
    let sysStr = JSON.stringify(req.qmCore.HTTP_SYSTYPE);
    res.render('cRoll/successGet', {title:'领取成功', sysType: sysStr})
})
//不是在App内
router.get('/pastDue',(req, res, next)=>{
    res.render('cRoll/pastDue', {title:'群脉'})
})
module.exports = router;