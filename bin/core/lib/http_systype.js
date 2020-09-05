module.exports = function () {
    return (req,res,next)=>{
      let  HTTP_SYSTYPE = {
                app:false,
                watch:false,
                pc:false,
                moble:false
        };
        if(req.get("qmappheadtage")=="IOS"){
            HTTP_SYSTYPE.app = "IOS";
            // from = "1f874c83e7b8be3732d096ea6e812d31"
            from = "40288a1369ce28c10169ce28c14e000f"
        }else if(req.get("qmappheadtage") == "ANDROID"){
            HTTP_SYSTYPE.app = "ANDROID";
            from = "40288a1369ce28c10169ce28c14e000f"
        }else{
            var u = req.get("User-Agent");
            if(u && typeof u == 'string'){
            if(u.match(/MicroMessenger/i)){
                // from = "39ab41b11ea474382d8803f85d1dbece"
                from = "40288a1369ce28c10169ce28c14e000f"
                HTTP_SYSTYPE.watch=true
            }else if (!!u.match(/AppleWebKit.*Mobile.*/)) {
                HTTP_SYSTYPE.moble = true;
                from = "40288a1369ce28c10169ce28c14e000f"
                if(u.match(/iPhone|iPad|iPod/i)){
                    from = "40288a1369ce28c10169ce28c14e000f"
                    HTTP_SYSTYPE.moble = 'IOS';
                }
            }else{
                HTTP_SYSTYPE.pc=true;
            }
            }
        }
        if(req.qmCore == undefined){
            req.qmCore = {"ather":"mocheng"};
        }
        let reqIpStr = req.ip || req.headers['x-forwarded-for'];
        var ipReg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
        req.qmCore.ipArr = reqIpStr.match(ipReg);
        req.qmCore.HTTP_SYSTYPE = HTTP_SYSTYPE;
        res.set({
            'Server': 'Apache',
            'X-Powered-By':'PHP/5.6.38'
        });
        next();
    }
}