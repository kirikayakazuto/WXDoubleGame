
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    unick: cc.Label = null;
    @property(cc.Sprite)
    uimg: cc.Sprite = null;

    is_self = false;    
    sv_seatid = -1;    // 座位id号

    player_info = null;
    state = 0;

    // onLoad () {}

    start () {

    }
    /**
     * 玩家坐下
     * @param player_info 
     * @param is_self 
     */
    on_sitdowm(player_info: player_info, is_self) {
        this.player_info = player_info;
        this.node.active = true;

        
        this.state = 0;

        this.unick.string = player_info.nickName;

        this.is_self = is_self;

        cc.loader.load({url: player_info.avatarUrl, type: 'jpg'}, (err, texture) => {
            if(err) {
                console.log(err);
                return ;
            }
            var sprite  = new cc.SpriteFrame(texture);
            this,this.uimg.spriteFrame = sprite;
        });
    }

    // update (dt) {}
}

class player_info {
    nickName = "";
    avatarUrl = "";
    chip = 0;    // 金币数目
    exp = 0;     // 经验值
    state = 0;
}
