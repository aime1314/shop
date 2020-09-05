var express = require('express');
var {decrypt}= require("../bin/core/common");
var request = require('request');
var router = express.Router();
// 关于
router.get('/correlationPage', function(req, res, next){
    let plat = req.qmCore.HTTP_SYSTYPE.app;
    if(!req.qmCore.HTTP_SYSTYPE.app ){
        res.render('appCorrelation/correlation',{title: '关于',information:false});
        return false;
    }
    let userIp = '';
    if (req.qmCore.ipArr) {
        userIp = req.qmCore.ipArr[0]
    }
    let opt = {
        method:"GET",
        url:target+"/common/appVersion/ordinary/getCurrentVersion?flag=1&plat="+plat,
        headers:{
            from:from,
            ip:userIp
        }}
        // console.log("### 请求:   ",opt);
    request(opt,(error,response,body)=>{
        // console.log("### 返回:   ",response);
            if(response&&response.statusCode==200 && body){
                if(typeof body == 'string'){
                    try{
                        body = JSON.parse(body)
                    }catch(e){
                        res.render('appCorrelation/correlation',{title: '关于',information:false});
                        return false
                    }
                }
                if(body.data){
                    res.render('appCorrelation/correlation', {title: '关于',information:body.data});
                }else{
                    res.render('appCorrelation/correlation',{title: '关于',information:false});
                    return false
                }
                }else{
                res.render('appCorrelation/correlation',{title: '关于',information:false});
                return false
            }
        }
    );
});
//用户协议
router.get('/correlationPage/agreement', function(req, res, next){
    // if(!req.qmCore.HTTP_SYSTYPE.app && APP_RUN_MOD=='1'){
    //     next(createError(500,'no in app'));
    //     return false
    // }
    res.render('appCorrelation/agreement', {title: '用户协议'})
});
//隐私政策
router.get('/correlationPage/privacy', function(req, res, next){
    // if(!req.qmCore.HTTP_SYSTYPE.app && APP_RUN_MOD=='1'){
    //     next(createError(500,'no in app'));
    //     return false
    // }
    res.render('appCorrelation/privacy', {title: '隐私政策'})
});
//社群负责人条款
router.get('/correlationPage/organClause', function(req,res, next){
    // if(!req.qmCore.HTTP_SYSTYPE.app && APP_RUN_MOD=='1'){
    //     next(createError(500,'no in app'));
    //     return false
    // }
    res.render('appCorrelation/organClause', {title:'社群负责人条款'});
});
//表单
router.get('/activityList', function(req, res, next){
    if(!req.qmCore.HTTP_SYSTYPE.app && APP_RUN_MOD=='1'){
        next(createError(500,'no in app'));
        return false
    }
    let activityId = false;
    if(req.query.activityId){
       activityId = req.query.activityId;
    }else{
        next(createError(500,'id err'));
        return false
    }
    let url = target+"/user/activityAttend/ordinary/getActivityAttendVos";
    let data = {
        "activityId": activityId,
        "pageIndex": 1,
        "pageSize": 2000,
        "tableType": 2
    };
    let userIp = '';
    if (req.qmCore.ipArr) {
        userIp = req.qmCore.ipArr[0]
    }
    let headers = {
        "content-type": "application/json",
        "from":from,
        "ip":userIp
    };
    request({
        method: "POST",
        url: url,
        json:true,
        body: data,
        headers:headers
    }, (error, response, body)=>{
        // //console.log("打印body：",body.data)
        if(error){
            // //console.log(error);
            next(createError(500,'requestToJavaError'));
            return false;
        }else{
            if(body){
                if(typeof body == 'string'){
                    try{
                        body = JSON.parse(body)
                    }catch (e) {
                        next(createError(500,'res json err'));
                        return false;
                    }
                }
                if(body.data){
                    res.render('appCorrelation/activityList', {title: '表单', information: body.data});
                }else{
                    next(createError(500,'res body err'));
                    return false;
                }
            }else{
                next(createError(500,'res err'));
                return false;
            }
        }
    })
});

//错误页面 404
router.get("/error", function(req, res, next){
    res.render('appCorrelation/error',{errMessage:""})
});
//错误页面 不是app内
router.get("/noapp", function(req, res, next){
    res.render('appCorrelation/noapp')
});
router.get("/activityList/token", function(req, res, next){
    request({
        method:"get",
        url:target+"/user/static/ordinary/getStaticFileAuthToken",
        headers:{
            from:from
        }
    },(error, response, body)=>{
        // //console.log("打印BODY:",body)
        if(response.statusCode==200){

            if(typeof body == "string"){
                body = JSON.parse(body);
            }
            res.json(body)
        }else{
            res.json({
                errorCode:"04",
                message:"发送失败"
            })
        }
    })
});



module.exports = router;