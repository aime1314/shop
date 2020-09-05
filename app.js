global.createError = require("http-errors");
var express = require("express");
// 引入路径path用于处理目录路径
var path = require("path");
var fs = require("fs"); //文件处理包
//自定义中间件
const qm = require("./bin/core");
//cookie包
var cookieParser = require("cookie-parser");
var session = require("express-session");
//morgan中间件记录日志
var logger = require("morgan");
logger.format("error", "[error] :method :url :status ");
//日志文件分割
var FileStreamRotator = require("file-stream-rotator");
const TEMP_PATH = path.join(__dirname, "temp");
fs.existsSync(TEMP_PATH) || fs.mkdirSync(TEMP_PATH);
var logDirectory = TEMP_PATH + path.sep + "log";
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
global.errorLogStream = FileStreamRotator.getStream({
  date_format: "YYYYMMDD",
  filename: path.join(logDirectory, "error-%DATE%.log"),
  frequency: "daily",
  verbose: false
});
global.LOGFUN = async opt => {
  let msg = opt.msg || " ";
  let errStr =
    Date.now() +
    " " +
    opt.status +
    " " +
    opt.month +
    " " +
    opt.url +
    "  " +
    msg +
    "\n";
  errorLogStream.write(errStr);
};
global.LOGLOG = async msg => {
  let errStr = Date.now() + " LOGLOG:  " + msg + "\n";
  errorLogStream.write(errStr);
};

// 引入路由
var indexRouter = require("./routes/index");
// var usersRouter = require('./routes/users');
var shareRouter = require("./routes/share");
var appCorrelationRouter = require("./routes/appCorrelation");
var cRoll = require("./routes/cRoll");
var login = require("./routes/login");
var api = require("./routes/api");
var chatRoom = require("./routes/chatRoom");
var applyShop = require("./routes/applyShop");
var mall = require("./routes/mall");
var shop = require("./routes/shop");

// 实例化express
var app = express();
// 设置代理
app.set("trust proxy", true);
app.use(qm.httpSysType());
// app.use(wx);
app.use(cookieParser("PHPSESSID_APP"));
app.use(
  session({
    secret: "12345",
    name: "PHPSESSID_APP",
    cookie: { maxAge: 86400000 },
    resave: false,
    saveUninitialized: true
  })
);
// 设置文件所在目录
app.set("views", path.join(__dirname, "views"));
// 设置ejs模版引擎
app.set("view engine", "ejs");
app.use(express.json({ limit: "10000kb" }));
app.use(express.urlencoded({ extended: false, limit: "10000kb" }));
// 托管静态文件
app.use(express.static(path.join(__dirname, "public")));

// 使用路由
let args = process.argv; // 生产环境配置
if (args[2] === "master") {
} else {
  app.use("/", indexRouter);
}
app.use("/share", shareRouter);
app.use("/appCorrelation", appCorrelationRouter);
app.use("/cRoll", cRoll);
app.use("/login", login);
app.use("/api", api);
app.use("/chatRoom", chatRoom);
let onlyApp = require("./routes/onlyApp");
app.use("/onlyapp", onlyApp);
let groupRouter = require("./routes/group");
app.use("/group", groupRouter);

app.use("/applyShop", applyShop);
app.use("/mall", mall);
app.use("/shop", shop);

app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // console.log("Error: ",err);
  // console.log("Error Log: ",err.status+" "+req.method+" "+req.url );
  LOGFUN({
    status: err.status || 500,
    msg: err.message,
    month: req.method,
    url: req.url
  });
  // res.status(err.status || 500);
  // res.send();
  let errMse = err.message ? err.message : "";
  res.render("appCorrelation/error", { errMessage: errMse });
});

module.exports = app;
