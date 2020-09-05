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

// 我的生意
router.get("/index", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/applyShop/admin/myBusiness",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        res.render("shop/index", {
            title: "我的生意",
            information: JSON.parse(body).data
        });
    })
    
});


// ----------- 创建商品模块 start -----------

// 创建商品
router.get("/goods/createGoods", (req, res, next) => {
    // 商品 商品操作
    // 商品模板的添加
    // /shop/goods/admin/addGoods
    res.render("shop/goods/createGoods", {title: "创建商品"});
});

// 创建商品设置主图
router.get("/goods/setPic", (req, res, next) => {
    res.render("shop/goods/setPic", {title: "主图设置", });
});

// 创建商品选择商品类目
router.get("/goods/setCategory", (req, res, next) => {
    // 商品 商品分类
    // 分级获取商品分类
    // /shop/category/ordinary/getGoodsCategory
    // 关键词查询商品分类
    // /shop/category/ordinary/getGoodsCategorySearchList
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/category/ordinary/getGoodsCategory?level=1",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.render("shop/goods/setCategory", {
            title: "选择类目",
            list: JSON.parse(response.body).data,
            information: JSON.stringify(JSON.parse(response.body).data)
        });
    })
    
});

router.get("/goods/setCategory/:level/:categoryId", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + `/shop/category/ordinary/getGoodsCategory?level=${req.params.level}&categoryId=${req.params.categoryId}`,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        if(req.params.level == 2) {
            res.json(JSON.parse(response.body).data);
        }
        if(req.params.level == 3) {
            res.json(JSON.parse(response.body).data);
        }
    })
});

// 商品模板的添加
router.post("/goods/addGoods", (req, res, next) => {
    let data = req.body;
    console.log(data);
    let userInfo = req.session.userInfo;
    let opt = {
        method: "POST",
        url: target + "/shop/goods/admin/addGoods",
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

// 添加模板商品到商店
router.post("/goods/addShopGoods", (req, res, next) => {
    let data = req.body;
    console.log(data);
    let userInfo = req.session.userInfo;
    let opt = {
        method: "POST",
        url: target + "/shop/shopGoods/admin/addShopGoods",
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


// 关键词查询商品分类
router.get("/goods/getSearchList", (req, res, next) => {
    console.log(req.query);
    let userInfo = req.session.userInfo;
    let cateName = req.query.cateName;
    let opt = {
        method: "GET",
        url: target + "/shop/category/ordinary/getGoodsCategorySearchList?cateName="+ encodeURI(cateName),
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(response.body).data);
    })
    
})

// 创建商品商品规格
router.get("/goods/setInfo/:categoryId", (req, res, next) => {
    // 商品 商品属性
    // 获取分类属性（创建单品时）
    // /shop//cateAttr/ordinary/getCateAttributeList
    // 获取商品属性（修改商品属性）
    // /shop/goodsAttr/ordinary/getGoodsAttributeWithValue
    let userInfo = req.session.userInfo;
    let categoryId = req.params.categoryId;
    let opt = {
        method: "GET",
        url: target + `/shop/cateAttr/ordinary/getCateAttributeList?categoryId=${categoryId}&isNeedValues=1`,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        // console.log(body);
        let data = JSON.parse(response.body).data;
        let attrList = [];
        for(let i = 0; i<data.length; i++) {
            if(data[i].status == 1) {
                attrList.push({
                    id: data[i].id,
                    attrName: data[i].attrName,
                    categoryId: data[i].categoryId,
                    rank: 0,
                    searchVal: "",
                    isActive: false,
                    cateAttributeValueList: data[i].cateAttributeValueList
                });
            }
        }
        for(let i = 0; i<attrList.length; i++) {
            let cateAttributeValueList = attrList[i].cateAttributeValueList;
            if(cateAttributeValueList.length > 6) {
                attrList[i].unfold = true;
            }else {
                attrList[i].unfold = false;
            }
            for(let j = 0; j<cateAttributeValueList.length; j++) {
                cateAttributeValueList[j].isActive = false;
                cateAttributeValueList[j].isSelf = 0;
                
            }
        }
        res.render("shop/goods/setInfo", {title: "商品规格", information: JSON.stringify(attrList) });
    })
    
});



// 创建商品商品描述
router.get("/goods/setDesc", (req, res, next) => {
    res.render("shop/goods/setDesc", {title: "商品描述",  });
});



// 创建商品选择所属小脉部
router.get("/goods/selectShop/:goodsCode", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let goodsCode = req.params.goodsCode;
    // 查询商品可以放入哪些小脉部
    // shop/shelf/admin/getShelfListForGoods
    // 添加模板商品到商店
    // /shop/shopGoods/admin/addShopGoods
    let opt = {
        method: "GET",
        url: target + "/shop/shelf/admin/getShelfListForGoods?goodsCode=" + goodsCode,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.render("shop/goods/selectShop", {title: "选择所属小脉部", goodsCode, information: JSON.stringify(JSON.parse(body).data) });
    });
    
});

// 创建商品选择小脉部下分类
router.get("/goods/selectCategory/:shelfId", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shelfId = req.params.shelfId;
    let opt = {
        method: "GET",
        url: target + "/shop/shelfModel/ordinary/getShelfModelList?shelfId=" + shelfId,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.render("shop/goods/selectCategory", {title: "小脉部下分类", shelfId: shelfId, list: JSON.stringify(JSON.parse(body).data)});
    });
});

// 获取商品选择小脉部下分类
router.get("/goods/getSelectCategory", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shelfId = req.query.shelfId;
    let opt = {
        method: "GET",
        url: target + "/shop/shelfModel/ordinary/getShelfModelList?shelfId=" + shelfId,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        console.log(JSON.parse(body));
    });
});

// 添加模板商品到商店
router.post("/goods/addShopGoods", (req, res, next) => {
    console.log(req.body);
    // 添加模板商品到商店
    // /shop/shopGoods/admin/addShopGoods
    let data = req.body;
    let userInfo = req.session.userInfo;
    let opt = {
        method: "POST",
        url: target + "/shop/shopGoods/admin/addShopGoods",
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
})


// ----------- 创建商品模块 end -----------


// ----------- 商品管理模块 start -----------

// 商品管理
router.get("/goodsManage/index", (req, res, next) => {

    res.render("shop/goodsManage/index", {title: "商品管理" });
    // 获取商品模板列表
    // /shop/goods/admin/getGoodsList
    
});

// 获取商品模版列表
router.get("/goodsManage/getGoodList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let pageSize = req.query.pageSize;
    let pageIndex = req.query.pageIndex;
    let opt = {
        method: "GET",
        url: target + "/shop/goods/admin/getGoodsList?pageIndex=" + pageIndex + "&pageSize=" + pageSize,
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

// 管理小脉部商品
router.get("/goodsManage/list/:goodsCode", (req, res, next) => {
    let goodsCode = req.params.goodsCode;
    res.render("shop/goodsManage/list", {title: "管理小脉部商品", goodsCode: goodsCode});
});

// 获取商店商品管理列表
router.get("/goodsManage/getShopGoodsPageVos", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let goodsCode = req.query.goodsCode;
    let pageIndex = req.query.pageIndex;
    let pageSize = req.query.pageSize;
    let isOnline = req.query.isOnline;
    let opt = {
        method: "GET",
        url: target + "/shop/shopGoods/admin/getShopGoodsPageVos?pageIndex="+ pageIndex +"&pageSize="+ pageSize +"&isOnline=" +isOnline+ "&goodsCode=" + goodsCode + "&isNeedShopAndShelf=1",
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

// 商品管理 模版基础信息
router.get("/goodsManage/setBase/", (req, res, next) => {
    let goodsCode = req.query.goodsCode;
    let isOnline = req.query.isOnline;
    let isDelete = req.query.isDelete;
    res.render("shop/goodsManage/setBase", {title: "模版基础信息", goodsCode: goodsCode, isOnline: isOnline, isDelete: isDelete});
});

// 商品管理 商品描述
router.get("/goodsManage/setDesc", (req, res, next) => {
    let goodsCode = req.query.goodsCode;
    res.render("shop/goodsManage/setDesc", {title: "商品描述", goodsCode: goodsCode});
});

// 获取商品模板详情
router.get("/goodsManage/getGoodsVoDetail", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let goodsCode = req.query.goodsCode;
    let isNeedAttrs = req.query.isNeedAttrs;
    let isNeedSku = req.query.isNeedSku;
    let opt = {
        method: "GET",
        url: target + "/shop/goods/ordinary/getGoodsVoDetail?goodsCode=" + goodsCode + "&isNeedAttrs=" + isNeedAttrs + "&isNeedSku=" + isNeedSku,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        // console.log(body);
        res.json(body);
    })
});

// 获取商店商品详情
router.get("/goodsManage/getShopGoodsVoDetail", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let goodsCode = req.query.goodsCode;
    let shopId = req.query.shopId;
    let isNeedSku = req.query.isNeedSku;
    let opt = {
        method: "GET",
        url: target + "/shop/shopGoods/ordinary/getShopGoodsVoDetail?goodsCode=" + goodsCode + "&shopId=" + shopId + "&isNeedSku=" + isNeedSku + "&isNeedAttrs=1&isNeedGoodsMsg=1",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(body);
    })
});

// 更新店铺商品信息
router.post("/goodsManage/updateShopGoods", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/shopGoods/admin/updateShopGoods",
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

// 获取商品属性（修改商品属性）
router.get("/goodsManage/getGoodsAttributeWithValue", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let goodsCode = req.query.goodsCode;
    let isNeedAllCateAttrs = req.query.isNeedAllCateAttrs;
    let opt = {
        method: "GET",
        url: target + "/shop/goodsAttr/ordinary/getGoodsAttributeWithValue?goodsCode=" + goodsCode + "&isNeedAllCateAttrs=" + isNeedAllCateAttrs,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        // console.log(body);
        res.json(JSON.parse(body));
    })
});

// 查询模板单品列表
router.get("/goodsManage/goodsSku", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let goodsCode = req.query.goodsCode;
    let online = req.query.online;
    let opt = {
        method: "GET",
        url: target + "/shop/goodsSku/ordinary/getGoodsSkuVos?goodsCode=" + goodsCode + "&online=" + online,
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

// 商店商品模版信息
router.get("/goodsManage/setGoodsBase", (req, res, next) => {
    let shopId = req.query.shopId;
    let goodsCode = req.query.goodsCode;
    let isOnline = req.query.isOnline;
    res.render("shop/goodsManage/setGoodsBase", {title: "模版基础信息", shopId: shopId, goodsCode: goodsCode, isOnline: isOnline});
});

// 商品商品模版规格
router.get("/goodsManage/setGoodsInfo", (req, res, next) => {
    let shopId = req.query.shopId;
    let goodsCode = req.query.goodsCode;
    let online = req.query.online;
    res.render("shop/goodsManage/setGoodsInfo", {title: "模版规格", shopId: shopId, goodsCode: goodsCode, online: online});
});

// 获取商店单品列表
router.get("/goodsManage/goodsShopSku", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shopId = req.query.shopId;
    let goodsCode = req.query.goodsCode;
    let online = req.query.online;
    let opt = {
        method: "GET",
        url: target + "/shop/goodsShopSku/ordinary/getGoodsSkuVos?shopId=" + shopId + "&goodsCode=" + goodsCode + "&online=" + online,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    });
});

// 商品管理 模版规格
router.get("/goodsManage/setInfo", (req, res, next) => {
    let goodsCode = req.query.goodsCode;
    let online = req.query.online;
    res.render("shop/goodsManage/setInfo", {title: "模版规格", goodsCode: goodsCode, online: online});
});

// 更新模版信息
router.post("/goodsManage/updateGoods", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/goods/admin/updateGoods",
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

// 批量修改商店单品信息
router.post("/goodsManage/batchUpdateGoodsSku", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/goodsShopSku/admin/batchUpdateGoodsSku",
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

// ----------- 商品管理模块 end -----------


// ----------- 订单管理模块 start -----------

// 订单管理列表
router.get("/orderManage/orderList", (req, res, next) => {
    let type = req.query.type;
    res.render("shop/orderManage/orderList", {title: "订单管理", orderStatus: type});
});

// 获取订单列表
router.post("/orderManage/getOrderList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/sellerOrder/admin/sellerOrderList",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        console.log(JSON.stringify(body));
        res.json(JSON.parse(JSON.stringify(body)));
    })
});

// 获取订单状态信息
router.get("/myBusiness", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/applyShop/admin/myBusiness",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(JSON.stringify(body));
        res.json(JSON.parse(body));
    })
});

// 订单详情页面
router.get("/orderManage/orderDetail", (req, res, next) => {
    let orderCode = req.query.orderCode;
    res.render("shop/orderManage/orderDetail", {title: "订单详情", orderCode: orderCode });
});

// 获取订单详情
router.get("/orderManage/getOrderDetail", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let orderCode = req.query.orderCode;
    let opt = {
        method: "GET",
        url: target + "/shop/sellerOrder/admin/getDetail?orderCode=" + orderCode,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    })
});


// 批量添加和修改单品和属性
router.post("/addAndUpdateGoodsSku", (req, res, next) => {
    let data = req.body;
    let userInfo = req.session.userInfo;
    let opt = {
        method: "POST",
        url: target + "/shop/goodsSku/admin/addAndUpdateGoodsSku",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data,
    }
    request(opt, (error, response, body) => {
        console.log(body,'-----')
        res.json(body);
    });
});


// 发货
router.get("/orderManage/deliver", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let orderCode = req.query.orderCode;
    let opt = {
        method: "GET",
        url: target + "/shop/sellerOrder/admin/getOrderDeliveryType?orderCode=" + orderCode,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        console.log(JSON.stringify(JSON.parse(body).data));
        res.render("shop/orderManage/deliver", {title: "发货", orderCode: orderCode, deliveryList: JSON.stringify(JSON.parse(body).data)});
    });
    
});

// 商家发货
router.post("/orderManage/addOrderDelivery", (req, res, next) => {
    let data = req.body;
    let userInfo = req.session.userInfo;
    let opt = {
        method: "POST",
        url: target + "/shop/sellerOrder/admin/addOrderDelivery",
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

// 商家取消订单
router.post("/orderManage/cancelOrder", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/sellerOrder/admin/cancelOrder",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.json(body);
    });
});

// 商家备注订单
router.post("/orderManage/accountRemark", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = { 
        method: "POST",
        url: target + "/shop/sellerOrder/admin/accountRemark",
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

// 获取商家订单数量
router.get("/orderManage/getOrderCount", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shopId = req.query.shopId;
    let opt = {
        method: "GET",
        url: target + "/shop/sellerOrder/admin/orderCount?shopId=" + shopId,
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

// 获取商家发货商品列表
router.get("/orderManage/getOrderDetailList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let orderCode = req.query.orderCode;
    let opt = {
        method: "GET",
        url: target + "/shop/sellerOrder/admin/getOrderDetailList?orderCode=" + orderCode,
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

// 合作物流
router.get("/orderManage/cooperativeWuliu", (req, res, next) => {
    res.render("shop/orderManage/cooperativeWuliu", {title: "合作物流",});
});

// 物流选择
router.get("/orderManage/selectWuliu", (req, res, next) => {
    res.render("shop/orderManage/selectWuliu", {title: "物流选择",});
});

// 获取物流公司
router.get("/getDeliveryCompany", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/deliveryCompany/ordinary/getDeliveryCompany",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    });
});

// 退款/售后
router.get("/orderManage/refundList", (req, res, next) => {
    let type = req.query.type || 101;
    res.render("shop/orderManage/refundList", {title: "退款/售后", type: type});
});

// 商家退款申请列表
router.post("/orderManage/getRefundList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/sellerRefund/admin/refundList",
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

// 退款/售后详情
router.get("/orderManage/refundDetail", (req, res, next) => {
    let refundCode = req.query.refundCode;
    res.render("shop/orderManage/refundDetail", {title: "退款/售后详情", refundCode: refundCode});
});

// 商家退款申请详情
router.get("/orderManage/getRefundDetail", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let refundCode = req.query.refundCode;
    let opt = {
        method: "GET",
        url: target + "/shop/sellerRefund/admin/refundDetail?refundCode=" + refundCode,
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

// 商家批量修改退款申请状态
router.post("/orderManage/refundUpdate", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/sellerRefund/admin/refundUpdate",
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


// ----------- 订单管理模块 end -----------


// ----------- 我的小脉部模块 start -----------


// 我的小脉部
router.get("/shopList/index", (req, res, next) => {
    let shopStatus=req.query.type
    res.render("shop/shopList/index", {title: "我的小脉部", shopStatus:shopStatus });
});

// 查询我的小脉部(已开通)
// 
router.get("/shopList/getShopWithData", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/applyShop/admin/getShopWithData",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body)
        res.json(JSON.parse(body));
    })
});

// 查询我的小脉部(已开通 1,审核中0)(带分类数,商品数)
router.get("/shopList/getShopList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let status=req.query.status
    let opt = {
        method: "GET",
        url: target + "/shop/applyShop/admin/getShop?status=" + status,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body)
        res.json(JSON.parse(body));
    })
});

// 查看可申请小脉部
router.get("/shopList/getOrganShop", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/applyShop/admin/getOrganShop",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    })
});

// 查询未达标的商店
router.get("/shopList/getUnFinishedOrgan", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/applyShop/admin/getUnFinishedOrgan",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    })
});


// 店铺设置
router.get("/shopList/setShop/:shopId", (req, res, next) => {
    res.render("shop/shopList/setShop", {title: "店铺设置", shopId: req.params.shopId });
});

// 查询我的小脉部(已开通)(带分类数,商品数)
router.get("/shopList/getShelfIndex", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shopId = req.query.shopId;
    let opt = {
        method: "GET",
        url: target + "/shop/shelf/ordinary/getShelfIndex?shopId=" + shopId + "&isNeedHead=false",
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

// 添加分类
router.get("/shopList/addClassify", (req, res, next) => {
    let shopId = req.query.shopId;
    let shelfId = req.query.shelfId;
    res.render("shop/shopList/addClassify", {title: "添加分类", shopId, shelfId });
});

// 添加分类
router.post("/shopList/addClassify", (req, res, next) => {
    // 添加货架分类
    // /shop/shelfModel/admin/addShelfModel
    let data = req.body;
    let userInfo = req.session.userInfo;
    let opt = {
        method: "POST",
        url: target + "/shop/shelfModel/admin/addShelfModel",
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

// 编辑本分类
router.get("/shopList/editClassify", (req, res, next) => {
    let id = req.query.id;
    let shopId = req.query.shopId;
    let shelfId = req.query.shelfId;
    let modelName = req.query.modelName;
    let sort = req.query.sort;
    // 修改(删除)某个分类
    // shop/shelfModel/admin/updateShelfModel
    res.render("shop/shopList/editClassify", {title: "编辑本分类", id, shopId, shelfId, modelName, sort });
});

// 编辑本分类
router.post("/shopList/editClassify", (req, res, next) => {
    // 修改(删除)某个分类
    // shop/shelfModel/admin/updateShelfModel
    let data = req.body;
    let userInfo = req.session.userInfo;
    let opt = {
        method: "POST",
        url: target + "/shop/shelfModel/admin/updateShelfModel",
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

// 货架分类下的商品
router.get("/shopList/getShelfModelWithGoods", (req, res, next) => {
    // 货架分类下的商品
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

// 货架详情里面的商家信息
router.get("/shopList/getShelfDetail", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shelfId = req.query.shelfId;
    console.log(req.query);
    // 小脉部首页
    // /shop/shelf/ordinary/getShelfIndex
    // 货架详情里面的商家信息
    // /shop/shelf/ordinary/getShelfDetail
    let opt = {
        method: "GET",
        url: target + "/shop/shelf/ordinary/getShelfDetail?shelfId=" + shelfId + "&needMemberAndOrgan=1",
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    })
    
});

// 修改货架信息
router.post("/shopList/updateShelf", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/shelf/admin/updateShelf",
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

// 修改商品到货架分类
router.post("/shopList/updateShelfModelGoods", (req, res, next)=> {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/shelfModelGoods/admin/updateShelfModelGoods",
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

// 关联商品
router.get("/shopList/relevance", (req, res, next) => {
    console.log(req.query);
    // 获取货架分类可添加商品列表
    // /shop/shelfModelGoods/admin/getShelfModelAccessAddGoods
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/shelfModelGoods/admin/getShelfModelAccessAddGoods?shopId=" + req.query.shopId + "&shelfId=" + req.query.shelfId + "&shelfModelId=" + req.query.shelfModelId,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        console.log(body);
        // console.log(JSON.stringify(JSON.parse(body).data));
        res.render("shop/shopList/relevance", {title: "关联商品", information: JSON.stringify(JSON.parse(body).data), shopId: req.query.shopId, shelfId: req.query.shelfId, shelfModelId: req.query.shelfModelId });
    });
    
});

// 获取可以关联的商品
router.get("/shopList/getRelevance", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let opt = {
        method: "GET",
        url: target + "/shop/shelfModelGoods/admin/getShelfModelAccessAddGoods?shopId=" + req.query.shopId + "&shelfId=" + req.query.shelfId + "&shelfModelId=" + req.query.shelfModelId,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    request(opt, (error, response, body) => {
        res.json(JSON.parse(body));
    });
});

// 关联商品
// 添加商品到货架分类
router.post("/shopList/addBatchShelfModelGoods", (req, res, next) => {
    // 添加商品到货架分类
    // /shop/shelfModelGoods/admin/addBatchShelfModelGoods
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/shelfModelGoods/admin/addBatchShelfModelGoods",
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

// 地址和联系电话
router.get("/shopList/setContact", (req, res, next) => {
    let shopId = req.query.shopId;
    res.render("shop/shopList/setContact", {title: "地址和联系电话", shopId:shopId  });
});

// 发货方式
router.get("/shopList/deliveryType", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shelfId = req.query.shelfId;
    let postFee = req.query.postFee || 0;
    let deliveryType = req.query.deliveryType || "1";
    let opt = {
        method: "GET",
        url: target + "/shop/shelf/ordinary/getAllDeliveryTypeDesc?shelfId=" + shelfId,
        headers: {
            from: from,
            memberId: userInfo.memberId
        }
    }
    console.log(opt);
    request(opt, (error, response, body) => {
        console.log(body);
        res.render("shop/shopList/deliveryType", {title: "发货方式", information: JSON.stringify(JSON.parse(body).data), shelfId, postFee, deliveryType});
    });
    
});

// 自提地址
router.get("/shopList/setExtract/:shelfId", (req, res, next) => {
    // 自提、退货地址列表
    // /shop/pickAddress/ordinary/pickAddressList
    let shelfId = req.params.shelfId;
    res.render("shop/shopList/setExtract", {title: "自提地址", shelfId });
});

router.get("/shopList/getExtract", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shelfId = req.query.shelfId;
    let data = {
        addressType: 1,
        isDefault: 0,
        nowLng: "",
        nowLat: "",
        shelfId: shelfId,
        pageIndex: 1,
        pageSize: 20
    };
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

// 添加/编辑自提地址
router.get("/shopList/editExtract", (req, res, next) => {
    let data = req.query.data;
    let type = JSON.parse(req.query.data).type;
    let url;
    if(type == "add") {
        url = "addPickAddress"
    }
    if(type == "update") {
        url = "updatePickAddress"
    }
    console.log(data);
    // 增加自提点信息
    // /shop/pickAddress/admin/addPickAddress
    // 更新自提点内容
    // /shop/pickAddress/admin/updatePickAddress
    // 删除某个自提地址
    // /shop/pickAddress/admin/delPickAddress
    // 查询某个地址
    // /shop/pickAddress/ordinary/pickAddressDetail
    res.render("shop/shopList/editExtract", {title: "自提地址", data: data, url: url });
});

// 增加自提点信息
router.post("/shopList/addPickAddress", (req, res, next) => {
    let data = req.body;
    let userInfo = req.session.userInfo;
    let opt = {
        method: "POST",
        url: target + "/shop/pickAddress/admin/addPickAddress",
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

// 更新自提点/退货地址内容
router.post("/shopList/updatePickAddress", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/pickAddress/admin/updatePickAddress",
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

// 删除某个自提地址
router.get("/shopList/delPickAddress", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let id = req.query.id;
    let opt = {
        method: "GET",
        url: target + "/shop/pickAddress/admin/delPickAddress?id=" + id,
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

// 查询自提点数量
router.get("/shopList/getPickAddressCount", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let shelfId = req.query.shelfId;
    let opt = {
        method: "GET",
        url: target + "/shop/pickAddress/ordinary/getPickAddressCount?shelfId=" + shelfId,
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

// 选择省市区
router.get("/shopList/selectArea", (req, res, next) => {
    let provinceList = [];
    for(let i = 0; i<addressData.length; i++) {
        provinceList.push({
            id: addressData[i].id,
            adcode: addressData[i].provinceID,
            label: addressData[i].province,
        })
    }
    res.render("shop/shopList/selectArea", {title: "选择定位", type: "isProvince", provinceList: JSON.stringify(provinceList)});
});

// 获取城市
router.get("/shopList/getCityData/:provinceIndex", (req, res, next) => {
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
router.get("/shopList/getAreaData/:provinceIndex/:cityIndex", (req, res, next) => {
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

// 退货地址
router.get("/shopList/refundAddress/:shelfId", (req, res, next) => {
    // 自提、退货地址列表
    // /shop/pickAddress/ordinary/pickAddressList
    let userInfo = req.session.userInfo;
    let shelfId = req.params.shelfId;
    let data = {
        addressType: 2,
        isDefault: 0,
        nowLng: "",
        nowLat: "",
        shelfId: shelfId,
        pageIndex: 1,
        pageSize: 20
    };
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
        if(!body.data) {
            res.render("shop/shopList/refundAddress", {title: "退货地址",
                type: "addPickAddress",
                id: "",
                shelfId: body.shelfId,
                address: "",
                province: "",
                provinceCode: "",
                city: "",
                cityCode: "",
                area: "",
                areaCode: "",
                telephone: "",
                url: "/shop/shopList/addPickAddress"
            });
        }else {
            res.render("shop/shopList/refundAddress", {title: "退货地址",
                id: body.data.list[0].id,
                type: "updatePickAddress",
                shelfId: body.data.list[0].shelfId,
                address: body.data.list[0].address,
                province: body.data.list[0].province,
                provinceCode: body.data.list[0].provinceCode,
                city: body.data.list[0].city,
                cityCode: body.data.list[0].cityCode,
                area: body.data.list[0].area,
                areaCode: body.data.list[0].areaCode,
                telephone: body.data.list[0].telephone,
                url: "/shop/shopList/updatePickAddress"
            });
        }
        
    });
});

// 营业时间
router.get("/shopList/openingHours", (req, res, next) => {
    let openTime = req.query.openTime || "";
    res.render("shop/shopList/openingHours", {title: "营业时间",  openTime });
});

// 公告
router.get("/shopList/setNotice", (req, res, next) => {
    let setNotice = req.query.notice || "";
    res.render("shop/shopList/setNotice", {title: "商家服务", setNotice: setNotice });
});

// 商家服务
router.get("/shopList/setServe/:isIssuedInvoice", (req, res, next) => {
    let isIssuedInvoice = req.params.isIssuedInvoice;
    res.render("shop/shopList/setServe", {title: "商家服务", isIssuedInvoice });
});

// 地图页面
router.get("/shopList/location/:location/:type", (req, res, next) => {
    res.render("shop/shopList/location", {title: "选择定位", location: req.params.location, type: req.params.type });
});

// ----------- 我的小脉部模块 end -----------


// ----------- 推广 start -----------
// 商品返佣
router.get("/goodsSpread", (req, res, next) => {
    res.render("shop/goodsSpread", {title: "商品返佣",});
});

// 用户返利列表
router.post("/myRebateList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/myRebate/admin/myRebateList",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data
    }
    request(opt, (error, response, body) => {
        res.json(body);
    });
});

// 用户返利统计
router.post("/refundCount", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/myRebate/admin/refundCount",
        headers: {
            from: from,
            memberId: userInfo.memberId
        },
        json: true,
        body: data
    }
    request(opt, (error, response, body) => {
        res.json(body);
    });
});

// 推广
router.get("/spread", (req, res, next) => {
    let type = req.query.type || 0;
    res.render("shop/spread", {title: "推广效果", type: type});
});

// 商家推广列表
router.post("/getRebateList", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/sellerRebate/admin/rebateList",
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

// 商家推广统计
router.post("/getMerchantRefundCount", (req, res, next) => {
    let userInfo = req.session.userInfo;
    let data = req.body;
    let opt = {
        method: "POST",
        url: target + "/shop/sellerRebate/admin/refundCount",
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
// ----------- 推广 end -----------


module.exports = router;
