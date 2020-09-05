var express = require("express");
var request = require("request");
var router = express.Router();
var common = require("../public/javascripts/webcommon");
var { decrypt, encrypt, makeIv } = require("../bin/common");

router.use((req, res, next) => {
    req.session.userInfo = {
        memberId: 4642502912602314
    };
    next();
});

// 小脉部商店首页
router.get("/index/:shopId", (req, res, next) => {
    let shopId = req.params.shopId;
    res.render("mall/index", {title: "小脉部", shopId: shopId});
});

// 获取商店基本信息
router.get("/getShopInfo", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shopId = req.query.shopId;
    // 小脉部首页
    // /shop/shelf/ordinary/getShelfIndex
    let opt = {
        method: "GET",
        url: target + "/shop/shelf/ordinary/getShelfIndex?shopId=" + shopId + "&isNeedHead=true",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    })
});

// 获取商店货架分类商品列表
router.get("/getShelfModelWithGoods", (req, res, next) => {
    // 获取商店货架分类商品列表
    // /shop/shelfModel/ordinary/getShelfModelWithGoods
    let userInfo = req.session.userInfo;
    let shopId = req.query.shopId;
    let shelfId = req.query.shelfId;
    let shelfModelId = req.query.shelfModelId;
    let opt = {
        method: "GET",
        url: target + "/shop/shelfModel/ordinary/getShelfModelWithGoods?shopId=" + shopId + "&shelfId=" + shelfId + "&shelfModelId=" + shelfModelId,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    });
});

// 加入购物车前获取商品详情
router.get("/getShopGoodsDetail", (req, res, next) => {
    console.log(req.query);
    // 获取商店商品详情
    // /shop/shopGoods/ordinary/getShopGoodsVoDetail
    let userInfo = req.session.userInfo;
    let goodsCode = req.query.goodsCode;
    let shopId = req.query.shopId;
    // isNeedSku 是否返回单品列表 1 返回，其他不返回
    // isNeedAttrs 是否返回商品属性列表 1 返回，其他不返回
    // isNeedGoodsMsg 是否返回商品主信息，0：否 1，是，在列表加入购物车时，不需要商品主信息
    let opt = {
        method: "GET",
        url: target + "/shop/shopGoods/ordinary/getShopGoodsVoDetail?goodsCode=" + goodsCode + "&shopId=" + shopId + "&isNeedSku=1&isNeedAttrs=1&isNeedGoodsMsg=0",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    });
});

// 获取单品可购买状态
router.get("/getShopSkuAndGoodsStatus", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let skuCode = req.query.skuCode;
    let shopId = req.query.shopId;
    let opt = {
        method: "GET",
        url: target + "/shop/goodsShopSku/ordinary/getShopSkuAndGoodsStatus?skuCode=" + skuCode + "&shopId=" + shopId,
        headers: {
            from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    });
});

// 小脉部商店商品详情
router.get("/detail", (req, res, next) => {
    let goodsCode = req.query.goodsCode;
    let shopId = req.query.shopId;
    res.render("mall/detail", {title: "商品详情", shopId: shopId, goodsCode: goodsCode});
});

// 获取商店商品详情
router.get("/getGoodsDetail", (req, res, next) => {
    // 获取商店商品详情
    // /shop/shopGoods/ordinary/getShopGoodsVoDetail
    let userInfo = req.session.userInfo;
    let goodsCode = req.query.goodsCode;
    let shopId = req.query.shopId;
    let opt = {
        method: "GET",
        url: target + "/shop/shopGoods/ordinary/getShopGoodsVoDetail?goodsCode=" + goodsCode + "&shopId=" + shopId + "&isNeedSku=1&isNeedAttrs=1&isNeedGoodsMsg=1",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 添加、修改购物车
router.post("/updateGoodsNum", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/cart/admin/updateGoodsNum",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        res.json(body);
    })
});

// 删除购物车
router.post("/deleteItem", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/cart/admin/deleteItem",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        res.json(body);
    });
});

// 购物车结算
router.get("/cartSubmit", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shopId = req.query.shopId;
    let opt = {
        method: "GET",
        url: target + "/shop/cart/admin/cartSubmit?shopId=" + shopId,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        // let data = JSON.parse(body).data;
        res.json({name: 333});
    });
});

// 小脉部商店地图详情
router.get("/map", (req, res, next) => {
    res.render("mall/map", {title: "商家地址",  });
});

// 小脉部商店商家环境
router.get("/info", (req, res, next) => {
    let photoFiles = req.query.photoFiles.split(",");
    res.render("mall/info", {title: "商家环境", photoFiles: photoFiles });
});

// 小脉部商店商家资质
router.get("/infos", (req, res, next) => {
    let photoFiles = req.query.photoFiles.split(",");
    res.render("mall/infos", {title: "商家资质", photoFiles: photoFiles });
});

// 小脉部商店购物车
router.get("/cart", (req, res, next) => {
    let shopId = req.query.shopId;
    let shelfId = req.query.shelfId;
    res.render("mall/cart", {title: "购物车", shopId, shelfId });
});

// 获取购物车商品列表
router.get("/getCartData",(req, res, next) => {
    let userInfo = req.session.userInfo;
    console.log(req.query);
    let shopId = req.query.shopId;
    let opt = {
        method: "GET",
        url: target + "/shop/cart/admin/cartList?shopId=" + shopId,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    });
});

// 选中、取消选中
router.post("/checkBoxItem", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/cart/admin/checkBoxItem",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data
    }
    console.log(data);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    })
});

// 小脉部商店购物车结算
router.get("/payCartOrder", (req, res, next) => {
    // 结算 购物车接口
    // /shop/cart/admin/cartSubmit
    let userInfo = req.session.userInfo;
    let data = req.query;
    let shopId = req.query.shopId;
    let opt = {
        method: "GET",
        url: target + "/shop/cart/admin/cartSubmit?shopId=" + shopId,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        if(JSON.parse(body).errorCode == 0) {
            res.render("mall/payCartOrder", {title: "确认订单", information: JSON.stringify(JSON.parse(body).data), type: 0 });
        }else {
            res.render("mall/payCartOrder", {title: "确认订单", information: JSON.stringify({}), type: 4 });
        }
        
    });
});

// 小脉部商店确认订单
router.get("/payOrder", (req, res, next) => {
    console.log(req.query);
    let userInfo = req.session.userInfo;
    let data = req.query;
    let opt = {
        method: "POST",
        url: target + "/shop/cart/admin/buyOneItem",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.render("mall/payOrder", {title: "确认订单", information: JSON.stringify(body.data), shelfId: data.shelfId, data: JSON.stringify(data) });
    })
    
});

// 获取订单详情
router.get("/getPayOrder", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.query;
    let opt = {
        method: "POST",
        url: target + "/shop/cart/admin/buyOneItem",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    })
});

// 小脉部商店地址列表
router.get("/address", (req, res, next) => {
    let id = "";
    if(req.query.id) {
        id = req.query.id;
    }
    res.render("mall/address", {title: "地址列表", id: id });
});

// 查询用户地址
router.get("/getAddressList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let pageIndex = req.query.pageIndex;
    let pageSize = req.query.pageSize;
    let opt = {
        method: "GET",
        url: target + "/shop/user/admin/addressList?pageIndex="+ pageIndex +"&pageSize=" + pageSize,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(error);
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 小脉部商店添加/修改地址
router.get("/editAddress", (req, res, next) => {
    console.log(req.query);
    console.log(typeof req.query);
    console.log(Object.keys(req.query).length);
    if(Object.keys(req.query).length > 0) {
        res.render("mall/editAddress", {title: "修改地址", id: req.query.id, url: "/mall/updateAddress" });
    }else {
        res.render("mall/editAddress", {title: "添加地址", id: "", url: "/mall/addAddress" });
    }
});

// 获取地址详情
router.get("/getAddress", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let id = req.query.id;
    let opt = {
        method: "GET",
        url: target + "/shop/user/admin/getAddressById?id=" + id,
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 增加用户地址
router.post("/addAddress", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/user/admin/addAddress",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});

// 修改用户地址
router.post("/updateAddress", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/user/admin/updateAddress",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});

// 小脉部确认订单自提地址
router.get("/getExtract", (req, res, next) => {
    // 自提、退货地址列表
    // /shop/pickAddress/ordinary/pickAddressList
    let userInfo = req.session.userInfo;
    let shelfId = req.query.shelfId;
    let nowLng = req.query.nowLng;
    let nowLat = req.query.nowLat;
    let data = {
        addressType: 1,
        isDefault: 0,
        nowLng: nowLng,
        nowLat: nowLat,
        shelfId: shelfId,
        pageIndex: 1,
        pageSize: 20
    }
    let opt = {
        method: "POST",
        url: target + "/shop/pickAddress/ordinary/pickAddressList",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        res.json(body);
    });
});

// 小脉部商店自提地址列表
router.get("/extract", (req, res, next) => {
    // 自提、退货地址列表
    // /shop/pickAddress/ordinary/pickAddressList
    let shelfId = req.query.shelfId;
    let type = req.query.type;
    let id = "";
    if(req.query.id) {
        id = req.query.id;
    }
    res.render("mall/extract", {title: "自提地址选择", id: id, shelfId: shelfId, type: type });
});

// 获取商店自提地址列表
router.get("/getExtractList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shelfId = req.query.shelfId;
    let pageIndex = req.query.pageIndex;
    let pageSize = req.query.pageSize;
    let nowLat = req.query.nowLat;
    let nowLng = req.query.nowLng;
    let data = {
        addressType: 1,
        isDefault: 0,
        nowLng: nowLng,
        nowLat: nowLat,
        shelfId: shelfId,
        pageIndex: pageIndex,
        pageSize: pageSize
    }
    let opt = {
        method: "POST",
        url: target + "/shop/pickAddress/ordinary/pickAddressList",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    })
});

// 获取卖家退货地址
router.get("/getReturnAddress", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shelfId = req.query.shelfId;
    let data = {
        addressType: 2,
        isDefault: 0,
        nowLng: "",
        nowLat: "",
        shelfId: shelfId,
        pageIndex: 1,
        pageSize: 20
    }
    let opt = {
        method: "POST",
        url: target + "/shop/pickAddress/ordinary/pickAddressList",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    })
});

// 获取用户脉粒
router.get("/getMemberScore", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/user/memberScore/admin/getMemberScore",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 提交订单
router.post("/orderSubmit", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let len = 6;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = $chars.length;
    var randomString = '';
    for (i = 0; i < len; i++) {
        randomString += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    let opt = {
        method: "POST",
        url: target + "/shop/myOrder/admin/orderSubmit",
        headers: {
            from: from,
            memberId: userInfo.memberId,
            uuidCode: randomString
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        res.json(body);
    });
});

// 小脉部商店支付
router.get("/pay", (req, res, next) => {
    let orderCode = req.query.orderCode;
    let shopId = req.query.shopId;
    res.render("mall/pay", {title: "支付", orderCode: orderCode, shopId: shopId });
});

// 获取订单支付方式
router.get("/getOrderPayList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let orderCode = req.query.orderCode;
    let opt = {
        method: "GET",
        url: target + "/shop/order/admin/getOrderPayList?orderCode=" + orderCode,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 获取第三方支付参数
router.post("/getPaymentParams", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/pay/payment/admin/getPaymentParams",
        headers: {
            from: from,
            memberId: userInfo.memberId,
            openId: "otz9NxAi1PWZURhlvUv2eeGiCZhQ"
        },
        json: true,
        body: data,
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    })
});

// 现金账户直接支付
router.post("/memberPay", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let config = req.body;
    let iv = makeIv();
    let data = {
        amount: config.amount,
        payScene: config.payScene,
        itemId: config.itemId,
        iv: iv,
        password: encrypt(Buffer.from(config.password).toString('base64'), iv),
        remark: ""
    }
    let opt = {
        method: "POST",
        url: target + "/user/memberMoney/admin/memberPayWithScore",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});

// 微信支付
router.post("/wxPay", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let config = req.body;
    let data = {
        amount: config.amount,
        paidFor: config.paidFor,
        itemId: config.itemId,
        payType: config.payType
    }
    let opt = {
        method: "POST",
        url: target + "/pay/payment/admin/getPaymentParams",
        json: true,
        body: data,
        headers: {
            from: from,
            memberId: userInfo.memberId,
            openId: "otz9NxBFcBxxXZeD9Dw1vpY754hU"
        },
    }
    console.log(opt);
    console.log(config);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});

// 阿里支付
router.post("/AliPay", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let config = req.body;
    let data = {
        amount: config.amount,
        paidFor: config.paidFor,
        itemId: config.itemId,
        payType: config.payType
    }
    let opt = {
        method: "POST",
        url: target + "/pay/payment/admin/getPaymentParams",
        json: true,
        body: data,
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
    }
    console.log(opt);
    console.log(config);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});


// 小脉部商店充值
router.get("/topUp", (req, res, next) => {
    res.render("mall/topUp", {title: "充值",  });
});

// 小脉部商店支付结果
router.get("/status", (req, res, next) => {
    res.render("mall/status", {title: "支付结果",  });
});

// 小脉部商店支付结果
router.get("/payStatus", (req, res, next) => {
    let shopId = req.query.shopId;
    res.render("mall/payStatus", {title: "支付结果", shopId: shopId });
});

// 小脉部商店订单列表
router.get("/orderList", (req, res, next) => {
    let shopId = req.query.shopId;
    let shelfId = req.query.shelfId;
    let type = req.query.type || 0;
    res.render("mall/orderList", {title: "订单列表", shopId: shopId, shelfId: shelfId, type: type });
});

// 获取订单列表
router.post("/getOrderList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/myOrder/admin/orderList",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    })
});

// 小脉部商店订单详情
router.get("/orderDetail", (req, res, next) => {
    let orderCode = req.query.orderCode;
    res.render("mall/orderDetail", {title: "订单详情", orderCode: orderCode });
});

// 获取订单详情
router.get("/getOrderDetail", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let orderCode = req.query.orderCode;
    let opt = {
        method: "GET",
        url: target + "/shop/myOrder/admin/orderDetail?orderCode=" + orderCode,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 小脉部商店物流详情
router.get("/wuliu", (req, res, next) => {
    let orderCode = req.query.orderCode;
    res.render("mall/wuliu", {title: "物流详情", orderCode: orderCode });
});

// 查看物流轨迹
router.get("/getDeliveryTracesList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let orderCode = req.query.orderCode;

    let opt = {
        method: "GET",
        url: target + "/shop/myOrder/admin/getDeliveryTracesList?deliveryCode=" + orderCode,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 小脉部商店选择售后类型
router.get("/actionType", (req, res, next) => {
    res.render("mall/actionType", {title: "选择售后类型",  });
});

// 小脉部商店申请退款退货
router.get("/refund", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let orderCode = req.query.orderCode;
    let payPrice = req.query.payPrice;
    let opt = {
        method: "GET",
        url: target + "/shop/reason/ordinary/reasonList?reasonType=1",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.render("mall/refund", {title: "申请退款退货", orderCode: orderCode, payPrice: payPrice, reasonList: JSON.stringify(JSON.parse(body).data) });
    });
    
});

// 小脉部商家修改退款申请
router.get("/editRefund", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let refundCode = req.query.refundCode;
    let opt = {
        method: "GET",
        url: target + "/shop/reason/ordinary/reasonList?reasonType=1",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.render("mall/editRefund", {title: "修改申请退款退货", refundCode: refundCode, reasonList: JSON.stringify(JSON.parse(body).data)});
    });
});

// 获取订单操作原因
router.get("/getReasonList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/reason/ordinary/reasonList",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 用户退款申请
router.post("/refundSubmit", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    console.log(data);
    let opt = {
        method: "POST",
        url: target + "/shop/refund/admin/refundSubmit",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});

// 小脉部商店退款退货详情
router.get("/refundDetail", (req, res, next) => {
    let refundCode = req.query.refundCode;
    res.render("mall/refundDetail", {title: "退款详情", refundCode: refundCode });
});

router.get("/getRefundDetail", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let refundCode = req.query.refundCode;
    let opt = {
        method: "GET",
        url: target + "/shop/refund/admin/refundDetail?refundCode=" + refundCode,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 小脉部商店退款退货详情
router.get("/refundDetail2", (req, res, next) => {
    res.render("mall/refundDetail2", {title: "退款详情",  });
});

// 小脉部商店退款/售后
router.get("/refundList", (req, res, next) => {
    res.render("mall/refundList", {title: "退款/售后",  });
});

// 用户退款申请列表
router.post("/getRefundList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/refund/admin/refundList",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});

// 小脉部商店退款退货凭证照片
router.get("/refundImgDetail", (req, res, next) => {
    let photoFiles = req.query.photoFiles.split(",");
    res.render("mall/refundImgDetail", {title: "凭证照片", photoFiles: photoFiles });
});

// 用户修改退款申请
router.post("/refundApplyUpdate", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/refund/admin/refundApplyUpdate",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});

// 用户取消退款申请
router.get("/refundCancel", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let refundCode = req.query.refundCode;
    let opt = {
        method: "GET",
        url: target + "/shop/refund/admin/refundCancel?refundCode=" + refundCode,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 用户删除退款申请
router.get("/refundDelete", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let refundCode = req.query.refundCode;
    let opt = {
        method: "GET",
        url: target + "/shop/refund/admin/refundDelete?refundCode=" + refundCode,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 取消订单
router.post("/cancelOrder", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/myOrder/admin/cancelOrder",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});

// 删除订单
router.get("/delOrder", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let orderCode = req.query.orderCode;
    let opt = {
        method: "GET",
        url: target + "/shop/myOrder/admin/delOrder?orderCode=" + orderCode,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 确认收货
router.get("/confirmReceive", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let orderCode = req.query.orderCode;
    let opt = {
        method: "GET",
        url: target + "/shop/myOrder/admin/confirmReceive?orderCode=" + orderCode,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(JSON.parse(body));
    });
});

// 小脉部自提联系人
router.get("/extractPhone", (req, res, next) => {
    res.render("mall/extractPhone", {title: "自提联系人"});
});

// 小脉部开具发票
router.get("/invoice/:id", (req, res, next) => {
    let id = req.params.id;
    res.render("mall/invoice", {title: "开具发票", id: id});
});

// 获取发票列表
router.get("/getInvoiceList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let pageIndex = req.query.pageIndex;
    let pageSize = req.query.pageSize;
    let opt = {
        method: "GET",
        url: target + "/shop/myInvoice/admin/invoiceList?pageIndex=" + pageIndex + "&pageSize=" + pageSize,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    });
});

// 小脉部发票抬头
router.get("/invoiceHead", (req, res, next) => {
    let invoiceId = "";
    if(req.query.invoiceId) {
        invoiceId = req.query.invoiceId;
    }
    res.render("mall/invoiceHead", {title: "发票抬头", invoiceId: invoiceId});
});

// 添加发票
router.post("/addInvoice", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/myInvoice/admin/invoiceAdd",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});

// 修改发票
router.post("/invoiceUpdate", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/myInvoice/admin/invoiceUpdate",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});

// 获取购物车中的数量
router.get("/getShopCartGoodsNum", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shopId = req.query.shopId;
    let opt = {
        method: "GET",
        url: target + "/shop/cart/admin/getShopCartGoodsNum?shopId=" + shopId,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    });
});

module.exports = router;
