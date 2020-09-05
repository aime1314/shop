let wxReq = require('request');
module.exports = class {
    constructor(accessToken){
        this._token = accessToken;
        this._tickeUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token="+this._token+"&type=jsapi"
    }
    getWebTickeObj(url,callback){
        let opt = {
            method: "GET",
            url: this._tickeUrl
        }
        wxReq(opt, (error, response, body) => {
            if (error) {
                callback(error, null)
            } else {
                callback(null, JSON.parse(body));
            }
        });
    }
    }
}