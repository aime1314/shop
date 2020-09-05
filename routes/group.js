var express = require('express');
var request = require('request');
var router = express.Router();
let {encrypt, decrypt, makeIv} = require("../bin/common");

var checkSharInfo = function (req) {
    if (!req.query.info || !req.query.iv) {
        return false;
    } else {
        let backData = false;
        try{
            backData = decrypt(req.query.info, req.query.iv);
        }catch (e) {
            return false;
        }
        if (backData) {
            return backData
        } else {
            return false;
        }
    }
}

/**\
 * app内打开一个网页地址，改网页路由地址上会传入加密用户信息，其中包括appVersion（app版本号），根据版本号判断：

 1.若版本号小于1.1.0，则调用app检查更新  {"methodType":"invoke","nativeFlag":"checkNewAppVersion"}

 2.若版本号大于等于1.1.0，则调用app邀请加入小群页面。{"methodType":"invoke","nativeFlag":"acceptGroupInvitePage","params":{"inviteMemberId":"邀请人用户ID可以在路由上拿到","joinSource":"0:此处传0代表邀请加入","groupId":"要加入的群组ID，从路由中可以取到"}}



 该网页命名group/acceptJumpPage  放到app内置和分享页项目中
 */
router.get("/acceptJumpPage",async (req,res,next)=>{
    if(req.qmCore.HTTP_SYSTYPE.app || APP_RUN_MOD == '0'){
   let  shareInfo = checkSharInfo(req);
   if(shareInfo){
       let shareInfoStr = JSON.stringify(shareInfo);
       res.render("group/acceptJumpPage",{shareInfoStr:shareInfoStr});
   }else{
       res.render('appCorrelation/error',{errMessage:"shareInfo or iv error..."})
   }
    }else{
        res.redirect('/appCorrelation/noapp');
    }
});



module.exports = router;