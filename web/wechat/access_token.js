/*
    获取access_token：
        微信接口全局唯一凭证；

    特点：
    1、唯一；
    2、有效期2小时，提前5分钟请求；
    3、接口权限，每天2000次

    请求的地址：
        https请求方式: GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
    请求方式：
        GET
    
    设计思路：
        1、首次本地没有，发送请求获取access_token，保存下来（本地文件）
        2、第二次或以后：
            - 先去本地读取文件，判断它是否过期
                - 过期了
                    - 重新请求获取access_token，保存下来覆盖之前的文件（保证文件是唯一的）
                - 没有过期
                    -直接使用

    整理思路：
        读取本地文件（readAccessToken）
            - 本地有文件
                -判断他是否过期(isValidAccessToken)
                    - 过期了
                        - 重新请求获取access_token（getAccessToken），保存下来覆盖之前的文件（保证文件是唯一的）（saveAccessToken），直接使用
                    - 没有过期
                        -直接使用
            - 本地没有文件
                - 发送请求获取access_token（getAccessToken），保存下来（本地文件）（saveAccessToken），直接使用
*/
//引入fs模块
const {writeFile, readFile} = require("fs");

//引入config模块
const {appID, appsecret} = require("../config");

//只需要引入request-promise-native
const rp = require("request-promise-native");

//定义类，获取access_token
class Wechat {
    constructor(){

    }
    /* 
    用来获取access_token
    */
    getAccessToken(){
        //定义请求地址
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
        //发送请求
        /* 
            request
            request-promise-native  返回值是一个promise对象
        */
       //console.log(url)
       return new Promise((resolve,reject) => {
            rp({method:'GET',url,json:true})
                    .then(res => {
                        console.log("获取token-1:");
                        console.log(res);
                        //设置access_token的过期时间
                        res.expires_in = Date.now() + (res.expires_in -300) * 1000;
                        console.log("获取token-2:");
                        console.log(res);
                        //将promise对象状态改为成功的被动态；
                        resolve(res);
                    })
                    .catch(err => {
                        console.log(err);
                        reject('getAccessToken方法出来问题：' + err);
                    })
        });
    }

    /* 
    用来保存access_token
    @parm accessToken 要保存的凭据
    */
   saveAccessToken(accessToken){
       //将对象转化为json字符串
       accessToken = JSON.stringify(accessToken);
       //将access_token保存到一个文件
       return new Promise((resolve,reject)=>{
            writeFile('./accessToken.txt',accessToken,err =>{
                if(!err){
                    console.log('文件保存成功~');
                    resolve();
                }else{
                    reject("saveAccessToken方法出了问题："+err)
                }
            })

       })


   }

   /* 
   用来读取access_token
   */
  readAccessToken(){
      //读取本地文件中的access_token
      return new Promise((resolve,reject)=>{
           readFile('./accessToken.txt',(err,data) =>{
               if(!err){
                   console.log('文件读取成功~');
                   //将json字符串转化为js对象；
                   data = JSON.parse(data);
                   resolve(data);
               }else{
                   reject("readAccessToken方法出了问题："+err)
               }
           })

      })


  }

   /* 
   用来检查access_token是否有效
    @parm accessToken 要检查的凭据
   */
  isValidAccessToken(accessToken){
      console.log("开始验证");
      console.log(accessToken);
      //检测传入的参数是否有效
      if(!accessToken && !data.access_token && !data.expires_in){
          //代表access_token无效；
      console.log("验证无效");
          return false;
      }
      console.log("结束验证");

      //检测传入的参数是否在有效期内
    //   if(data.expires_in < Date.now()){
    //       //过期了
    //       return false;
    //   }else{
    //       //没过期
    //       return true;
    //   }
      return data.expires_in > Date.now();

  }

  /* 
  用来获取没有过期的access_token
   @return { Promise<any> } access_token
  */
  fetchAccessToken(){
      if(this.access_token && this.expires_in && this.isValidAccessToken(this)){
          //说明之前保存过access_token,并且它是有效的，直接使用
         console.log("验证有效1");

          return Promise.resolve({
              access_token:this.access_token,
              expires_in:this.expires_in
          })
      }
      //
    //   return new Promise((resolve,reject) =>{
            //是fetchAccessToken函数的返回值
            return this.readAccessToken()
            .then(async res =>{
                console.log("ok1");
                //本地有文件
                //判断他是否过期(isValidAccessToken)
                if(this.isValidAccessToken(res)){
                    console.log("验证有效2");
                    //有效的
                    return Promise.resolve(res);
                    //resolve(res);
                }else{
                    console.log("验证无效2");
                    //过期了
                    //发送请求获取access_token（getAccessToken）
                    const res = await this.getAccessToken()
                    //.then(res =>{
                        //保存下来（本地文件）（saveAccessToken），直接使用
                    await this.saveAccessToken(res)
                            //.then(() =>{
                    return Promise.resolve(res);
                    //resolve(res);
                            //})
                    //})
                }
            })
            .catch(async err =>{
                console.log("ok2");
                //本地没有文件
                //发送请求获取access_token（getAccessToken）
                // w.getAccessToken()
                //     .then(res =>{
                //         //保存下来（本地文件）（saveAccessToken），直接使用
                //         w.saveAccessToken(res)
                //             .then(() =>{
                //                 resolve(res);
                //             })
                //     })
                const res = await this.getAccessToken()
                await this.saveAccessToken(res)
                return Promise.resolve(res);
            })
            .then(res => {
                console.log("ok3");
                //将access_token挂载到this上
                this.access_token = res.access_token;
                this.expires_in = res.expires_in;
                //返回res包装了一层promise对象（此对象为成功的状态）
                //是this.readAccessToken()最终的返回值
                return Promise.resolve(res);
            })
        // })
            // .then(res => {
            //     console.log(res);
            // })
  }

}

//模拟测试
const w = new Wechat();

w.fetchAccessToken();

// 整理思路：
// 读取本地文件（readAccessToken）
//     - 本地有文件
//         -判断他是否过期(isValidAccessToken)
//             - 过期了
//                 - 重新请求获取access_token（getAccessToken），保存下来覆盖之前的文件（保证文件是唯一的）（saveAccessToken），直接使用
//             - 没有过期
//                 -直接使用
//     - 本地没有文件
//         - 发送请求获取access_token（getAccessToken），保存下来（本地文件）（saveAccessToken），直接使用

