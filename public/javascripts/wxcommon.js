
window.onload = function(){
  var webPa = get_pathinfo_arguments();
  var buildQuery = function f(obj,obj_key){
        var postData="";
        var my_key;
        var params = [];
        for (var key in obj){
            if(obj_key){
                my_key=obj_key+"["+key+"]";
            }else{
                my_key = key;
            }
            if((typeof obj[key]) =="object"){
                params.push(buildQuery(obj[key],my_key));
            }else{
                params.push(my_key + "=" + obj[key]);
            }
        }
        return params.join("&");
    };
    if(window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" ) {             
           //正则在微信环境下,
        if(wx){    
             //微信JSDK 有效动作
            // console.log("//微信JSDK 有效动作");
        var WxSin = new XMLHttpRequest();
            WxSin.open("POST", '/api/shart?uri='+encodeURIComponent(window.location.href),false);
            WxSin.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
            WxSin.onreadystatechange = function () {
                if (WxSin.readyState == 4 && WxSin.status == 200) {
                    var wxBack = JSON.parse(WxSin.responseText);
                    if(!wxBack || ! wxBack.data){
                        console.log('share data err..');
                        return false;
                    }
                    var  backDate = wxBack.data;
                    // console.log("backDate: ",backDate);
                    console.log("打印callb：",wxBack)
                    console.log("#####****",backDate)
                    backDate.debug = false;                       //调试模式  支持PC调试
                    backDate.jsApiList = [                           //启用的微信  API  接口 list
                        'updateAppMessageShareData',       // 新版分享给朋友”及“分享到QQ ,  未使用
                        'updateTimelineShareData' ,            //新版分享到朋友圈”及“分享到QQ空间,    未使用
                        'checkJsApi',
                        'onMenuShareTimeline',                 //分享到朋友圈
                        'onMenuShareAppMessage',               //分享给朋友
                        'onMenuShareQQ',                        //分享到QQ
                        'onMenuShareWeibo',                   //分享到腾讯微博
                        'onMenuShareQZone'                   //分享到QQ空间
                    ];
                    wx.config(backDate);
                    var WebShareData = {
                        "title":'',                                  // 分享标题
                        "link":window.location.href,                // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                        "desc": "",             // 分享描述
                        "imgUrl" : '',         //分享图标
                        // "type": '',                                        // 分享类型,music、video或link，不填默认为link
                        // "dataUrl": ''                                    // 如果type是music或video，则要提供数据链接，默认为空
                    };
                    if(wxWebshareDb){
                        if(wxWebshareDb.title){
                            WebShareData.title = wxWebshareDb.title;
                        }
                        if(wxWebshareDb.link){
                            WebShareData.link = wxWebshareDb.link;
                        }
                        if(wxWebshareDb.desc){
                            WebShareData.desc = wxWebshareDb.desc;
                        }
                        if(wxWebshareDb.imgUrl){
                            WebShareData.imgUrl = wxWebshareDb.imgUrl;
                        }
                    }
                    setTimeout(function(){
                        // console.log(kj_id,'kj_id66')
                        // if(kj_id){
                        //     WebShareData.link = window.location.href+'&k_shareid='+kj_id;
                        //     console.log(WebShareData.link,'kj_id66')
                        // }
                    },500)
                    console.log("微信打印",WebShareData)
                    wx.ready(function () {

                        wx.onMenuShareAppMessage(WebShareData);
                        wx.onMenuShareTimeline(WebShareData);
                        wx.onMenuShareQQ(WebShareData);
                        wx.onMenuShareWeibo(WebShareData);
                        wx.onMenuShareQZone(WebShareData);
                    });
                    wx.error(function (err) {
                        console.log("wx_err: ",err);
                    });
                }}
            WxSin.send(buildQuery(webPa));
        }else{
            console.error("WX_JSDK is not found");
        }
    }
}



/*
   * javascript 获取url参数
   * 自动过滤 index.php
   * url_num number MVC 层数(默认:3)
   * */
function get_pathinfo_arguments(url_num){
    if(arguments[0]===0||!arguments[0]){
        url_num = 3;
    }else{
        url_num =  parseInt(url_num);
    }
    var pathname_str = location.pathname.split('.html')[0];
    var search_str = location.search;
    var au_obj = {};           //AUG  object
    var key_name,path_arr;    // PATH array
    if(pathname_str &&pathname_str.substr(-5,5)!='.html'){
        if(pathname_str.substr(0,1)==='/'){pathname_str = pathname_str.slice(1);}
        if(pathname_str.substr(0,9)==='index.php'){pathname_str = pathname_str.slice(10);}
    }
        if(pathname_str.length>0){
        if(pathname_str.indexOf("/")==-1){
            path_arr = [pathname_str];
        }else{
        path_arr = pathname_str.split('/');
        var au_obj_key = 0;
        var au_arr_list = [];
        for(var mvc_i = 0 ;mvc_i<path_arr.length;mvc_i++){
            if(path_arr[mvc_i]&&mvc_i>=url_num){
                if(!(au_obj_key%2)){
                    key_name = path_arr[mvc_i];
                }else{
                    au_obj[key_name] = path_arr[mvc_i];
                }
                au_arr_list.push(path_arr[mvc_i]);
                au_obj_key++;
            }
        }
        }
        }else{
            path_arr = [];
        }
    if(search_str){
        var au_str = search_str.slice(1);
        var au_str_arr = au_str.split('&');
        var se_exp = new RegExp('=');
        for(var i in au_str_arr){
            if(au_str_arr[i].search(se_exp)>0){
                key_name = au_str_arr[i].substr(0,au_str_arr[i].search(se_exp));
                au_obj[key_name] = au_str_arr[i].slice(au_str_arr[i].search(se_exp)+1);
            }else{
                au_obj[au_str_arr[i]] = '';
            }
        }
    }
    return {"pArr":path_arr,"aObj":au_obj};
}