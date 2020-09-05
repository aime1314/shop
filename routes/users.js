var express = require('express');
var request = require('request');
var router = express.Router();
var {decrypt }= require("../bin/core/common");
var sessionCheck = function(req){
     let userSession = req.session.userSession;
     return userSession;
};
/* GET users listing. */
router.get('/index', function(req, res, next) {
    let user = sessionCheck(req);
    // console.log("打印req：",req.query)
    if(!req.query.memberId || parseInt(req.query.memberId)<=0){
        next(createError(404,'memberId is error'));
        return false;
    }else{
        res.redirect('/share/personalPage?memberId='+req.query.memberId);
    }
});
module.exports = router;
