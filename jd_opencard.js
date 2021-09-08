/*
直接跑完全部助力CK1

第一个账号助力我 其他依次助力CK1
第一个CK失效应该全都会助力我，亲注意一下
入口复制到jd：


更新地址：https://github.com/Tsukasa007/my_script
============Quantumultx===============
[task_local]
#9.8-9.30 成家有福 长长久久
5 0,5,23 * * * jd_opencard_Long_long_9_8-9-30.js, tag=9.8-9.30 成家有福 长长久久, img-url=https://raw.githubusercontent.com/tsukasa007/icon/master/jd_opencard_Long_long_9_8-9-30.png, enabled=true

================Loon==============
[Script]
cron "5 0,5,23 * * *" script-path=jd_opencard_Long_long_9_8-9-30.js,tag=9.8-9.30 成家有福 长长久久

===============Surge=================
9.8-9.30 成家有福 长长久久 = type=cron,cronexp="5 0,5,23 * * *",wake-system=1,timeout=3600,script-path=jd_opencard_Long_long_9_8-9-30.js

============小火箭=========
9.8-9.30 成家有福 长长久久 = type=cron,script-path=jd_opencard_Long_long_9_8-9-30.js, cronexpr="5 0,5,23 * * *", timeout=3600, enable=true
*/
const $ = new Env('9.8-9.30 成家有福 长长久久');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let UA = require('./USER_AGENTS.js').USER_AGENT;
const notify = $.isNode() ? require('./sendNotify') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
    };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}


!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
            "open-url": "https://bean.m.jd.com/"
        });
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            console.log(`\n\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            let wxCommonInfoTokenDataTmp = await getWxCommonInfoToken();
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                    "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                });
                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            let wxCommonInfoTokenData = wxCommonInfoTokenDataTmp.data;
            $.LZ_TOKEN_KEY = wxCommonInfoTokenData.LZ_TOKEN_KEY
            $.LZ_TOKEN_VALUE = wxCommonInfoTokenData.LZ_TOKEN_VALUE
            $.isvObfuscatorToken = await getIsvObfuscatorToken();
            $.myPingData = await getMyPing()
            if ($.myPingData === "" || $.myPingData === '400001' || !$.myPingData || !$.myPingData.secretPin) {
                $.log("黑号!")
                continue
            }
            await getHtml();
            await adLog();
            $.actorUuidResp = await getActorUuid();
            if (!$.actorUuidResp) {
                $.log("黑号!")
                continue
            }
            $.actorUuid = $.actorUuidResp.data.actorUuid;
            let checkOpenCardData = await checkOpenCard();
            if (!checkOpenCardData.data) {
                continue
            }
            checkOpenCardData = checkOpenCardData.data
            if (!checkOpenCardData.allOpenCard) {
                for (let cardListElement of checkOpenCardData.cardList1) {
                    $.log('入会: ' + cardListElement.name)
                    await join(cardListElement.value)
                }
                for (let cardListElement of checkOpenCardData.cardList2) {
                    $.log('入会: ' + cardListElement.name)
                    await join(cardListElement.value)
                }
            } else {
                $.log("是否全部入会： " + checkOpenCardData.allOpenCard);
            }
            await followShop()
            // await saveTask()
            await startDraw(1)
            await startDraw(2)
            await checkOpenCard();
            await getActorUuid();
            await getDrawRecordHasCoupon()
            $.log($.shareUuid)
            if (i === 0 && $.actorUuid) {
                $.log(`你的邀请码 ${$.actorUuid}`)
                $.shareUuid = $.actorUuid;
            }else if (i === 0 && !$.actorUuid){
                $.log(`ck1 错误`)
                break
            }
        }
    }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

function followShop() {
    return new Promise(resolve => {
        let body = `activityId=9ef833504aaf436ebd84a3b762c32ead&pin=${encodeURIComponent($.myPingData.secretPin)}&actorUuid=${$.actorUuid}&taskType=23&taskValue=1000009621&shareUuid=${$.shareUuid ? $.shareUuid : '7d7b6e18ad5a4b219b3fe16f19dbc5cf'}`
        $.post(taskPostUrl('/dingzhi/dz/openCard/followShop', body, 'https://lzdz1-isv.isvjcloud.com/dingzhi/dz/openCard/followShop'), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    $.log(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
    })
}


function getDrawRecordHasCoupon() {
    return new Promise(resolve => {
        let body = `activityId=9ef833504aaf436ebd84a3b762c32ead&actorUuid=${$.actorUuid}&shareUuid=${$.shareUuid ? $.shareUuid : '7d7b6e18ad5a4b219b3fe16f19dbc5cf'}&pin=${encodeURIComponent($.myPingData.secretPin)}`
        $.post(taskPostUrl('/dingzhi/taskact/openCardcommon/getDrawRecordHasCoupon', body, 'https://lzdz1-isv.isvjcloud.com/dingzhi/taskact/openCardcommon/getDrawRecordHasCoupon'), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {

                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function saveTask() {
    return new Promise(resolve => {
        let body = `activityId=9ef833504aaf436ebd84a3b762c32ead&pin=${encodeURIComponent($.myPingData.secretPin)}&taskType=2&taskValue=2736969&actorUuid=${$.actorUuid}&shareUuid=${$.shareUuid ? $.shareUuid : '7d7b6e18ad5a4b219b3fe16f19dbc5cf'}`
        $.post(taskPostUrl('/dingzhi/dz/openCard/saveTask', body, 'https://lzdz1-isv.isvjcloud.com/dingzhi/dz/openCard/saveTask'), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    $.log(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
    })
}

async function startDraw(type) {
    return new Promise(resolve => {
        let body = `activityId=9ef833504aaf436ebd84a3b762c32ead&actorUuid=${$.actorUuid}&shareUuid=${$.shareUuid ? $.shareUuid : '7d7b6e18ad5a4b219b3fe16f19dbc5cf'}&pin=${encodeURIComponent($.myPingData.secretPin)}&type=${type}`
        $.post(taskPostUrl('/dingzhi/dz/openCard/startDraw', body, `https://lzdz1-isv.isvjcloud.com/dingzhi/dz/openCard/activity/805745?activityId=9ef833504aaf436ebd84a3b762c32ead&shareUuid=${$.shareUuid ? $.shareUuid : '7d7b6e18ad5a4b219b3fe16f19dbc5cf'}`), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    $.log('抽到了： ' + data)
                }
            } catch (e) {
                //await $.wait(5000)
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}



function join(venderId) {
    return new Promise(resolve => {
        $.get(ruhui(`${venderId}`), async (err, resp, data) => {
            try {
                data = data.match(/(\{().+\})/)[1]
                data = JSON.parse(data);
                if (data.success == true) {
                    $.log(data.message)
                } else if (data.success == false) {
                    $.log(data.message)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function ruhui(functionId) {
    return {
        url: `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={"venderId":"${functionId}","shopId":"${functionId}","bindByVerifyCodeFlag":1,"registerExtend":{"v_sex":"未知","v_name":"大品牌","v_birthday":"2021-07-23"},"writeChildFlag":0,"activityId":1454199,"channel":401}&client=H5&clientVersion=9.2.0&uuid=88888&jsonp=jsonp_1627049995456_46808`,
        headers: {
            'Content-Type': 'text/plain; Charset=UTF-8',
            'Origin': 'https://api.m.jd.com',
            'Host': 'api.m.jd.com',
            'accept': '*/*',
            'User-Agent': 'Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1',
            'content-type': 'application/x-www-form-urlencoded',
            'Referer': 'https://shopmember.m.jd.com/shopcard/?venderId=1000003005&shopId=1000003005&venderType=1&channel=102&returnUrl=https%%3A%%2F%%2Flzdz1-isv.isvjcloud.com%%2Fdingzhi%%2Fdz%%2FopenCard%%2Factivity%%2F7376465%%3FactivityId%%3Dd91d932b9a3d42b9ab77dd1d5e783839%%26shareUuid%%3Ded1873cb52384a6ab42671eb6aac841d',
            'Cookie': cookie
        }
    }
}


function getWxCommonInfoToken() {
    ////await $.wait(20)
    return new Promise(resolve => {
        $.post({
            url: `https://lzdz1-isv.isvjcloud.com/wxCommonInfo/token`,
            headers: {
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'lzdz1-isv.isvjcloud.com',
                'Origin': 'https://lzdz1-isv.isvjcloud.com',
                'Referer': 'https://lzdz1-isv.isvjcloud.com/wxCommonInfo/token',
            }
        }, async (err, resp, data) => {
            try {
                if (err) {
                    $.isLogin = false
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.isLogin = false
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}


function getIsvObfuscatorToken() {
    return new Promise(resolve => {
        $.post({
            url: `https://api.m.jd.com/client.action?functionId=isvObfuscator&clientVersion=10.0.4&build=88641&client=android&d_brand=OPPO&d_model=PCAM00&osVersion=10&screen=2208*1080&partner=oppo&oaid=&openudid=7049442d7e415232&eid=eidAfb0d81231cs3I4yd3GgLRjqcx9qFEcJEmyOMn1BwD8wvLt/pM7ENipVIQXuRiDyQ0FYw2aud9+AhtGqo1Zhp0TsLEgoKZvAWkaXhApgim9hlEyRB&sdkVersion=29&lang=zh_CN&uuid=7049442d7e415232&aid=7049442d7e415232&area=4_48201_54794_0&networkType=wifi&wifiBssid=774de7601b5cddf9aad1ae30f3a3dfc0&uts=0f31TVRjBSsqndu4%2FjgUPz6uymy50MQJ2tPvKuaZvdpSgSWj4Rft6vj532pNv%2FCKtTDIdQHDjGpLlEc2uSsiMQQUTLV9Je9grp1cLq3H0VUzzfixZwWR4M5Q8POBAxkpKMun92VcSYcb6Es9VnenAIfXRVX%2FGYBK9bYxY4NCtDEYEP8Hdo5iUbygFO2ztKWTX1yisUO%2BQJEOojXBN9BqYg%3D%3D&uemps=0-0&st=1627049782034&sign=8faf48b6ada54b2497cfbb051cd0590d&sv=110`,
            body: 'body=%7B%22id%22%3A%22%22%2C%22url%22%3A%22https%3A%2F%2Fjinggengjcq-isv.isvjcloud.com%2Ffronth5%2F%3Flng%3D114.062541%26lat%3D29.541254%26sid%3D57b59835c68ed8959d124d644f61c58w%26un_area%3D4_48201_54794_0%23%2Fpages%2Feight-brands%2Feight-brands%22%7D&',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'api.m.jd.com',
                'Referer': 'https://api.m.jd.com/client.action?functionId=isvObfuscator&clientVersion=10.0.4&build=88641&client=android&d_brand=OPPO&d_model=PCAM00&osVersion=10&screen=2208*1080&partner=oppo&oaid=&openudid=7049442d7e415232&eid=eidAfb0d81231cs3I4yd3GgLRjqcx9qFEcJEmyOMn1BwD8wvLt/pM7ENipVIQXuRiDyQ0FYw2aud9+AhtGqo1Zhp0TsLEgoKZvAWkaXhApgim9hlEyRB&sdkVersion=29&lang=zh_CN&uuid=7049442d7e415232&aid=7049442d7e415232&area=4_48201_54794_0&networkType=wifi&wifiBssid=774de7601b5cddf9aad1ae30f3a3dfc0&uts=0f31TVRjBSsqndu4%2FjgUPz6uymy50MQJ2tPvKuaZvdpSgSWj4Rft6vj532pNv%2FCKtTDIdQHDjGpLlEc2uSsiMQQUTLV9Je9grp1cLq3H0VUzzfixZwWR4M5Q8POBAxkpKMun92VcSYcb6Es9VnenAIfXRVX%2FGYBK9bYxY4NCtDEYEP8Hdo5iUbygFO2ztKWTX1yisUO%2BQJEOojXBN9BqYg%3D%3D&uemps=0-0&st=1627049782034&sign=8faf48b6ada54b2497cfbb051cd0590d&sv=110',
                'Cookie': cookie,
            }
        }, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.token);
            }
        })
    })
}

function getMyPing() {
    ////await $.wait(20)
    return new Promise(resolve => {
        $.post({
            url: `https://lzdz1-isv.isvjcloud.com/customer/getMyPing`,
            body: `userId=1000376745&token=${$.isvObfuscatorToken}&fromType=APP_pointRedeem`,
            headers: {
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'lzdz1-isv.isvjcloud.com',
                'Referer': 'https://lzdz1-isv.isvjcloud.com/customer/getMyPing',
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};`,
            }
        }, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    $.lz_jdpin_token = resp['headers']['set-cookie'].filter(row => row.indexOf("lz_jdpin_token") !== -1)[0]
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
    })
}

function getHtml() {
    return new Promise(resolve => {
        $.get({
            url: `https://lzdz1-isv.isvjcloud.com/dingzhi/dz/openCard/activity/5564548?activityId=9ef833504aaf436ebd84a3b762c32ead&shareUuid=${$.shareUuid ? $.shareUuid : '7d7b6e18ad5a4b219b3fe16f19dbc5cf'}&adsource=null&shareuserid4minipg=P0CZ6sYjxiDL7YQZAjODCU7oeVP9kq2pYSH90mYt4m3fwcJlClpxrfmVYaGKuquQkdK3rLBQpEQH9V4tdrrh0w==&shopid=1000009621&lng=113.387958&lat=22.511013&sid=09fdc8e908526b5538a4ad4a265f40dw&un_area=19_1657_52093_0`,
            headers: {
                'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1`,
                'Host': 'lzdz1-isv.isvjcloud.com',
                'Cookie': `IsvToken=${$.isvObfuscatorToken}; __jdc=60969652; __jd_ref_cls=Mnpm_ComponentApplied; pre_seq=1; __jda=60969652.1622198480453678909255.1622198480.1626617117.1626757026.38; __jdb=60969652.1.1622198480453678909255|38.1626757026; mba_sid=187.2; pre_session=vFIEj/DyoMrR+8jmAgzXSqWcNxIDZica|319; __jdv=60969652%7Cdirect%7C-%7Cnone%7C-%7C1624292158074; LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.secretPin}; ${$.lz_jdpin_token} mba_muid=1622198480453678909255.187.1626757027670`,
            }
        }, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}



function adLog() {
    return new Promise(resolve => {
        $.post({
            url: `https://lzdz1-isv.isvjcloud.com/common/accessLogWithAD`,
            body: `venderId=1000009621&code=99&pin=${encodeURIComponent($.myPingData.secretPin)}&activityId=9ef833504aaf436ebd84a3b762c32ead&pageUrl=https://lzdz1-isv.isvjcloud.com/dingzhi/dz/openCard/activity/797702?activityId=9ef833504aaf436ebd84a3b762c32ead&shareUuid=${$.shareUuid ? $.shareUuid : '7d7b6e18ad5a4b219b3fe16f19dbc5cf'}&adsource=null&shareuserid4minipg=P0CZ6sYjxiDL7YQZAjODCU7oeVP9kq2pYSH90mYt4m3fwcJlClpxrfmVYaGKuquQkdK3rLBQpEQH9V4tdrrh0w==&shopid=1000009621&lng=113.387958&lat=22.511013&sid=09fdc8e908526b5538a4ad4a265f40dw&un_area=19_1657_52093_0`,
            headers: {
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Host': 'lzdz1-isv.isvjcloud.com',
                'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
                'Referer': 'https://lzdz1-isv.isvjcloud.com/common/accessLogWithAD',
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.myPingData.secretPin}; ${$.lz_jdpin_token}`,
            }
        }, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    // data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function getActorUuid() {
    return new Promise(resolve => {
        $.post({
            url: `https://lzdz1-isv.isvjcloud.com/dingzhi/dz/openCard/activityContent`,
            body: `activityId=9ef833504aaf436ebd84a3b762c32ead&pin=${encodeURIComponent($.myPingData.secretPin)}&pinImg=https%3A%2F%2Fimg10.360buyimg.com%2Fimgzone%2Fjfs%2Ft1%2F7020%2F27%2F13511%2F6142%2F5c5138d8E4df2e764%2F5a1216a3a5043c5d.png&nick=${encodeURIComponent($.myPingData.nickname)}&cjyxPin=&cjhyPin=&shareUuid=${$.shareUuid ? $.shareUuid : '7d7b6e18ad5a4b219b3fe16f19dbc5cf'}`,
            headers: {
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Host': 'lzdz1-isv.isvjcloud.com',
                'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
                'Referer': 'https://lzdz1-isv.isvjcloud.com/dingzhi/dz/openCard/activityContent',
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.myPingData.secretPin}; ${$.lz_jdpin_token}`,
            }
        }, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function checkOpenCard() {
    return new Promise(resolve => {
        let body = `activityId=9ef833504aaf436ebd84a3b762c32ead&actorUuid=${$.actorUuid}&shareUuid=${$.shareUuid}&pin=${encodeURIComponent($.myPingData.secretPin)}`
        $.post(taskPostUrl('/dingzhi/dz/openCard/checkOpenCard', body, 'https://lzdz1-isv.isvjcloud.com/dingzhi/dz/openCard/checkOpenCard'), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data && data.data) {
                        $.log("================== 你邀请了： " + data.data.score + " 个")
                    }
                }
            } catch (e) {
                data = {data: {nowScore: 50}}
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}


function taskPostUrl(url, body, referer) {
    return {
        url: `https://lzdz1-isv.isvjcloud.com${url}`,
        body: body,
        headers: {
            "Host": "lzdz1-isv.isvjcloud.com",
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Accept-Language": "zh-cn",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded; Charset=UTF-8",
            "Origin": "https://lzdz1-isv.isvjcloud.com",
            "Connection": "keep-alive",
            "Referer": referer ? referer : `https://lzdz1-isv.isvjcloud.com/lzclient/dz/2021jan/eliminateGame/0713eliminate/?activityId=735c30216dc640638ceb6e63ff6d8b17&shareUuid=${$.shareUuid ? $.shareUuid : '7d7b6e18ad5a4b219b3fe16f19dbc5cf'}&adsource=&shareuserid4minipg=u%2FcWHIy7%2Fx3Ij%20HjfbnnePkaL5GGqMTUc8u%2Fotw2E%20a7Ak3lgFoFQlZmf45w8Jzw&shopid=0&lng=114.062541&lat=29.541254&sid=57b59835c68ed8959d124d644f61c58w&un_area=4_48201_54794_0`,
            "User-Agent": UA,
            'Cookie': `${cookie} LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.myPingData.secretPin}; ${$.lz_jdpin_token}`,
        }
    }
}


function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}


