var express = require('express');
var router = express.Router();
let {decrypt,encrypt,makeIv} = require('../bin/common');
let urlencode = require('urlencode');
router.get('/index', function(req, res, next) {
  //console.log("测试 qmCore中间件 in controller: ",req.qmCore);
  res.render('index', { title: '好享聚_测试URL(生产环境返回404)' });
});
router.get('/', function(req, res, next) {
    // console.log("测试 qmCore中间件 in controller: ",req.qmCore);
    res.render('index', { title: '好享聚_测试URL(生产环境返回404)' });
});
router.get('/ajax', function(req, res, next) {
    //console.log("query: ",req.query);
    //console.log("body: ",req.body);
      res.json({data:{"errCode":0}});
});
/*
$baseStr  解密后的数据基本样式
{
    type:"userinfo",   授权类型
    formUrl:"" ,       解密后跳转URL
    indexUrl:""        解密入口URL  [非本地授权,必须]
}
*/
router.get('/wxLoginBack',function(req, res, next){

    let hostUrl = req.protocol+"://"+req.hostname+':65503';
    let url = hostUrl+req.url
    let indexUrl = req.protocol+"://"+req.hostname+":65503/login/wxBack";
    let loginDb = {
          type:"userinfo",
          formUrl:url ,
          indexUrl:indexUrl
    }
    //console.log("授权加密",loginDb);
    //Buffer.from(JSON.stringify(myStr)).toString('base64');
    let iv = makeIv();
    let enStr = encrypt(Buffer.from(JSON.stringify(loginDb)).toString('base64'),iv,WATCH_LOGIN_KEY);
    if(enStr){
        let redirectUrl = WATCH_LOGIN_HOST+"/login/wx"+'?baseStr='+urlencode(enStr)+'&iv='+iv;
        res.redirect(redirectUrl);
    }else{
        //console.log("encrypt error")
    }
    res.json({data:{"errCode":0}});
});
module.exports = router;
