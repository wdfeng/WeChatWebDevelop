//引入express模块
const express = require("express");
const port = 3333;

//引入auth模块
const auth = require("./wechat/auth");

//创建app应用对象
const app = express();

//接受处理所有消息
app.use('/signature',auth());

app.get('/',(req,res,next) => {
    res.send(`Hi!,${port}`);

});


//监听端口号
app.listen(port, () => console.log(`服务器${port}启动成功了~`));
