/*
    验证服务器有效性模块
*/
//引入sha1模块
const sha1 = require("sha1");

//引入config模块
const config = require("../config");

//引入tool模块
const {getUserDataAsync,parseXMLAsync,formatMessage} = require("../utils/tool");

//引入template模块
const template = require('./template');


//引入reply模块
const reply = require('./reply');


module.exports = () => {

    return async (req,res,next) => {
        //微信服务器提交的参数
        //console.log(req.query);
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
        
        // //1. 将参与微信加密签名的三个参数（timestamp、nonce、token）按照字典序排序并组合在一起形成一个数组
        // const arr = [timestamp,nonce,token];
        // const arrSort = arr.sort();
        // console.log(arrSort);
        // //2. 将数组里参数拼接成一个字符串，进行sha1加密
        // const str = arr.join('');
        // console.log(str);
        // const sha1Str = sha1(str);
        // console.log(sha1Str);

        const sha1Str = sha1([timestamp,nonce,token].sort().join(''));

        /*
        微信服务器会发送两种类型的消息给开发者服务器
            1、GET请求
                - 验证服务器的有效性
            2、POST请求
                - 微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
        */
       if (req.method === 'GET') {
            //3. 加密完成后就生成了一个signature，和微信返回的signature进行对比。
            if (sha1Str === signature){
                //如果一样，说明来自于微信服务器，返回echostr给微信服务器
                res.send(echostr);
            }else{
                //如果不一样，说明不是微信服务器发送的消息，返回error
                res.send('error');
            }
           
       }else if (req.method === 'POST') {
           //微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
           //验证消息来自于微信服务器
           if (sha1Str !== signature) {
            res.send('error');
           }
           //console.log(req.query);
           /*
             signature: 'd770b884ada3f497d9b331f00bbba850ef6995d6',
             timestamp: '1630069479',
             nonce: '50325764',
             openid: 'oeOkY67ADTrjsZKJ4NTkrak859O4'
           */
          //接受请求体中的数据，流式数据
          const xmlData = await getUserDataAsync(req);
          //console.log(xmlData)
          /**
           <xml><ToUserName><![CDATA[gh_e8406e0950a8]]></ToUserName>    //发送给：开发者ID
            <FromUserName><![CDATA[oeOkY67ADTrjsZKJ4NTkrak859O4]]></FromUserName>     //用户OpenID
            <CreateTime>1630071304</CreateTime>    //发送的时间戳
            <MsgType><![CDATA[text]]></MsgType>     //发送消息类型
            <Content><![CDATA[QQ]]></Content>       //发送的内容
            <MsgId>23337013937059886</MsgId>        // 消息ID,微信服务器会默认保存3天用户发送的数据，通过此ID三天内能找到消息数据，三天后会被销毁；
            </xml>
           */
          //将xml数据解析为js对象
          const jsData = await parseXMLAsync(xmlData);
          //console.log(jsData);
          /**
           {
            xml: {
                ToUserName: [ 'gh_e8406e0950a8' ],
                FromUserName: [ 'oeOkY67ADTrjsZKJ4NTkrak859O4' ],
                CreateTime: [ '1630074625' ],
                MsgType: [ 'text' ],
                Content: [ 'asd' ],
                MsgId: [ '23337059078832803' ]
            }
            }
           */
          //格式化数据
          const message = formatMessage(jsData);
          console.log(message);
          /**
           * {
            ToUserName: 'gh_e8406e0950a8',
            FromUserName: 'oeOkY67ADTrjsZKJ4NTkrak859O4',
            CreateTime: '1630075867',
            MsgType: 'text',
            Content: '111',
            MsgId: '23337077089143664'
            }
           */
          //简单的自动回复，回复文本内容；
          /**
           * 一旦遇到以下情况，微信都会在公众号会话中，向用户下发系统提示“该公众号暂时无法提供服务，请稍后再试”：
           * 1、开发者在5秒内未回复任何内容 
           * 2、开发者回复了异常数据，比如JSON数据、字符串、xml数据中有多余的空格 等
           */

          const options = reply(message);

          //最终回复用户的消息
        //   let replyMessage = `<xml>
        //   <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
        //   <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
        //   <CreateTime>${Date.now()}</CreateTime>
        //   <MsgType><![CDATA[text]]></MsgType>
        //   <Content><![CDATA[${content}]]></Content>
        // </xml>`

        const replyMessage = template(options);
        //console.log(options);

        //返回响应给微信服务器；
        res.send(replyMessage);


        //   //如果开发者服务器没有返回响应给微信服务器，微信服务器会发送三次请求过来。
        //   res.end('');

       }else{
            res.send('error');
       }
    
    }
}