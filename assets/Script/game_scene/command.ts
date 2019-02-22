export default class Command {
    seatId: number;     // 座位号, 对应玩家
    stepTime: number;        // 改命令的帧数
    command: string;     // 命令的详细信息 

    constructor(seatId: number, stepTime: number) {
        this.seatId = seatId;
        this.stepTime = stepTime;
    }
} 