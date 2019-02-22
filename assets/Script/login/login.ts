import ugame from "../ugame";
import websocket from "../modules/websocket";
import auth from "../protobufs/auth";
import Cmd from "../Cmd";
import response from "../response";
import Stype from "../Stype";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    wait_node: cc.Node = null;
    @property(cc.Node)
    tips: cc.Node = null;

    wait_label: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:
    can_login = false;

    onLoad () {
        let service_handlers:{[key: string] : any} = {};
        service_handlers[Stype.Auth] = this.on_auth_server_return.bind(this);
        websocket.register_services_handler(service_handlers);

        this.wait_label = this.wait_node.getChildByName("str").getComponent(cc.Label);

        this.wx_get_scope();
    }

    start () {
        this.onConnected();

        
    }
    /**
     * 玩家授权登录
     */
    wx_get_scope() {
        let self = this;
        window["wx"].getSetting({
            success(res) {
                // 已授权
                if (res.authSetting["scope.userInfo"]){
                    // 进入下一步，点击开始游戏
                    self.can_login = true;
                } else {                                              // 显示授权按钮
                    let sysInfo = window["wx"].getSystemInfoSync();
                    let button = window["wx"].createUserInfoButton({
                        type: 'text',
                        text: '',
                        style: {
                            left: 0,
                            top: 0,
                            width: sysInfo.screenWidth,
                            height: sysInfo.screenHeight,
                            backgroundColor: '#00000000',//最后两位为透明度
                            color: '#ffffff',
                            fontSize: 20,
                            textAlign: "center",
                            lineHeight: sysInfo.screenHeight,
                        }
                    });
                    button.onTap(function(res)
                    {
                        if (res.userInfo) {
                            button.destroy();
                            // 进入下一步，比如 点击开始游戏
                            console.log(res);
                            self.can_login = true;
                        }
                        else {
                            window["wx"].showModal({
                                title: "温馨提示",
                                content: "《斧头决胜》是一款在线对战游戏，需要您的用户信息登录游戏。",
                                showCancel: false,
                            });
                        }
                    });
                    button.show();
                }
            }
        });
    }
    // 连接游戏服务器成功的回调。如果服务器用的是PHP，这里直接调用wx.login
    onConnected() {
        if(!websocket.is_connected || !this.can_login) {
            this.scheduleOnce(this.onConnected, 1);
            return ;
        }
        console.log('login');
        window["wx"].login({
            success: function(res) {
                console.log(res)
                // res中包含code
                let code = res.code;
                // 获取用户信息
                window["wx"].getUserInfo({
                    withCredentials: true,      // 必须在wx.login之后，这里才能为true
                    success: function(result) {
                        // result中包含encryptedData和iv
                        let encryptedData = result.encryptedData;
                        let iv = result.iv;
                        // 将res.code、result.encryptedData、result.iv发送到服务器
                        auth.get_wx_info(code, encryptedData, iv);
                    },
                    fail: function(result) {
                        // 错误处理
                    },
                });
            },
            fail: function(res) {
                // 错误处理
            },
        });
    
    }

    /**
     * 显示 文字信息, 2s后自动隐藏
     * @param str 
     */
    show_tips(str: string) {
        this.tips.getComponent(cc.Label).string = str;
        this.tips.active = true;

        this.scheduleOnce(() => {
            this.tips.active = false;
        }, 2);
    }

    start_game_click() {
        this.openid_login();
    }
    /**
     * 点击登录按钮
     */
    openid_login() {
        let body = [
            ugame.openid,
            ugame.nickName,
            ugame.avatarUrl,
            ugame.gender,
            ugame.city,
            ugame.country,
            ugame.province,
        ];
        auth.player_login(body);
    }
    /**
     * 包含用户信息以及openid
     */
    on_get_wx_info(body: any) {
        console.log(body);
        ugame.openid = body.openId;
        ugame.nickName = body.nickName;
        ugame.avatarUrl = body.avatarUrl;

        ugame.gender = body.gender;
        ugame.city = body.city;
        ugame.country = body.country;
        ugame.province = body.province;
    }
    /**
     * 自己的服务器登录回调
     * @param body 
     */
    on_openid_login(body: any) {
        
        if(body.status != response.OK) {
            console.log("on_openid_login error: ", body[0]);
            return ;
        }
        ugame.chip = body.chip;
        ugame.exp = body.exp;
        this.wait_node.active = true;
        //onProgress可以查看到加载进度
        cc.loader["onProgress"] = function ( completedCount, totalCount,  item ){
            var per = Math.floor(completedCount*100/totalCount);
            this.wait_label.string = per + "%";
        }.bind(this);
        //使用preloadScene()预加载场景
        cc.director.preloadScene('home_scene',function(){
            cc.loader["onProgress"]= null;
            cc.director.loadScene('home_scene');
        });

    }
    /**
     * ----------------------------------- 接收服务器上的信息  -----------------------
     * @param stype 
     * @param ctype 
     * @param body 
     */
    on_auth_server_return(stype: number, ctype: number, body: any) {
        console.log(stype, ctype, body);
        switch(ctype) {
            case Cmd.Auth.GET_WX_INFO:
                this.on_get_wx_info(body);
            break;
            case Cmd.Auth.OPENID_LOGIN:
                this.on_openid_login(body);
            break;
        }
    }


    

    

    

    // update (dt) {}
}
