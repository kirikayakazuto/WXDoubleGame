export default class Cmd {
    // 全局的命令号，当我们的用户丢失链接的时候，
	// 所有的服务都会收到网关转发过来的这个时间这个消息
    static USER_DISCONNECT = 10000;
    static BROADCAST = 10001;

    static Auth = {
        
        GET_WX_INFO: 1,    // 获取签名
        OPENID_LOGIN: 2,    // 登录
    }

    static GameSystem = {
        GET_GAME_INFO: 1,   // 获取游戏信息
        LOGIN_BONUES_INFO: 2, // 获取登录奖励
        RECV_LOGIN_BUNUES: 3, // 发放登录奖励
        GET_WORLD_RANK_INFO: 4, // 获取世界全局的排行榜信息
    }
    
    static DOUBLE_GAME = {
        ENTER_ZONE: 1, // 进入游戏区间
        QUIT_ZONE: 2, // 退出游戏区间
        
        ENTER_ROOM: 3, // 玩家进入房间
        QUIT_ROOM: 4, // 玩家离开房间;
        
        PLAYER_READY: 5,    // 玩家准备
        PLAYER_UNREADY: 6, // 玩家取消准备


        SITDOWN: 7, // 玩家坐下
        STANDUP: 8, // 玩家站起,

        USER_ARRIVED: 9, // 其他玩家抵达,

        ROUND_START: 13, // 游戏开始了        

        PLAYER_MOVE: 15,    // 玩家移动 1, -1, 0
    }
}