import player_ctl from "./player_ctl"
import Command from "./command"
import Stype from "../Stype";
import websocket from "../modules/websocket";
import Cmd from "../Cmd";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property([player_ctl])
    players: Array<player_ctl> = [];

    // 是否正在追帧
    private isFastRunning: boolean;
    // 正在执行帧的剩余时间（秒）
    private restRunningSecond: number;
    // 收了几帧
    public stepTime: number;
    // 帧间隔 100ms
    private stepInterval: number = 100;
    // 收到的命令帧
    private receiveCommands: Command[][];
    // 正在执行的命令帧
    private runningCommands: Command[];

    service_handlers:{[key: string] : any} = {};
    // onLoad () {}

    start () {

    }

    startGame(stepInterval: number) {
        // this.stepInterval = stepInterval;
        this.stepTime = 0;
        this.receiveCommands = [];
        this.runningCommands = null;
        
        this.service_handlers[Stype.DOUBLE_GAME] = this.on_double_shoot_server_return.bind(this);
        websocket.register_services_handler(this.service_handlers);
    }

    /**
     * ----------------------------------------------- 服务器回调 --------------------
     */
    on_double_shoot_server_return(stype: number, ctype: number, body: any) {
        switch(ctype) {
            case Cmd.DOUBLE_GAME.PLAYER_MOVE:
                this.on_player_move(body);
            break; 
        }
    }
    /**
     * 玩家移动, 帧同步
     * []
     *  seatId: number;     // 座位号, 对应玩家
        stepTime: number;        // 改命令的帧数
        command: string;     // 命令的详细信息 
     * @param body 
     */
    on_player_move(body: any) {
        this.stepTime = body[body.length - 1].stepTime;
        this.receiveCommands.push(body);
    }

    do_player_move(i: number, index) {
        switch(index) {
            case 0:
                this.players[i].player_turn_stand();
            break;
            case -1:
                this.players[i].player_turn_left();
            break;
            case 1:
                this.players[i].player_turn_right();   
            break;
            case 2:
                this.players[i].player_turn_top();
            break;
        }
    }

    

    update (dt) {
        // 如果有收到帧
        if (this.receiveCommands && (this.receiveCommands.length > 0)) {
            // 超过3帧就追帧
            let scale: number = Math.ceil(this.receiveCommands.length / 3);
            if (scale > 10) scale = 10;
            this.isFastRunning = (scale > 1);

            let ms: number = dt * scale;
            // 取帧
            if (this.runningCommands == null) {
                this.runningCommands = this.receiveCommands[0];
                this.restRunningSecond = this.stepInterval / 1000;
                console.log("run " + this.runningCommands[0].stepTime + " step");
            }
            // 执行时间不能大于剩余时间
            if (ms > this.restRunningSecond) {
                ms = this.restRunningSecond;
            }
            // 查看帧中是否有指令
            /* for (let command of this.runningCommands) {
                // if (command.direction == undefined) continue;
                // 改变方向
                for (let player of this.players) {
                    //if (player.getPlayerName() === command.playerName) {
                    //    player.direction = command.direction;
                    // }
                }
            } */
            for(let i=0; i<this.runningCommands.length; i++) {
                if(this.runningCommands[i].command == null) continue;
                this.do_player_move(this.runningCommands[i].seatId, this.runningCommands[i].command);
            }
            // 移动
            /* for (let player of this.players) {
                // player.move(ms);
            } */
            // 是否执行完了一帧
            this.restRunningSecond -= ms;
            if (this.restRunningSecond <= 0) {
                this.runningCommands = null;
                this.receiveCommands.shift();
            }
        }
    }
}
