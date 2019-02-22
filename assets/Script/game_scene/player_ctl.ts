import game_scene from "./game_scene"
import playerSP_ctl from "./playerSp_ctl"

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    
    @property(playerSP_ctl)
    playerSP_ctl: playerSP_ctl = null;
    @property(cc.Prefab)
    runArms: cc.Prefab = null;
    @property(cc.Prefab)
    reciveRunArms: cc.Prefab = null;


    @property(Number)
    player_speed = 100;
    @property(Number)
    jump_speed = 550;
    @property(Number)
    futou_speed = 50;

    @property(Number)
    gravity = 100;

    @property(Number)
    friction = 100;

    colliderArray: Array<cc.PhysicsBoxCollider> = [];

    ridybody: cc.RigidBody = null;  // 刚体组件

    game_ctl: game_scene = null;

    run_arms: cc.Node = null;   // 运动中的斧头

    playerStatus = 0;       // 0, 站在原地, -1向左移动中, 1, 向右移动中, 2 跳跃状态
    
    armsStatus = 0;         // 武器的状态   0表示武器在玩家手上, 1表示武器扔出去, 2表示武器在地上, 3表示武器收回来

    turn_dir = 1;           // 1表示朝向是右

    can_jump = false;   // 是否可以跳跃

    map_ground: cc.Rect = new cc.Rect(1, 1, 1, 1);

    
    // LIFE-CYCLE CALLBACKS:

    init(game_ctl) {
        this.game_ctl = game_ctl;
    }

    onLoad () {
        this.ridybody = this.node.getComponent(cc.RigidBody);
        this.colliderArray = this.node.getComponents("cc.PhysicsBoxCollider");
        console.log(this.colliderArray);
        this.ridybody.gravityScale = this.gravity;
        this.is_stand_ground()
        
    }

    start () {
        
    }

    set_map_ground(map_ground) {
        this.map_ground = map_ground;
    }

    // 点击发射按钮
    shoot_button_click() {
        // 判断手上是否有斧头
        if(this.armsStatus == 0) { //斧头在手上
            this._shoot_futou();
        }else if(this.armsStatus == 2){             // 没有斧头, 并且 只能点击一次
            this._recycle_futou();
        }
    }

    /**
     * 发射斧头
     */
    _shoot_futou() {
        this.armsStatus = 1;    // 武器扔出去
        this.playerSP_ctl.hide_armSp();

        let node = cc.instantiate(this.runArms);
        node["who"] = "self";
        node["is_stop"] = false;
        let rigidBody = node.getComponent(cc.RigidBody);
        let v = rigidBody.linearVelocity;
        let p = this.playerSP_ctl.get_jiantou_rotation();
        v.x = p.x * this.turn_dir;
        v.y = p.y;
        rigidBody.linearVelocity = v;
        node.parent = this.node.parent;
        node.x = this.node.x;
        node.y = this.node.y;
    }
    /**
     * 回收斧头
     */
    _recycle_futou() {
        let self_stop_arms = this.get_who_stop_arms("self");
        let pos = self_stop_arms.position;
        self_stop_arms.removeFromParent();
        let node = cc.instantiate(this.reciveRunArms);
        node.parent = this.node.parent;
        node.x = pos.x;
        node.y = pos.y;

        this.run_arms = node;
        this.armsStatus = 3;     
    }
    /**
     * 获取武器
     * @param str 
     */
    get_who_stop_arms(str: string) {
        let ch = this.node.parent.children;
        for(let i=0; i<ch.length; i++) {
            if(ch[i]["who"] == str) {
                return ch[i];
            }
        }
        return null;
    }

    /**
     * 回收斧头成功
     */
    recyle_futou_success() {
        this.run_arms.removeFromParent();
        this.run_arms = null;
        this.playerSP_ctl.show_armSp();
        
        this.armsStatus = 0;    // 武器回到手上
    }
    /**
     *  是否站在地面上
     */
    is_stand_ground() {
        let offset = this.colliderArray[1].offset;
        let size = this.colliderArray[1].size;
        let position = this.node.convertToWorldSpaceAR(offset);
        
        console.log(position, size);
        let a = new cc.Rect(0, 10, 5, 5);
        let b = new cc.Rect(0, 10, 5, 5); 
        cc.rectIntersectsRect(a, b);
        return false;   
    }

    

    /**
     * ---------------------------------- 碰撞事件处理 ---------------------------------
     */
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if(selfCollider.tag == 11 && otherCollider.tag == 21) {
            let v = this.ridybody.linearVelocity;
            v.y = this.jump_speed;
            this.ridybody.linearVelocity = v;   
            // 玩家触地
            if(this.playerStatus == 0) {
                this.playerSP_ctl._play_player_anim_by_index( 0);
            }else if(this.playerStatus  == -1 || this.playerStatus == 1) {
                this.playerSP_ctl._play_player_anim_by_index( 1);
            }
        }
    }

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact(contact, selfCollider: cc.Collider, otherCollider: cc.Collider){
        if(selfCollider.tag == 11 && otherCollider.tag == 0) {
            
        }
    }


    /**
     * ---------------------------------------------- end ---------------------
     */
    

    /**
     * 玩家站在原地不动
     */
    player_turn_stand() {
        this.playerStatus = 0;    // 

        let v = this.ridybody.linearVelocity;
        v.x = 0;
        this.ridybody.linearVelocity = v;
        
        this.playerSP_ctl._play_player_anim_by_index( 0);
    }
    /**
     * 玩家 向左移动
     */
    player_turn_left() {
        this.playerStatus = -1;    // 
        this.turn_dir = -1;

        this.playerSP_ctl.node.scaleX = -1;
        let v = this.ridybody.linearVelocity;
        v.x = -this.player_speed;
        this.ridybody.linearVelocity = v;

        this.playerSP_ctl._play_player_anim_by_index( 1);
    }
    /**
     * 玩家 向右移动
     */
    player_turn_right() {
        this.playerStatus = 1;
        this.turn_dir = 1;
        
        this.playerSP_ctl.node.scaleX = 1;
        let v = this.ridybody.linearVelocity;
        v.x = this.player_speed;
        this.ridybody.linearVelocity = v;

        this.playerSP_ctl._play_player_anim_by_index( 1);
    }
    /**
     * 玩家上跳
     */
    player_turn_top() {
        // 判断玩家是否站在地面上
        if(!this.can_jump) {
            return ;
        }
        this.can_jump = false;
        // this.playerStatus = 2;

        let v = this.ridybody.linearVelocity;
        v.y = this.jump_speed;
        this.ridybody.linearVelocity = v;

        this.playerSP_ctl._play_player_anim_by_index( 2);
    }

    /**
     * 设置run_arms的位置
     * @param dt 
     */
    set_run_arms_position(dt: number) {
        let psub = cc.pSub(this.run_arms.position, this.node.position);
        let len = Math.sqrt(psub.x * psub.x + psub.y * psub.y);
        if(Math.abs(psub.x) < 50 && Math.abs(psub.y) < 50) {
            this.recyle_futou_success();
            return ;
        }
        this.run_arms.x += -psub.x/len * this.futou_speed * dt;
        this.run_arms.y += -psub.y/len * this.futou_speed * dt;
    }

    update (dt) {
        if(this.armsStatus == 3) {
            this.set_run_arms_position(dt);
        }
    }
}
