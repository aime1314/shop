/**
 * Created by Administrator on 2019/4/8.
 */


var crypto = require('crypto');
/**
 * AES加密的配置
 * 1.密钥
 * 2.偏移向量
 * 3.算法模式CBC
 * 4.补全值
 */

  //  iv: "MGQ2YWFlYTk5YjAxNmFhZQ==", //偏移向量
function decrypt(data,IV,Key){
    if(!Key){
        Key = decryptKey
    }
    data = data.replace(' ','+');
    try {
        let key = Buffer.from(Key, 'base64').toString();
        let iv =  Buffer.from(IV, 'base64').toString();
        var cipherChunks = [];
        var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        decipher.setAutoPadding(true);
        cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
        cipherChunks.push(decipher.final('utf8'));
        try{
            let backData =  JSON.parse(Buffer.from(cipherChunks.join(''), 'base64').toString());
            return backData;
        }catch(err1){
            //console.log("decrypt Json Error: ",err1);
            return false;
        }
    } catch(err){
        //console.log("decrypt Error: ",err);
        return false;
    }
}
//加密
function encrypt(str,IV,Key) {
    if(!Key){
        Key = decryptKey
    }
    try {
        let key = Buffer.from(Key, 'base64').toString();
        let iv =  Buffer.from(IV, 'base64').toString();
        var miwenArr = [];
        var  cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        cipher.setAutoPadding(true);
        miwenArr.push(cipher.update(str, 'utf8', 'base64'));
        miwenArr.push(cipher.final('base64'));
        return miwenArr.join('');
    } catch(err){
        //console.log("encrypt Error: ",err);
        return false;
    }
}
//生成向量
function makeIv() {
    let str = 'abcdefghijklmnopqrstuvwxyz9876543210';
    let tmp = '',
        i = 0,
        l = str.length;
    for (i = 0; i < 16; i++) {
        tmp += str.charAt(Math.floor(Math.random() * l));
    }
    // //console.log(tmp.length,tmp);
    return Buffer.from(tmp).toString('base64');
}
module.exports = { decrypt:decrypt,makeIv:makeIv,encrypt:encrypt};