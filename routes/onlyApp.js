var express = require('express');
var request = require('request');
var router = express.Router();

router.get("/*",async (req,res,next)=>{
    // console.log(req.query.from);
    let from = req.query.from;
    if(from != "directOpen" && from != "qrCode"){
        next(createError(404,"onlyApp from err.."));
    }else{
        // console.log(req.qmCore.HTTP_SYSTYPE.app)
        if(!req.qmCore.HTTP_SYSTYPE.app ){
         //若是在app内打开
            if(from == "directOpen"){
                res.render('appCorrelation/onlyApp' ,{message:"该网页对应的页面不存在或来源不正确",isApp:req.qmCore.HTTP_SYSTYPE.app});
            }else{
                res.render('appCorrelation/onlyApp',{message: "该链接为二维码链接，请用群脉app扫描原二维码",isApp:req.qmCore.HTTP_SYSTYPE.app});
            }
        }else{
          //若是在app外打开
           if(from == "directOpen"){
               res.render('appCorrelation/onlyApp' ,{message:"请用群脉app打开该网页，并确认该网页是否合法。",isApp:req.qmCore.HTTP_SYSTYPE.app});
           }else{
               res.render('appCorrelation/onlyApp',{message: "请用群脉app扫码",isApp:req.qmCore.HTTP_SYSTYPE.app});
           }
        }
    }
})

module.exports = router;