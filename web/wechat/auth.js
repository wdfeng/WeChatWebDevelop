/*
    验证服务器有效性模块
*/
//引入sha1模块
const sha1 = require("sha1");

//引入config模块
const config = require("../config")

module.exports = () => {

    return (req,res,next) => {
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
    
    }
}