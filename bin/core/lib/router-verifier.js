var createError = require('http-errors');
// verif: array object

/*  [
    {
    key:"参数KEY",
    type:"   [string,number,int]",
    max:"string:最大长度;  number(int):最大值",
    min:"string:最小长度;  number(int):最小值",
    Reg:"正则 只有type:string时有效",  try catch  正则 是同步并消耗大
    callback: (value)=>{    //自定函数,优先执行,value 就是要验证的值,一定要有 return ;
    验证过  :return true; 不过 :return 一个String
    }
    },
    {
    .......
    }
    ]

 */
module.exports = class {
    constructor(verif){
        this._returnNext = null;
        this._verifForm = null;
        this._key = null;
        this._typeArray = ['string','number','int'];
    return (req,res,next)=>{
        if(req.method=='GET'){
            this._verifForm = req.query;
        }else{
            this._verifForm = req.body;
        }
        //console.log("verifForm: ",this._verifForm);
        if(typeof verif=="object"){
            this._doObject(verif);
        }else if(typeof verif =="array"){
           for(let item of verif){
               if(!this._doObject(verif)){
                   return false;
               }
           }
        }else if(typeof verif =="string"){
            this._key = verif;
            this._doExist();
        }
        next(this._returnNext);
    }
    }
    _doObject(obj){
        //取object 的key
        if(obj.key && typeof obj.key=='string' && obj.key.length>0){
            this._key = obj.key;
        }else{
            his._returnNext = createError(401, 'verifForm is object ,but key is error');
            return false;
        }
        // 回调处理
        if(obj.callback && typeof obj.callback == 'function'){
            if(!this._doCallBack(obj.callback))
            return false;
        }
        if(obj.type && typeof obj.type == 'string' && obj.type.length>0){
         let nowType = this._typeArray.find((t)=>{
             return t == obj.type.toLowerCase();
         });
        if(!nowType){
            this._doExist();
            return false;
        }
        if(nowType == "string"){
            if(!this._doSting()){
                return false;
            }
            if(obj.Reg){
               if(!this._doReg(obj.Reg)){
                   return false;
               }
            }
            if(obj.max){
                if(!this._doStringMax(obj.max)){
                    return false;
                }
            }
            if(obj.min){
                if(!this._doStringMin(obj.min)){
                    return false;
                }
            }

        }else{
         if(nowType == "number"){
             if(!this._doNumber()){
                 return false;
             }
         }else if (nowType == "int"){
             if(!this._doInt()){
                 return false;
             }
         }
         if(obj.max){
             if(!this._doNumberMax(obj.max)){
                 return false;
             }
         }
         if (obj.min){
             if(!this._doNumberMin(obj.min)){
                 return false;
             }
         }
        }
        }else{
            this._doExist();
            return false;
        }
        return true;
    }
    //默认的验证  不能为空,只能是string number
    _doExist(){
        if(!this._verifForm[this._key]){
            this._returnNext = createError(401, this._key +" is not exist")
            return false;
        }else if( typeof this._verifForm[this._key] != "string" && !this._verifForm[this._key] =="number" ){
            this._returnNext = createError(401, this._key +" is must be \'string\' or \'number\'");
            return false;
        }
        return true;
    }
  //验证  number
    _doNumber(){
        if(typeof this._verifForm[this._key] != "number"){
        this._returnNext = createError(401, this._key +" is must be  \'number\'");
        return false;
        }
        return true;
    }
    //验证  number MAX
    _doNumberMax(max){
        if(Number(this._verifForm[this._key])>Number(max)){
            this._returnNext = createError(401, this._key +" mas is "+ max);
            return false;
        }
        return true;
    }
    //验证  number MIN
    _doNumberMin(min){
        if(Number(this._verifForm[this._key])<Number(min)){
            this._returnNext = createError(401, this._key +" mas is "+ min);
            return false;
        }
        return true;
    }
    //验证  INT
    _doInt(){
        if((this._verifForm[this._key] % 1)!== 0){
            this._returnNext = createError(401, this._key +" is must be  \'Int\'");
            return false;
        }
        return true;
    }
    _doSting(){
      if(typeof this._verifForm[this._key] != 'string'){
          this._returnNext = createError(401, this._key +" is must be  \'string\'");
          return false;
      }
      return true;
    }
    _doStringMax(strMax){
     if(this._verifForm[this._key].length>parseInt(strMax)){
         this._returnNext = createError(401, this._key +" length is Max be "+strMax);
         return false;
     }
     return true;
    }
    _doStringMin(strMin){
        if(this._verifForm[this._key].length<parseInt(strMin)){
            this._returnNext = createError(401, this._key +" length is Min be "+strMin);
            return false;
        }
        return true;
    }
    _doReg(reg){
      try{
        let regRoulse =  reg.test(this._verifForm[this._key]);
        if(!regRoulse){
            this._returnNext = createError(401, this._key +" is not Reg  ");
            return false;
        }
        return true;
      }catch(e){
          this._returnNext = createError(401, " run Reg is error ");
          return false;
      }
    }
    _doCallBack(cb){
        let cbReSou = cb(this._verifForm[this._key]);
        if(cbReSou===true){
            return true;
        }else{
            if(cbReSou  != undefined && typeof cbReSou=='string' && cbReSou.length >0 ){
                this._returnNext = createError(401, cbReSou);
            }else{
                this._returnNext = createError(401, " callback verifier is error ");
            }
            return false;
        }
    }
}