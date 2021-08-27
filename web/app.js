//引入express模块
const express = require("express");

//引入sha1模块
const sha1 = require("sha1");

//创建app应用对象
const app = express();

//验证服务器的有效性
/*
	1. 微信服务器需要知道开发者服务器是哪一个？
		- 在测试号管理页面上填写URL开发者服务器地址
			- 使用ngrok内网穿透 将本地端口号开启的服务映射外网跨域访问一个地址
			- ngrok http 3000
		- 填写token
			- 参与微信签名加密的一个参数
	2. 开发者服务器 - 验证消息是否来自于微信服务器
		目的：计算得出signature微信加密签名，和微信传递过来的signature进行对比，如果一样，说明来自于微信服务器。
		1. 将参与微信加密签名的三个参数（timestamp、nonce、token）组合在一起，按照字典序排序并组合在一起形成数组
		2. 将数组里参数拼接成一个字符串，进行sha1加密
		3. 加密完成后就生成了一个signature，和微信返回的signature进行对比。
			如果一样，说明来自于微信服务器，返回echostr给微信服务器
			如果不一样，说明不是微信服务器发送的消息，返回error
*/
//定义配置对象
const config = {
	token:"Intel",
	appID:"wx12287113c07d18c5",
	appsecret:"9257b3bd553d3d80fb2ba5be95ab88f2"
}

//接受处理所有消息
app.use((req,res,next) => {
	//微信服务器提交的参数
	console.log(req.query);
	/*
{
  signature: '80f60e28bf0f51d6ce6c4920ae2ee98233db9eac',
  echostr: '4215018354222562271',
  timestamp: '1629879191',
  nonce: '1963263783'
}
	*/
	
	const { signature, echostr, timestamp, nonce } = req.query;
	const { token } = config;
	
	//1. 将参与微信加密签名的三个参数（timestamp、nonce、token）按照字典序排序并组合在一起形成一个数组
	const arr = [timestamp,nonce,token];
	const arrSort = arr.sort();
	console.log(arrSort);
	//2. 将数组里参数拼接成一个字符串，进行sha1加密
	const str = arr.join('');
	console.log(str);
	const sha1Str = sha1(str);
	console.log(sha1Str);
	//3. 加密完成后就生成了一个signature，和微信返回的signature进行对比。
	if (sha1Str === signature){
		//如果一样，说明来自于微信服务器，返回echostr给微信服务器
		res.send(echostr);
	}else{
		//如果不一样，说明不是微信服务器发送的消息，返回error
		res.send('error');
	}

})

//监听端口号
app.listen(3000, () => console.log("服务器启动成功了~"));