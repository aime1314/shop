let wxReq = require('request');
module.exports = class {
    constructor(appid, appSecret) {
        this._appid = appid || "wx49121a2ce7192dc6";
        this._appSecret = appSecret || "1ffad4d8f6c96c2b49c2f0e77b439e08";
        this._tokenUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + this._appid + "&secret=" + this._appSecret;
    }

    getWatchAccessToken(callback) {
        let opt = {
            method: "GET",
            url: this._tokenUrl
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