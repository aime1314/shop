let Token = require('./watchPublic/accessToken');
let cache = require('memory-cache');
module.exports = class watchPublic{
    constructor(){
        //console.log('wx start ...');
        this._tokenKey = "watchPublic_Access_Token";
        this._ticketKey = "watchPublic_ticketKey";
        this._token = new Token();
        this._getAccessToken();
        return (req,res,next)=>{
            if(req.qmCore == undefined){
                req.qmCore = {"ather":"mocheng"};
            }
            req.qmCore.watchPublic = "watchPublic";
            req.qmCore.wx = {};
            req.qmCore.wx.getToken = this.getToken();
            next();
        }
    }
    _getAccessToken(){
        this._token.getWatchAccessToken((err,backObj)=>{
            if(backObj){
                if(backObj.access_token){
                  //console.log("accessToken is OK :");
                  this._setCacheToken(backObj.access_token,parseInt(backObj.expires_in));
                }else{
                    //TODO
                }
            }else{
                // TODO
            }
        })
    }
    _referToken(){
        this._token.getWatchAccessToken((err,backObj)=>{
            if(backObj){
                if(backObj.access_token){
                    this._setCacheToken(backObj.access_token,parseInt(backObj.expires_in));
                }else{
                    //TODO
                }
            }else{
                // TODO
            }
        })
    }
    _setCacheToken(token,exp){
      cache.put(this._tokenKey,token);
      cache.put("tempAccessToken",token,(exp-120)*1000,this._referToken());
    }
    getToken(){
     let token = cache.get(this._tokenKey);
     return token;
    }
}