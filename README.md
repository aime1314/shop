# 项目结构
    |——— app.js  #入口文件
    |----- temp  临时目录
            |----log  日志/天
    |---- views   #渲染ejs模板
    |---- routes  #路由控制   ***XXX*** 表示模板,对应views目录;backJSON:返回JSON
            |(request)URL ==(映射到)==> routes ==(映射到)==> 控制器 ==(解析到)==> ***模板*** ====>(response)
            |----/   "/"  根目录  http://127.0.0.1:3000/
            |----/users (有session 验证) =>用户操作
            |     |-----/index?memberId=1  (GET:用户详情)  http://127.0.0.1:3000/users/index?memberId=XXX  ***user.ejs***
            |     |-----/userList?organId=1 (GET:社群用户列表)http://127.0.0.1:3000/users/userList?organId=XXX ***users.ejs***
            |     |-----/wap/getyzCode    (GET:验证码)http://127.0.0.1:3000/users/wap/getyzCode     =>backJSON
            |     |-----/wap/register     (POST:注册)http://127.0.0.1:3000/users/wap/register       =>backJSON
            |     |-----/addOrgan?organId=XXX   (GET:小程序点击加入社群发送通知) http://127.0.0.1:3000/users/addOrgan?organId=XXX  =>backJSON 
            |----/share  加密串=>(写入session) => 分享操作
                  |-----/personalPage  (GET:个人分享)http://127.0.0.1:3000/share/personalPage?shareInfo=XXX&iv=XXX    ***share.ejs***
                  |-----/organPage     (GET:社群分享)http://127.0.0.1:3000/share/organPage?shareInfo=XXX&iv=XXX       ***organ.ejs***
                  |---- /activityPage  (GET:社群分享)http://127.0.0.1:3000/share/activityPage?shareInfo=XXX&iv=XXX    ***activity.ejs***

## vscode 安装
```
vscode 下载地址
https://code.visualstudio.com/

插件
Chinese (Simplified) Language Pack for Visual Studio Code
ESlint

```

## npm和nodejs安装
```
nodejs 下载地址
http://nodejs.cn/

nodejs和npm安装步骤
https://jingyan.baidu.com/article/48b37f8dd141b41a646488bc.html


nodejs版本查看
node -v

npm版本查看
npm -v

```

## 安装项目依赖
```
npm install
```

## 安装nodemon
```
npm install nodemon -g
```

## 启动项目
```
nodemon bin/www
```

## 访问项目
```
http://localhost:65503/
http://localhost:65503/shop/index
http://localhost:65503/shop/goods/createGoods
http://localhost:65503/shop/setPic
http://localhost:65503/mall/index
http://localhost:65503/mall/info
```




## 目录结构

```
project
├── routes
│     ├── applyShop       // 小脉部申请路由
│     ├── shop            // 我的生意路由
│     └── mall            // 小脉部商品展示和下单路由
|
├── views
│     ├── applyShop       // 小脉部申请页面
│           ├── index                   // 开通小脉部
│           ├── clist                   // 我的小脉部列表
│           ├── regform                 // 小脉部申请
│           ├── selectArea              // 选择省市区
│           ├── location                // 选择定位
│           └── status                  // 审核结果
│     ├── shop            // 我的生意页面
│           ├── index                   // 我的生意
│           ├── goodsSpread             // 商品返佣
│           ├── spread                  // 推广效果
│           ├── goods                   // 创建商品模块
│                   ├── createGoods             // 创建商品页面
│                   ├── setPic                  // 设置/编辑主图
│                   ├── setCategory             // 选择商品类目
│                   ├── setInfo                 // 设置商品规格
│                   ├── setDesc                 // 商品描述
│                   ├── selectShop              // 选择所属小脉部
│                   └── selectCategory          // 选择小脉部下分类
│           ├── goodsManage             // 商品管理模块
│                   ├── index                   // 小脉部列表
│                   ├── list                    // 管理小脉部商品
│                   └── setInfo                 // 设置商品规格
│           ├── orderManage             // 订单管理模块
│                   ├── orderList               // 订单管理列表     
│                   ├── deliver                 // 发货
│                   ├── selectWuliu             // 物流选择
│                   ├── refundList              // 退款/售后
│                   └── refundDetail            // 退款/售后详情
│           └── shopList                // 我的小脉部列表
│                   ├── index                   // 小脉部列表
│                   ├── setShop                 // 店铺设置                     
│                   ├── addClassify             // 添加分类
│                   ├── editClassify            // 编辑本分类
│                   ├── relevance               // 关联商品
│                   ├── setContact              // 地址和联系电话
│                   ├── deliveryType            // 发货方式
│                   ├── setExtract              // 自提地址
│                   ├── editExtract             // 添加/编辑自提地址
│                   ├── refundAddress           // 退货地址
│                   ├── openingHours            // 营业时间
│                   ├── setNotice               // 公告
│                   └── setServe                // 商家服务
│     └── mall            // 小脉部商品展示和下单页面
│           ├── index                   // 小脉部店铺首页
│           ├── map                     // 商店地图
│           ├── info                    // 商家环境
│           ├── infos                   // 商家资质
│           ├── detail                  // 商品详情
│           ├── cart                    // 购物车
│           ├── payOrder                // 确认订单
│           ├── address                 // 地址列表
│           ├── editAddress             // 添加/修改地址
│           ├── extract                 // 自提地址列表
│           ├── pay                     // 支付
│           ├── topUp                   // 充值
│           ├── status                  // 支付状态
│           ├── invoice                 // 开具发票
│           ├── invoiceHead             // 发票抬头
│           ├── orderList               // 本店订单列表
│           ├── orderDetail             // 本店订单详情
│           ├── wuliu                   // 物流详情
│           ├── actionType              // 选择售后类型
│           ├── refund                  // 申请退款退货
│           ├── refundList              // 退款/售后
│           ├── refundImgDetail         // 凭证照片
│           └── refundDetail            // 退款退货详情
|
└── README.md              // 项目说明
```