var express = require("express");
var request = require("request");
var router = express.Router();
var addressData = require("../public/javascripts/address/address.json");

router.use((req, res, next) => {
    req.session.userInfo = {
        memberId: 4642502912602314
    };
    next();
});

router.get("/index", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/applyShop/admin/getUserInfo",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.render("applyShop/index", { title: "我的生意", information: JSON.parse(body).data })
    })
});

// 查看可申请小脉部
router.get("/clist", (req, res, next) => {
    let type = req.query.type || 0;
    res.render("applyShop/clist", {title: "选择社区", type: type});
});

// 查看可申请小脉部
router.get("/getOrganShop", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/applyShop/admin/getOrganShop",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    };
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    });
});

// 查询自己的小脉部
router.get("/getShop", (req, res, next) => {
    console.log(req.query);
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/applyShop/admin/getShop?status=0",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    };
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    })
});

// 查询未达标的商店
router.get("/getUnFinishedOrgan", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/applyShop/admin/getUnFinishedOrgan",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    };
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    })
});

// 小脉部申请页面
router.get("/regform", (req, res, next) => {
    let userInfo = req.session.userInfo;

    if(req.query.type == 'review') {
        // 查询shopShelf详情
        // /shop/applyShop/admin/getShopShelfDtoByShopId
        let opt = {
            method: "GET",
            url: target + "/shop/applyShop/admin/getShopShelfDtoByShopId?shopId=" + req.query.id,
            headers: {
                from: from,
                memberId: userInfo.memberId
            }
        };
        request(opt, (error, response, body) => {
            console.log(body);
            res.render("applyShop/regform", {title: '小脉部申请', id: req.query.id, name: req.query.shopname, review: true, information: JSON.stringify(JSON.parse(response.body).data)});
        });
    }else {
        res.render("applyShop/regform", {title: '小脉部申请', id: req.query.id, name: req.query.shopname, review: false, information: JSON.stringify({})});
    }
    
});

// 申请小脉部
router.post("/register", (req, res, next) => {
    console.log(req.body);
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/applyShop/admin/openingShop",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        res.json(body);
    })
});

// 重新审核店铺
router.post("/reOpeningShop", (req, res, next) => {
    console.log(req.body);
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/applyShop/admin/reOpeningShop",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        res.json(body);
    })
});

// 选择省市区
router.get("/selectArea/:id/:shopname", (req, res, next) => {
    let provinceList = [];
    for(let i = 0; i<addressData.length; i++) {
        provinceList.push({
            id: addressData[i].id,
            adcode: addressData[i].provinceID,
            label: addressData[i].province,
        })
    }
    res.render("applyShop/selectArea", {title: "选择定位", type: "isProvince", provinceList: JSON.stringify(provinceList), id: req.params.id, name: req.params.shopname });
});

// 获取城市
router.get("/getCityData/:provinceIndex", (req, res, next) => {
    let provinceIndex = req.params.provinceIndex;
    let cityData = addressData[provinceIndex].cityList;
    let cityList = [];
    for(let i = 0; i<cityData.length; i++) {
        cityList.push({
            id: cityData[i].id,
            adcode: cityData[i].cityID,
            label: cityData[i].city
        });
    }
    res.json(cityList);
});

// 获取县区
router.get("/getAreaData/:provinceIndex/:cityIndex", (req, res, next) => {
    let areaData = addressData[req.params.provinceIndex].cityList[req.params.cityIndex].areaList;
    let areaList = [];
    for(let i = 0; i<areaData.length; i++) {
        areaList.push({
            id: areaData[i].id,
            adcode: areaData[i].areaID,
            label: areaData[i].area
        });
    }
    res.json(areaList);
});

// 获取经纬度
router.post("/getLocation", (req, res, next) => {
    let opt = {
        method: "GET",
        url: encodeURI("https://restapi.amap.com/v3/config/district?key=e3d82469611c905f4066dffa90bf84b2&keywords="+req.body.address.areaLabel+"&subdistrict=0&extensions=base")
    };
    request(opt, (error, response, body) => {
        let location = JSON.parse(response.body).districts[0].center;
        console.log(location);
        
        res.json(JSON.parse(body));
    })
})

// 地图页面
router.get("/location/:location/:id/:shopname", (req, res, next) => {
    res.render("applyShop/location", {title: "选择定位", location: req.params.location, id: req.params.id, name: req.params.shopname });
    return;
    let opt = {
        method: "GET",
        url: encodeURI("https://m.amap.com/picker/?keywords=写字楼,小区,学校&zoom=15&center="+ req.params.location +"&radius=1000&total=20&key=d0f34f27323cbb0de4a573ea3d3d5627")
    };
    request(opt, (error, response, body) => {
        
        console.log(body);
        res.render("applyShop/location", {title: "选择定位"  });
    })
    
    
});


// 审核结果
router.get("/status", (req, res, next) => {
    console.log(req.query.type);
    // type sussess/error
    let type = req.query.type;
    let shopId = req.query.shopId;
    let shopname = req.query.shopname;
    let msg = req.query.msg;
    let body;
    if(type == "sussess") {
        body = {
            title: "审核结果",
            type
        }
    }else if(type == "error") {
        body = {
            title: "审核结果",
            type,
            shopId,
            shopname,
            msg
        }
    }
    res.render("applyShop/status", body);
});

module.exports = router;
