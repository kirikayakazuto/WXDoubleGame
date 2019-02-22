import websocket from "../modules/websocket"
import Stype from "../Stype"
import Cmd from "../Cmd"

/**
 *  -------------------- 用户登录验证  中心 -----------------
 */
export default class auth {
    
    static get_wx_info(code: string, encryptedData: string, iv: string) {
        let body = [code, encryptedData, iv];
        websocket.send_cmd(Stype.Auth, Cmd.Auth.GET_WX_INFO, body)
    }

    static player_login(body: any) {
        websocket.send_cmd(Stype.Auth, Cmd.Auth.OPENID_LOGIN, body);
    }
}