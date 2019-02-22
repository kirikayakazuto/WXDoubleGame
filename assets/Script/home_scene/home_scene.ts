import ugame from "../ugame";
import double_shoot from "../protobufs/double_shoot";
import Cmd from "../Cmd";
import response from "../response";
import Stype from "../Stype";
import websocket from "../modules/websocket";
import seat_ctl from "./seat_ctl"
import { State } from "../State";


const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    head_img: cc.Node = null;
    @property(cc.Label)
    nameNick: cc.Label = null;
    @property(cc.Node)
    mask: cc.Node = null;

    @property(seat_ctl)
    selfSeat: seat_ctl = null;
    @property(seat_ctl)
    otherSeat: seat_ctl = null;

    @property(cc.Node)
    startNode: cc.Node = null;

    is_matching = false;
    
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initUserInfo();
        let service_handlers:{[key: string] : any} = {};
        service_handlers[Stype.DOUBLE_GAME] = this.on_double_shoot_server_return.bind(this);
        websocket.register_services_handler(service_handlers);
    }

    start () {

    }
    /**
     * 初始化玩家信息
     */
    initUserInfo() {
        this.load_head_image();
        this.nameNick.string = ugame.nickName;
    }
    /**
     * 加载头像
     */
    load_head_image() {
        cc.loader.load({url: ugame.avatarUrl, type: 'jpg'}, (err, texture) => {
            if(err) {
                console.log(err);
                return ;
            }
            var sprite  = new cc.SpriteFrame(texture);
            this.head_img.getComponent(cc.Sprite).spriteFrame = sprite;
        });
    }
    /**
     * 点击开始按钮
     */
    start_button_click() {
        if(!this.is_matching) {
            double_shoot.player_ready(null);
        }else {
            // double_shoot.player_unready(null);
        }
        this.mask.active = true;
    }
    /**
     * 
     * ----------------------------------------- 服务器回调 ----------------------------
     */
    /**
     * 进入区间
     */
    on_enter_zone(body: any) {
        if(body[0] != response.OK) {
            return ;
        }
        this.mask.active = false;
    }
    /**
     * 准备
     */
    on_player_ready(body: any) {
        if(body[0] != response.OK) {
            return ;
        }
        // 修改按钮样式
        this.startNode.getChildByName("str").getComponent(cc.Label).string = "正在匹配";
        this.mask.active = false;
    }
    /**
     * 取消准备
     */
    on_player_unready(body: any) {
        if(body[0] != response.OK) {
            return ;
        }
        // 修改按钮样式
        this.startNode.getChildByName("str").getComponent(cc.Label).string = "开始匹配";
        this.mask.active = false;
    }
    /**
     * 玩家到达
     */
    on_user_arrived(body: any) {
        let player_info = {
            sv_seatid: body[0], 
            nickName: body[1],
            avatarUrl: body[2],
            chip: body[3],
            exp: body[4],
            state: body[5]
        }

        this.otherSeat.on_sitdowm(player_info, false);
    }
    /**
     * 玩家坐下
     * @param body 
     */
    on_player_sitdown(body: any) {
        if(body[0] != response.OK) {
            return ;
        }
        let player_info = {
            sv_seatid: body[1],
            nickName: ugame.nickName,
            avatarUrl: ugame.avatarUrl,
            chip: ugame.chip,
            exp: ugame.exp,
            state : State.InView,
            
        };
        this.selfSeat.on_sitdowm(player_info, true);
    }
    /**
     * -------------------------------------- end -------------------------------------
     */
   

    /**
     * ----------------------------------- 接收服务器上的信息  -----------------------
     * @param stype 
     * @param ctype 
     * @param body 
     */
    on_double_shoot_server_return(stype: number, ctype: number, body: any) {
        console.log(stype, ctype, body);
        switch(ctype) {
            case Cmd.DOUBLE_GAME.ENTER_ZONE:
                this.on_enter_zone(body);
            break;
            case Cmd.DOUBLE_GAME.PLAYER_READY:
                this.on_player_ready(body);
            break;
            case Cmd.DOUBLE_GAME.PLAYER_UNREADY:
                this.on_player_unready(body);
            break;
            case Cmd.DOUBLE_GAME.SITDOWN:
                this.on_player_sitdown(body);
            break;
            case Cmd.DOUBLE_GAME.USER_ARRIVED:  // 玩家抵达
                this.on_user_arrived(body);
            break;
            
        }
    }

    /**
     * 玩家进入某个区间
     * 1, 经典房间
     * 2, 
     */
    enter_zone_button_click(e, data) {
        data = parseInt(data);
        double_shoot.enter_zone(1);
        this.mask.active = true;
    }
     /**
     * 玩家坐下
     */
    player_seat_down() {
        // this._show_self_info();
    }
    // update (dt) {}
}
