import websocket from "../modules/websocket";
import Stype from "../Stype";
import Cmd from "../Cmd";

export default class double_shoot {
    /**
     * 进入区间
     */
    static enter_zone(body) {
        websocket.send_cmd(Stype.DOUBLE_GAME, Cmd.DOUBLE_GAME.ENTER_ZONE, body);
    }
    /**
     * 退出区间
     */
    static quit_zone(body) {
        websocket.send_cmd(Stype.DOUBLE_GAME, Cmd.DOUBLE_GAME.QUIT_ZONE, body);
    }
    /**
     * 玩家点击准备, 服务器开始为匹配敌人
     */
    static player_ready(body) {
        websocket.send_cmd(Stype.DOUBLE_GAME, Cmd.DOUBLE_GAME.PLAYER_READY, body)
    }
    /**
     * 玩家取消准备
     */
    static player_unready(body) {
        websocket.send_cmd(Stype.DOUBLE_GAME, Cmd.DOUBLE_GAME.PLAYER_UNREADY, body)
    }
    /**
     * 进入房间
     */
    static enter_room(body) {
        websocket.send_cmd(Stype.DOUBLE_GAME, Cmd.DOUBLE_GAME.ENTER_ROOM, body);
    }
    /**
     * 退出房间
     */
    static quit_room(body) {
        websocket.send_cmd(Stype.DOUBLE_GAME, Cmd.DOUBLE_GAME.QUIT_ROOM, body);
    }
}