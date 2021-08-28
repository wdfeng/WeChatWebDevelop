/**
 * 用来加工处理最终回复用户消息的模板（xml数据）
 * @param {} options 
 * 
 */
module.exports = options => {
    let replyMessage = `<xml>
    <ToUserName><![CDATA[${options.toUserName}]]></ToUserName>
    <FromUserName><![CDATA[${options.fromUserName}]]></FromUserName>
    <CreateTime>${options.createTime}</CreateTime>
    <MsgType><![CDATA[${options.msgType}]]></MsgType>`;

    if (options.msgType === 'text') {//1 回复文本消息
        replyMessage += `<Content><![CDATA[${options.content}]]></Content>`
    } else if (options.msgType === 'image') {//2 回复图片消息
        replyMessage += `
        <Image>
          <MediaId><![CDATA[${options.media_id}]]></MediaId>
        </Image>`
    } else if (options.msgType === 'voice') {//3 回复语音消息
        replyMessage += `
        <Voice>
          <MediaId><![CDATA[${options.media_id}]]></MediaId>
        </Voice>`
    } else if (options.msgType === 'video') {//4 回复视频消息
        replyMessage += `
        <Video>
          <MediaId><![CDATA[${options.media_id}]]></MediaId>
          <Title><![CDATA[${options.title}]]></Title>
          <Description><![CDATA[${options.description}]]></Description>
        </Video>`
    } else if (options.msgType === 'music') {//5 回复音乐消息
        replyMessage += `
        <Music>
          <Title><![CDATA[${options.title}]]></Title>
          <Description><![CDATA[${options.description}]]></Description>
          <MusicUrl><![CDATA[${options.MUSIC_Url}]]></MusicUrl>
          <HQMusicUrl><![CDATA[${options.HQ_MUSIC_Url}]]></HQMusicUrl>
          <ThumbMediaId><![CDATA[${options.media_id}]]></ThumbMediaId>
        </Music>`
    } else if (options.msgType === 'news') {//6 回复图文消息
        replyMessage += `
        <ArticleCount>${options.content.lenth}</ArticleCount>
        <Articles>`;

        options.content.forEach(item => {
            replyMessage +=`
              <item>
                <Title><![CDATA[${item.title1}]]></Title>
                <Description><![CDATA[${item.description1}]]></Description>
                <PicUrl><![CDATA[${item.picurl}]]></PicUrl>
                <Url><![CDATA[${item.url}]]></Url>
              </item>`
        });

        replyMessage +=`</Articles>`
    }

    replyMessage += `</xml>`;

    //最终回复给用户的xml数据；
    return replyMessage;
}