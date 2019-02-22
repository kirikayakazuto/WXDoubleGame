import player_ctl from "./player_ctl"
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(Number)
    gravity = 100;

    @property(player_ctl)
    player_ctl: player_ctl = null;

    @property([cc.Prefab])
    stop_arms: Array<cc.Prefab> = [];

    self_stop_arms: cc.Node = null;

    stop_prefab_change = {
        5:0,
        6:1,
        7:2,
        8:3
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        
        
        if(otherCollider.tag == 22 && !otherCollider.node["is_stop"]) {  // 打在了墙上
            
            this.player_ctl.armsStatus = 2;
            otherCollider.node["is_stop"] = true;
            
            let node = cc.instantiate(this.stop_arms[this.stop_prefab_change[selfCollider.tag]])
            
            // 显示墙上的斧头
            let pos = otherCollider.node.position;
            // 判断斧头是否可以碰撞
            
            node.x = pos.x;
            node.y = pos.y;
            node.parent = otherCollider.node.parent;
            node["who"] = otherCollider.node["who"];

            otherCollider.node.removeFromParent();
        }
    }

    // update (dt) {}
}
