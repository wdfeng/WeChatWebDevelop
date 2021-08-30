/**
 * 处理用户发送的消息类型和内容；
 * 决定返回不同的内容给用户；
 */
module.exports = message => {
    
    let options ={
        toUserName:message.FromUserName,
        fromUserName:message.ToUserName,
        createTime:Date.now()
    }
    

    let content = '您在说什么？我听不懂！';
    //判断用户发送的消息是否是文本内容
    if (message.MsgType === 'text') {
        //判断用户发送的消息内容具体是什么
        if (message.Content === '1') {
            content = '大吉大利，今晚赤鸡';
        }else if(message.Content === '2'){
            content = '落地成盒'
        }else if(message.Content.match('爱')){
          content = '我爱你！'
      }
      options.msgType = message.MsgType;
      options.content = content;
      console.log(options);
    }else if (message.MsgType === 'image') {
        options.msgType = message.MsgType;
        options.media_id = message.MediaId;
    }else if (message.MsgType === 'voice') {
        // options.msgType = 'voice';
        // options.media_id = message.MediaId;
        options.msgType = 'text';
        options.content = `'/::):\n ${message.Recognition?message.Recognition:"听不清你在说什么？"}`;
    }else if (message.MsgType === 'video') {
        options.msgType = 'video';
        options.media_id = message.MediaId;
    }else if (message.MsgType === 'shortvideo') {
        options.msgType = 'image';
        options.media_id = message.MediaId;
    }else if (message.MsgType === 'location') {
        options.msgType = 'text';
        // options.content = '纬度:'+message.Location_X+'\n经度:'+message.Location_Y+'\n位置:';
        // options.content += message.Label?message.Label:"犄角旮旯";
        options.content = `纬度:${message.Location_X} \n经度:${message.Location_Y} \n缩放:${message.Scale} \n位置:${message.Label?message.Label:"犄角旮旯"}`;
    }else if (message.MsgType === 'link') {
        options.msgType = 'image';
        options.media_id = message.MediaId;
    }else if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){
            options.msgType = 'text';
            //1 关注事件
            options.content = '欢迎您关注订阅测试号';
            //2.1 扫描带参数二维码事件，之前未关注
            if (message.EventKey) {
                options.content = '用户扫码带参二维码关注事件';
            }
        }else if(message.Event === 'subscribe'){
            //1 取消关注事件
            console.log("无情取关")
        }else if(message.Event === 'SCAN'){
            options.msgType = 'text';
            //2.2 扫描带参数二维码事件，之前已关注
            options.content = '用户扫码带参二维码，之前已经关注过';
        }else if(message.Event === 'LOCATION'){
            options.msgType = 'text';
            //3 上报地理位置事件
            options.content = `纬度:${message.Latitude} \n经度:${message.Longitude} \n精度:${message.Precision}`;
        }else if(message.Event === 'CLICK'){
            options.msgType = 'text';
            //4 自定义菜单事件
            options.content = `您点击了按钮:${message.EventKey}`;
        }
    }


    return options;
}